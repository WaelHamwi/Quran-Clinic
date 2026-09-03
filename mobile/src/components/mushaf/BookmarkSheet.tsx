import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createReaderStyles } from '@/styles/reader.styles';
import { palette } from '@/theme/colors';

type Props<B> = {
  visible: boolean;
  onClose: () => void;
  /** Pre-formatted "page X / Y" label for whatever page the reader is on —
   *  each reader (classic chunk-page vs. Madani print-page) numbers pages
   *  differently, so the caller formats it rather than this sheet. */
  currentLabel: string;
  isCurrentBookmarked: boolean;
  onToggleBookmark: () => void;
  bookmarks: B[];
  bookmarkKey: (b: B) => string;
  bookmarkLabel: (b: B) => string;
  onGoToBookmark: (b: B) => void;
};

/** Bottom sheet to bookmark the current page and jump to pages bookmarked in
 *  this surah. Generic over the bookmark shape so both Mushaf readers (whose
 *  "page" means different things) can share it. */
export function BookmarkSheet<B>({
  visible,
  onClose,
  currentLabel,
  isCurrentBookmarked,
  onToggleBookmark,
  bookmarks,
  bookmarkKey,
  bookmarkLabel,
  onGoToBookmark,
}: Props<B>) {
  const { t, isArabic } = useLanguage();
  const styles = useStyles(createReaderStyles);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.bookmarkOverlay} onPress={onClose}>
        <Pressable style={styles.bookmarkSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.bookmarkSheetHandle} />
          <Text style={styles.bookmarkSheetTitle}>{t.reader.bookmarks}</Text>

          <View style={styles.bookmarkCurrentRow}>
            <Text style={styles.bookmarkCurrentLabel}>{currentLabel}</Text>
            <TouchableOpacity
              style={[styles.bookmarkCurrentBtn, isCurrentBookmarked && styles.bookmarkCurrentBtnActive]}
              onPress={onToggleBookmark}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isCurrentBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={14}
                color={isCurrentBookmarked ? palette.text.onBrand : palette.mushaf.titleBorderGold}
              />
              <Text style={[styles.bookmarkCurrentBtnText, isCurrentBookmarked && styles.bookmarkCurrentBtnTextActive]}>
                {isCurrentBookmarked ? t.reader.removeBookmark : t.reader.bookmarkThisPage}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bookmarkDivider} />

          {bookmarks.length === 0 ? (
            <Text style={styles.bookmarkListEmpty}>{t.reader.noBookmarks}</Text>
          ) : (
            <ScrollView style={styles.bookmarkList}>
              {bookmarks.map((b) => (
                <TouchableOpacity
                  key={bookmarkKey(b)}
                  style={[
                    styles.bookmarkListItem,
                    isArabic && { flexDirection: 'row-reverse' },
                  ]}
                  onPress={() => onGoToBookmark(b)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="bookmark" size={14} color={palette.mushaf.titleBorderGold} />
                  <Text style={styles.bookmarkListItemText}>{bookmarkLabel(b)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
