import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearInbox,
  markInboxSeen,
  pruneInbox,
  selectInboxItems,
  type InboxNotification,
} from '@/store/slices/notificationInboxSlice';
import {
  notificationInboxStyles as s,
  ICON_BRAND,
  EMPTY_ICON_COLOR,
} from '@/styles/notificationInboxScreen.styles';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ICON_FOR_TYPE: Record<string, IoniconName> = {
  morning: 'sunny-outline',
  evening: 'partly-sunny-outline',
  sleep: 'moon-outline',
  waking: 'alarm-outline',
  reminder: 'notifications-outline',
};

function formatTime(ms: number): string {
  const d = new Date(ms);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function NotificationInboxScreen() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectInboxItems);

  // Opening the inbox drops yesterday's reminders and clears the unread dot.
  useEffect(() => {
    dispatch(pruneInbox());
    dispatch(markInboxSeen());
  }, [dispatch]);

  const onClear = useCallback(() => dispatch(clearInbox()), [dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: InboxNotification }) => (
      <View style={s.item}>
        <View style={s.iconBubble}>
          <Ionicons
            name={ICON_FOR_TYPE[item.type] ?? ICON_FOR_TYPE.reminder}
            size={20}
            color={ICON_BRAND}
          />
        </View>
        <View style={s.itemTexts}>
          <Text style={s.itemTitle}>{item.title}</Text>
          {item.body ? <Text style={s.itemBody}>{item.body}</Text> : null}
          <Text style={s.itemTime}>
            {t.notifications.inboxToday} · {formatTime(item.receivedAt)}
          </Text>
        </View>
      </View>
    ),
    [t.notifications.inboxToday],
  );

  const footer = useMemo(
    () =>
      items.length > 0 ? (
        <Pressable style={s.clearBtn} onPress={onClear} hitSlop={8}>
          <Text style={s.clearText}>{t.notifications.inboxClear}</Text>
        </Pressable>
      ) : null,
    [items.length, onClear, t.notifications.inboxClear],
  );

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.notifications.inboxTitle} showBack />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={footer}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={EMPTY_ICON_COLOR} />
            <Text style={s.emptyTitle}>{t.notifications.inboxEmpty}</Text>
            <Text style={s.emptyDesc}>{t.notifications.inboxEmptyDesc}</Text>
          </View>
        }
      />
    </Screen>
  );
}
