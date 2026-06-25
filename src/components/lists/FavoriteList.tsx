import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type PanResponderInstance,
  type RefreshControlProps,
} from 'react-native';
import { FavoriteRow } from '@/components/lists/FavoriteRow';
import { favoriteListStyles as s, ROW_GAP } from './FavoriteList.styles';
import { favoriteKey, type FavoriteItem } from '@/store/slices/favoritesSlice';

interface FavoriteListProps {
  favorites: FavoriteItem[];
  onItemPress: (route: string) => void;
  /** Persist a new order (list of `${kind}:${id}` keys) after a drag. */
  onReorder?: (orderedKeys: string[]) => void;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const keyOf = (f: FavoriteItem) => favoriteKey(f.favoriteKind, f.id);

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

/**
 * Vertical list of favorited diseases / nodes — Figma "Favorite page" (18284:3417).
 *
 * Rows are fixed-height and laid out in normal flow; the drag handle owns a
 * PanResponder that lets the user pick a row up and reorder it. The active row
 * follows the finger while the others spring to make room — committed to Redux
 * on release. Uses only RN `Animated` + `PanResponder` (no Reanimated) to match
 * the rest of the app and avoid a native rebuild.
 */
export function FavoriteList({
  favorites,
  onItemPress,
  onReorder,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshControl,
}: FavoriteListProps) {
  const [order, setOrder] = useState<string[]>(() => favorites.map(keyOf));
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [rowH, setRowH] = useState(0);

  const itemsByKey = useMemo(() => {
    const m: Record<string, FavoriteItem> = {};
    for (const f of favorites) m[keyOf(f)] = f;
    return m;
  }, [favorites]);

  const propKeys = useMemo(() => favorites.map(keyOf), [favorites]);
  const propKeysStr = propKeys.join('|');

  const slot = rowH > 0 ? rowH + ROW_GAP : 0;

  // Mutable refs so each row's PanResponder can be created once yet always read
  // the latest committed order / slot height.
  const orderRef = useRef(order);
  const slotRef = useRef(slot);
  const onReorderRef = useRef(onReorder);
  const posRef = useRef<Record<string, Animated.Value>>({});
  const responderRef = useRef<Record<string, PanResponderInstance>>({});
  const activeKeyRef = useRef<string | null>(null);
  const startIndexRef = useRef(0);
  const lastTargetRef = useRef(0);
  orderRef.current = order;
  slotRef.current = slot;
  onReorderRef.current = onReorder;

  const getPos = useCallback((key: string): Animated.Value => {
    if (!posRef.current[key]) posRef.current[key] = new Animated.Value(0);
    return posRef.current[key];
  }, []);

  // Resync to props when favorites are added/removed/changed (never mid-drag).
  useEffect(() => {
    if (activeKeyRef.current) return;
    setOrder(propKeys);
    for (const k of propKeys) getPos(k).setValue(0);
  }, [propKeysStr, propKeys, getPos]);

  const finishDrag = useCallback(
    (key: string) => {
      const sl = slotRef.current;
      const committed = orderRef.current;
      const startIndex = startIndexRef.current;
      const target = lastTargetRef.current;
      const display = moveItem(committed, startIndex, target);
      const finalOffset = (target - startIndex) * sl;

      Animated.spring(getPos(key), {
        toValue: finalOffset,
        useNativeDriver: true,
        bounciness: 0,
        speed: 18,
      }).start(() => {
        // New DOM order matches the dragged result, so all offsets reset to 0
        // with no visual jump (each row already sits at its target slot).
        for (const k of committed) getPos(k).setValue(0);
        activeKeyRef.current = null;
        setActiveKey(null);
        setOrder(display);
        if (target !== startIndex) onReorderRef.current?.(display);
      });
    },
    [getPos],
  );

  const getResponder = useCallback(
    (key: string): PanResponderInstance => {
      const existing = responderRef.current[key];
      if (existing) return existing;
      const pr = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          activeKeyRef.current = key;
          startIndexRef.current = orderRef.current.indexOf(key);
          lastTargetRef.current = startIndexRef.current;
          getPos(key).setValue(0);
          setActiveKey(key);
        },
        onPanResponderMove: (_e, g) => {
          const sl = slotRef.current;
          if (sl <= 0) return;
          const committed = orderRef.current;
          const startIndex = startIndexRef.current;
          const n = committed.length;
          getPos(key).setValue(g.dy); // active follows the finger

          const target = Math.max(0, Math.min(n - 1, startIndex + Math.round(g.dy / sl)));
          if (target === lastTargetRef.current) return;
          lastTargetRef.current = target;

          // Spring every other row to the slot it occupies in the display order.
          const display = moveItem(committed, startIndex, target);
          for (const k of committed) {
            if (k === key) continue;
            const from = committed.indexOf(k);
            const to = display.indexOf(k);
            Animated.spring(getPos(k), {
              toValue: (to - from) * sl,
              useNativeDriver: true,
              bounciness: 0,
              speed: 20,
            }).start();
          }
        },
        onPanResponderRelease: () => finishDrag(key),
        onPanResponderTerminate: () => finishDrag(key),
      });
      responderRef.current[key] = pr;
      return pr;
    },
    [getPos, finishDrag],
  );

  const onFirstLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      if (h > 0) setRowH((prev) => (prev === 0 ? h : prev));
    },
    [],
  );

  const draggable = order.length > 1 && slot > 0;

  return (
    <ScrollView
      scrollEnabled={!activeKey}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {ListHeaderComponent}
      {order.length === 0 ? (
        ListEmptyComponent
      ) : (
        <View style={s.dragArea}>
          {order.map((key) => {
            const item = itemsByKey[key];
            if (!item) return null;
            const isActive = key === activeKey;
            return (
              <Animated.View
                key={key}
                onLayout={rowH === 0 ? onFirstLayout : undefined}
                style={[
                  s.rowWrap,
                  { transform: [{ translateY: getPos(key) }], zIndex: isActive ? 10 : 1 },
                ]}
              >
                <FavoriteRow
                  favorite={item}
                  onPress={onItemPress}
                  isActive={isActive}
                  dragHandleProps={draggable ? getResponder(key).panHandlers : undefined}
                />
              </Animated.View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
