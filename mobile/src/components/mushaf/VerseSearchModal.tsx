import React from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createReaderStyles } from '@/styles/reader.styles';
import { palette } from '@/theme/colors';
import { splitByMatch } from '@/utils/verseHighlight';
import type { Verse } from '@/types/verse';

type Props = {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: Verse[] | null;
  setSearchResults: React.Dispatch<React.SetStateAction<Verse[] | null>>;
  isSearching: boolean;
  isQueryTooShort: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onSearch: (query: string) => void;
  onResultPress: (result: Verse) => void;
};

/** Top-anchored verse search — accepts free text or a "2:255" verse reference. */
export function VerseSearchModal({
  visible,
  onClose,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  isQueryTooShort,
  isLoadingMore,
  onLoadMore,
  onSearch,
  onResultPress,
}: Props) {
  const { t, isArabic } = useLanguage();
  const styles = useStyles(createReaderStyles);
  const { top: topInset } = useSafeAreaInsets();

  const renderHighlighted = (text: string) =>
    splitByMatch(text, searchQuery).map((seg, i) =>
      seg.match ? (
        <Text key={i} style={styles.searchResultMatch}>{seg.text}</Text>
      ) : (
        seg.text
      )
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.searchOverlay} onPress={onClose}>
        <Pressable
          style={[styles.searchSheet, { marginTop: topInset + 8 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.bookmarkSheetTitle}>{t.reader.searchTitle}</Text>

          <View style={styles.searchInputRow}>
            <TouchableOpacity
              style={styles.searchClearBtn}
              onPress={() => onSearch(searchQuery)}
              hitSlop={8}
            >
              <Ionicons name="search" size={18} color={palette.mushaf.titleBorderGold} />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, isArabic && { textAlign: 'right' }]}
              placeholder={t.reader.searchPlaceholder}
              placeholderTextColor={palette.text.placeholder}
              value={searchQuery}
              onChangeText={(text) => { setSearchQuery(text); setSearchResults(null); }}
              onSubmitEditing={(e) => onSearch(e.nativeEvent.text)}
              returnKeyType="search"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.searchClearBtn}
                onPress={() => { setSearchQuery(''); setSearchResults(null); }}
              >
                <Ionicons name="close-circle" size={18} color={palette.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.searchHintText}>{t.reader.searchHint}</Text>

          {isSearching ? (
            <ActivityIndicator color={palette.mushaf.titleBorderGold} style={{ marginTop: 24 }} />
          ) : searchResults !== null && searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.id)}
              style={styles.searchResultList}
              keyboardShouldPersistTaps="handled"
              onEndReached={onLoadMore}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                isLoadingMore ? (
                  <ActivityIndicator color={palette.mushaf.titleBorderGold} style={{ marginVertical: 12 }} />
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => onResultPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchResultArabic} numberOfLines={2}>
                    {renderHighlighted(item.text.ar)}
                  </Text>
                  {Boolean(item.text.en) && (
                    <Text style={styles.searchResultEnglish} numberOfLines={1}>
                      {renderHighlighted(item.text.en ?? '')}
                    </Text>
                  )}
                  <Text style={styles.searchResultMeta}>
                    {t.reader.verseRef(item.surah_id, item.verse_number)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : searchResults !== null ? (
            <Text style={styles.searchEmpty}>{t.reader.searchEmpty}</Text>
          ) : isQueryTooShort ? (
            <Text style={styles.searchEmpty}>{t.reader.searchTooShort}</Text>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
