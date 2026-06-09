import React, { useCallback, useMemo } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { IconButton } from '@/components/common/IconButton';
import { Button } from '@/components/common/Button';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import type { CompletedDownload } from '@/store/slices/downloadsSlice';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';
import { formatBytes } from '@/utils/formatters';

export default function DownloadsScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { downloads, storageUsed, deleteDownload, clearAll } = useDownloadManager();

  const items = useMemo(() => Object.values(downloads), [downloads]);

  const handleClearAll = useCallback(() => {
    Alert.alert(t.more.clearAll, t.favorites.removeMessage, [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.clear, style: 'destructive', onPress: () => void clearAll() },
    ]);
  }, [clearAll, t]);

  const renderItem = useCallback<ListRenderItem<CompletedDownload>>(
    ({ item }) => (
      <View style={styles.row}>
        <Ionicons name="musical-note" size={20} color={theme.primary} />
        <View style={styles.rowTexts}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowMeta}>
            {t.disease.session(item.sessionNumber)} · {formatBytes(item.size)}
          </Text>
        </View>
        <IconButton
          icon="trash-outline"
          color={theme.error}
          onPress={() => void deleteDownload(item.recordingId)}
        />
      </View>
    ),
    [styles, theme, t, deleteDownload],
  );

  return (
    <Screen>
      <Header title={t.more.downloads} />
      {items.length === 0 ? (
        <EmptyState icon="download-outline" title={t.more.noDownloads} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.recordingId)}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.storage}>{t.more.storageUsed(formatBytes(storageUsed))}</Text>
              <Button
                title={t.more.clearAll}
                onPress={handleClearAll}
                variant="outline"
              />
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </Screen>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: { padding: spacing.lg },
    header: { gap: spacing.md, marginBottom: spacing.lg },
    storage: { fontSize: fontSize.sm, color: theme.textSecondary },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    rowTexts: { flex: 1, gap: 2 },
    rowTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: theme.text },
    rowMeta: { fontSize: fontSize.xs, color: theme.textMuted },
    separator: { height: spacing.sm },
  });
}
