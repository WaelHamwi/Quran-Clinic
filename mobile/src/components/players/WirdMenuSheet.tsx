import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme/colors';
import { wirdMenuStyles as s } from './WirdMenuSheet.styles';

export interface WirdMenuItem {
  id: number;
  accessible: boolean;
}

interface WirdMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  items: WirdMenuItem[];
  /** Index of the wird currently on screen. */
  activeIndex: number;
  isArabic: boolean;
  title: string;
  /** Localized wird name for the 1-based session number. */
  sessionLabel: (n: number) => string;
  onSelect: (index: number) => void;
}

/**
 * Bottom-sheet list of every wird in the disease (Figma node 18975:3626).
 * Opened from the WirdPager centre pill. Each row shows the wird name and its
 * two-digit number; locked wird show a lock glyph.
 */
function WirdMenuSheetBase({
  visible,
  onClose,
  items,
  activeIndex,
  isArabic,
  title,
  sessionLabel,
  onSelect,
}: WirdMenuSheetProps) {
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.sheet, { paddingBottom: Math.max(bottomInset + 16, 40) }]} onPress={() => {}}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
            {items.map((item, idx) => {
              const active = idx === activeIndex;
              const number = String(idx + 1).padStart(2, '0');
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelect(idx)}
                  style={[
                    s.row,
                    { flexDirection: isArabic ? 'row' : 'row-reverse' },
                    active && s['row--active'],
                  ]}
                >
                  <Ionicons
                    name={item.accessible ? 'reorder-three-outline' : 'lock-closed'}
                    size={20}
                    color={item.accessible ? palette.text.tertiary : palette.text.placeholder}
                  />
                  <View style={[s.labelGroup, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
                    <Text
                      style={[s.name, { textAlign: isArabic ? 'right' : 'left' }]}
                      numberOfLines={1}
                    >
                      {sessionLabel(idx + 1)}
                    </Text>
                    <View style={s.numberBadge}>
                      <Text style={s.numberText}>{number}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const WirdMenuSheet = React.memo(WirdMenuSheetBase);
