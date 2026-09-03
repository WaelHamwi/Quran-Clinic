import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View, type ListRenderItem } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { IconButton } from '@/components/common/IconButton';
import { useDownloadManager } from '@/hooks/common/useDownloadManager';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type CompletedDownload,
  type DownloadTask,
  type OtherDownload,
  selectOtherDownloads,
  removeOtherDownload,
  addOtherDownload,
  setOtherDownloadSize,
} from '@/store/slices/downloadsSlice';
import { formatBytes } from '@/utils/formatters';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/downloadsScreen.styles';
import { audioService } from '@/services/player/audioService';
import { showToast } from '@/store/slices/uiSlice';

type DownloadItem =
  | ({ type: 'active' } & DownloadTask)
  | ({ type: 'ruqyah' } & CompletedDownload)
  | ({ type: 'mushaf'; surahId: number; reciterId: number } & OtherDownload)
  | ({ type: 'qcf4' } & OtherDownload);

export default function DownloadsScreen() {
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);
  const dispatch = useAppDispatch();
  const { downloads, tasks, storageUsed, cancel, deleteDownload, clearAll, refreshStorage } =
    useDownloadManager();
  const otherDownloads = useAppSelector(selectOtherDownloads);
  const [device, setDevice] = useState<{ free: number; total: number }>({ free: 0, total: 0 });

  // Downloads still running, newest first. They live above the finished list so
  // the user can watch one arrive without hunting for it, and they leave on
  // their own: completing moves the entry into `downloads`.
  const activeItems = useMemo<DownloadItem[]>(
    () =>
      Object.values(tasks)
        .filter((task) => task.status === 'downloading' || task.status === 'pending')
        .map((task) => ({ ...task, type: 'active' as const })),
    [tasks],
  );

  const items = useMemo(() => {
    const ruqyah = Object.values(downloads).map(
      (item) => ({ ...item, type: 'ruqyah' as const })
    );
    const others = Object.entries(otherDownloads).map(([id, item]) => {
      if (item.type === 'mushaf') {
        const [, surahStr, reciterStr] = id.split('_');
        return {
          ...item,
          type: 'mushaf' as const,
          surahId: parseInt(surahStr, 10),
          reciterId: parseInt(reciterStr, 10),
        };
      }
      return { ...item, type: 'qcf4' as const };
    });
    return [...ruqyah, ...others].sort((a, b) => b.downloadedAt - a.downloadedAt);
  }, [downloads, otherDownloads]);

  // The count and "clear all" in the header speak for what is actually stored,
  // so a running download joins the list without being counted as saved yet.
  const listData = useMemo<DownloadItem[]>(() => [...activeItems, ...items], [activeItems, items]);

  // Discover existing Mushaf downloads that aren't yet in Redux
  const discoverDownloads = useCallback(async () => {
    try {
      const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
      const dir = `${base}audio`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(dir);
      for (const f of files) {
        if (!f.startsWith('surah_') || !f.endsWith('.mp3')) continue;

        const match = f.match(/surah_(\d+)_reciter_(\d+)/);
        if (!match) continue;

        const [, surahStr, reciterStr] = match;
        const id = `mushaf_${surahStr}_${reciterStr}`;
        if (id in otherDownloads) continue;

        const fileInfo = await FileSystem.getInfoAsync(`${dir}/${f}`);
        if (fileInfo.exists && !fileInfo.isDirectory) {
          dispatch(
            addOtherDownload({
              id,
              type: 'mushaf',
              title: `Surah ${surahStr}`,
              size: fileInfo.size,
              downloadedAt: fileInfo.modificationTime ?? Date.now(),
            })
          );
        }
      }

      const qcf4Dir = `${base}qcf4/fonts`;
      const qcf4Info = await FileSystem.getInfoAsync(qcf4Dir);
      if (qcf4Info.exists) {
        // Fonts accumulate page by page as the user reads, so re-measure on
        // every focus: register the entry on first sight, and keep its size in
        // sync afterwards.
        const size = await audioService.getQcf4StorageUsage();
        if (size > 0) {
          const existing = otherDownloads['qcf4-pack'];
          if (!existing) {
            dispatch(
              addOtherDownload({
                id: 'qcf4-pack',
                type: 'qcf4',
                title: 'Madina Mushaf Fonts',
                size,
                downloadedAt: qcf4Info.modificationTime ?? Date.now(),
              })
            );
          } else if (existing.size !== size) {
            dispatch(setOtherDownloadSize({ id: 'qcf4-pack', size }));
          }
        }
      }
    } catch {
      // Silently ignore discovery errors
    }
  }, [otherDownloads, dispatch]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([discoverDownloads(), refreshStorage()]).then(([, d]) => {
        if (active) setDevice(d);
      });
      return () => {
        active = false;
      };
    }, [discoverDownloads, refreshStorage]),
  );

  const { appPct, otherPct } = useMemo(() => {
    const total = device.total || 0;
    if (total <= 0) return { appPct: 0, otherPct: 0 };
    const deviceUsed = Math.max(0, total - device.free);
    const app = Math.min(100, (storageUsed / total) * 100);
    const other = Math.max(0, Math.min(100 - app, ((deviceUsed - storageUsed) / total) * 100));
    return { appPct: app, otherPct: other };
  }, [device, storageUsed]);

  const handleRemoveRuqyah = useCallback(
    (recordingId: number) => {
      Alert.alert(t.more.removeDownloadTitle, t.more.removeDownloadBody, [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.remove,
          style: 'destructive',
          onPress: () => void deleteDownload(recordingId),
        },
      ]);
    },
    [deleteDownload, t],
  );

  const handleCancelDownload = useCallback(
    (recordingId: number) => {
      Alert.alert(t.more.cancelDownloadTitle, t.more.cancelDownloadBody, [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.remove,
          style: 'destructive',
          onPress: () => void cancel(recordingId),
        },
      ]);
    },
    [cancel, t],
  );

  const handleRemoveMushaf = useCallback(
    (surahId: number, reciterId: number, id: string) => {
      Alert.alert(
        t.more.removeDownloadTitle,
        t.reader.deleteAudioConfirm || t.more.removeDownloadBody,
        [
          { text: t.common.cancel, style: 'cancel' },
          {
            text: t.common.remove,
            style: 'destructive',
            onPress: async () => {
              try {
                await audioService.deleteMushafAudio(surahId, reciterId);
                dispatch(removeOtherDownload(id));
                dispatch(showToast({ message: t.reader.audioDeleted || 'Deleted', type: 'success' }));
                void refreshStorage();
              } catch (error) {
                dispatch(
                  showToast({
                    message: (error as Error).message,
                    type: 'error',
                  })
                );
              }
            },
          },
        ]
      );
    },
    [dispatch, t, refreshStorage],
  );

  const handleRemoveQcf4 = useCallback(() => {
    Alert.alert(
      t.more.removeDownloadTitle,
      t.reader.deleteFontConfirm || t.more.removeDownloadBody,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.remove,
          style: 'destructive',
          onPress: async () => {
            try {
              await audioService.deleteQcf4FontPack();
              dispatch(removeOtherDownload('qcf4-pack'));
              dispatch(
                showToast({ message: t.reader.fontDeleted || 'Deleted', type: 'success' })
              );
              void refreshStorage();
            } catch (error) {
              dispatch(
                showToast({
                  message: (error as Error).message,
                  type: 'error',
                })
              );
            }
          },
        },
      ]
    );
  }, [dispatch, t, refreshStorage]);

  const handleClearAll = useCallback(() => {
    Alert.alert(t.more.clearAllConfirmTitle, t.more.clearAllConfirmBody, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.clear, style: 'destructive', onPress: () => void clearAll() },
    ]);
  }, [clearAll, t]);

  const renderItem = useCallback<ListRenderItem<DownloadItem>>(
    ({ item }) => {
      let title = '';
      let subtitle = '';
      let icon = 'musical-note';
      let onDelete: () => void = () => {};

      // A wird's own name plus which of its two ruqyahs this is — both are
      // needed, since the summarized and detailed ones share the name.
      const wirdSubtitle = (entry: { subtitle?: string | null; sessionNumber: number }) =>
        [entry.subtitle, t.disease.session(entry.sessionNumber)].filter(Boolean).join(' · ');

      if (item.type === 'active') {
        const pct = Math.min(100, Math.max(0, Math.round(item.progress * 100)));
        return (
          <View style={[s.row, isArabic && s.rowRtl]}>
            <View style={s.rowIconWrap}>
              <Ionicons name="cloud-download-outline" size={20} color={theme.primary} />
            </View>
            <View style={[s.rowTexts, isArabic && s.rowTextsRtl]}>
              <Text style={[s.rowTitle, isArabic && s.textRtl]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[s.rowMeta, isArabic && s.textRtl]} numberOfLines={1}>
                {wirdSubtitle(item)}
              </Text>
              <Text style={[s.rowMeta, s.rowMetaAccent, isArabic && s.textRtl]}>
                {t.disease.downloadingPercent(pct)}
                {item.totalBytes > 0 ? ` · ${formatBytes(item.totalBytes)}` : ''}
              </Text>
              <View style={[s.rowProgressTrack, isArabic && s.rowProgressTrackRtl]}>
                <View style={[s.rowProgressFill, { width: `${pct}%` }]} />
              </View>
            </View>
            <IconButton
              icon="close"
              color={theme.error}
              onPress={() => handleCancelDownload(item.recordingId)}
            />
          </View>
        );
      }

      if (item.type === 'ruqyah') {
        title = item.title;
        subtitle = wirdSubtitle(item);
        onDelete = () => handleRemoveRuqyah(item.recordingId);
      } else if (item.type === 'mushaf') {
        title = item.title;
        subtitle = item.subtitle || '';
        icon = 'book';
        onDelete = () => handleRemoveMushaf(item.surahId, item.reciterId, `mushaf_${item.surahId}_${item.reciterId}`);
      } else {
        title = item.title;
        subtitle = item.subtitle || '';
        icon = 'text';
        onDelete = handleRemoveQcf4;
      }

      return (
        <View style={[s.row, isArabic && s.rowRtl]}>
          <View style={s.rowIconWrap}>
            <Ionicons name={icon as any} size={20} color={theme.primary} />
          </View>
          <View style={[s.rowTexts, isArabic && s.rowTextsRtl]}>
            <Text style={[s.rowTitle, isArabic && s.textRtl]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[s.rowMeta, isArabic && s.textRtl]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
            <Text style={[s.rowMeta, isArabic && s.textRtl]}>{formatBytes(item.size)}</Text>
          </View>
          <IconButton icon="trash-outline" color={theme.error} onPress={onDelete} />
        </View>
      );
    },
    [
      isArabic,
      t,
      theme,
      s,
      handleRemoveRuqyah,
      handleRemoveMushaf,
      handleRemoveQcf4,
      handleCancelDownload,
    ],
  );

  const ListHeader = useMemo(
    () => (
      <View style={s.header}>
        <View style={s.card}>
          <View style={[s.cardHeaderRow, isArabic && s.cardHeaderRowRtl]}>
            <View style={s.cardIconWrap}>
              <Ionicons name="phone-portrait-outline" size={18} color={theme.primary} />
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
              <View style={[s.legendDot, { backgroundColor: theme.primary }]} />
              <Text style={s.legendLabel}>{t.more.usedByDownloads}</Text>
            </View>
            <View style={[s.legendItem, isArabic && s.legendItemRtl]}>
              <View style={[s.legendDot, { backgroundColor: theme.success }]} />
              <Text style={s.legendLabel}>{t.more.freeSpace}</Text>
              <Text style={s.legendValue}>{formatBytes(device.free)}</Text>
            </View>
          </View>
        </View>

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
              <Ionicons name="trash-outline" size={14} color={theme.error} />
              <Text style={s.clearAllText}>{t.more.clearAll}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    ),
    [isArabic, t, storageUsed, device.free, appPct, otherPct, items.length, handleClearAll, s, theme],
  );

  return (
    <Screen edges={['top']}>
      <Header title={t.more.downloads} />
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => {
          if (item.type === 'active') return `active_${item.recordingId}`;
          if (item.type === 'ruqyah') return `ruqyah_${item.recordingId}`;
          if (item.type === 'mushaf') return `mushaf_${item.surahId}_${item.reciterId}`;
          return 'qcf4_pack';
        }}
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
