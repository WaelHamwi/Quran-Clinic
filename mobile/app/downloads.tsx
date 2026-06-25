import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View, type ListRenderItem } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { IconButton } from '@/components/common/IconButton';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import { useLanguage } from '@/context/LanguageContext';
import type { CompletedDownload } from '@/store/slices/downloadsSlice';
import { formatBytes } from '@/utils/formatters';
import {
  downloadsScreenStyles as s,
  STORAGE_APP_COLOR,
  STORAGE_FREE_COLOR,
  ROW_ICON_COLOR,
  ROW_REMOVE_COLOR,
} from '@/styles/downloadsScreen.styles';

export default function DownloadsScreen() {
  const { t, isArabic } = useLanguage();
  const { downloads, storageUsed, deleteDownload, clearAll, refreshStorage } = useDownloadManager();
  const [device, setDevice] = useState<{ free: number; total: number }>({ free: 0, total: 0 });

  const items = useMemo(
    () => Object.values(downloads).sort((a, b) => b.downloadedAt - a.downloadedAt),
    [downloads],
  );

  // Reconcile on-disk usage + read device capacity each time the screen is focused.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void refreshStorage().then((d) => {
        if (active) setDevice(d);
      });
      return () => {
        active = false;
      };
    }, [refreshStorage]),
  );

  // Bar segments as a fraction of total device capacity.
  const { appPct, otherPct } = useMemo(() => {
    const total = device.total || 0;
    if (total <= 0) return { appPct: 0, otherPct: 0 };
    const deviceUsed = Math.max(0, total - device.free);
    const app = Math.min(100, (storageUsed / total) * 100);
    const other = Math.max(0, Math.min(100 - app, ((deviceUsed - storageUsed) / total) * 100));
    return { appPct: app, otherPct: other };
  }, [device, storageUsed]);

  const handleRemove = useCallback(
    (item: CompletedDownload) => {
      Alert.alert(t.more.removeDownloadTitle, t.more.removeDownloadBody, [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.remove,
          style: 'destructive',
          onPress: () => void deleteDownload(item.recordingId),
        },
      ]);
    },
    [deleteDownload, t],
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(t.more.clearAllConfirmTitle, t.more.clearAllConfirmBody, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.clear, style: 'destructive', onPress: () => void clearAll() },
    ]);
  }, [clearAll, t]);

  const renderItem = useCallback<ListRenderItem<CompletedDownload>>(
    ({ item }) => (
      <View style={[s.row, isArabic && s.rowRtl]}>
        <View style={s.rowIconWrap}>
          <Ionicons name="musical-note" size={20} color={ROW_ICON_COLOR} />
        </View>
        <View style={[s.rowTexts, isArabic && s.rowTextsRtl]}>
          <Text style={[s.rowTitle, isArabic && s.textRtl]} numberOfLines={1}>
            {t.disease.session(item.sessionNumber)}
          </Text>
          <Text style={[s.rowMeta, isArabic && s.textRtl]}>{formatBytes(item.size)}</Text>
        </View>
        <IconButton icon="trash-outline" color={ROW_REMOVE_COLOR} onPress={() => handleRemove(item)} />
      </View>
    ),
    [isArabic, t, handleRemove],
  );

  const ListHeader = useMemo(
    () => (
      <View style={s.header}>
        {/* Device-storage summary */}
        <View style={s.card}>
          <View style={[s.cardHeaderRow, isArabic && s.cardHeaderRowRtl]}>
            <View style={s.cardIconWrap}>
              <Ionicons name="phone-portrait-outline" size={18} color={STORAGE_APP_COLOR} />
            </View>
            <Text style={[s.cardTitle, isArabic && s.cardTitleRtl]}>{t.more.deviceStorage}</Text>
            <Text style={s.cardUsedValue}>{formatBytes(storageUsed)}</Text>
          </View>

          <View style={[s.bar, isArabic && s.barRtl]}>
            <View style={[s.barApp, { width: `${appPct}%` }]} />
            <View style={[s.barOther, { width: `${otherPct}%` }]} />
          </View>

          <View style={[s.legendRow, isArabic && s.legendRowRtl]}>
            <View style={[s.legendItem, isArabic && s.legendItemRtl]}>
              <View style={[s.legendDot, { backgroundColor: STORAGE_APP_COLOR }]} />
              <Text style={s.legendLabel}>{t.more.usedByDownloads}</Text>
            </View>
            <View style={[s.legendItem, isArabic && s.legendItemRtl]}>
              <View style={[s.legendDot, { backgroundColor: STORAGE_FREE_COLOR }]} />
              <Text style={s.legendLabel}>{t.more.freeSpace}</Text>
              <Text style={s.legendValue}>{formatBytes(device.free)}</Text>
            </View>
          </View>
        </View>

        {/* Count + clear all */}
        {items.length > 0 ? (
          <View style={[s.listHeaderRow, isArabic && s.listHeaderRowRtl]}>
            <Text style={s.countText}>{t.more.recordingsCount(items.length)}</Text>
            <Pressable
              onPress={handleClearAll}
              hitSlop={8}
              style={({ pressed }) => [
                s.clearAllBtn,
                isArabic && s.clearAllBtnRtl,
                pressed && s.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={14} color={ROW_REMOVE_COLOR} />
              <Text style={s.clearAllText}>{t.more.clearAll}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    ),
    [isArabic, t, storageUsed, device.free, appPct, otherPct, items.length, handleClearAll],
  );

  return (
    <Screen edges={['top']}>
      <Header title={t.more.downloads} />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.recordingId)}
        contentContainerStyle={s.content}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="download-outline"
            title={t.more.noDownloads}
            message={t.more.noDownloadsHint}
          />
        }
        ItemSeparatorComponent={() => <View style={s.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
