import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { COUNTRIES, type Country } from '@/data/countries';
import { palette } from '@/theme/colors';
import { countryPickerStyles as s } from './CountryPickerModal.styles';

const LABELS = {
  ar: { title: 'اختر الدولة', search: 'ابحث عن دولة...', empty: 'لا توجد نتائج' },
  en: { title: 'Select Country', search: 'Search country...', empty: 'No results found' },
} as const;

interface Props {
  visible: boolean;
  selected: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

// Fold away Arabic diacritics and unify the alef/ya/ta-marbuta variants so a search for
// "مصر" or "السعوديه" matches regardless of how the entry was typed.
function normalizeAr(value: string): string {
  return value
    .replace(/[ً-ْـ]/g, '')
    .replace(/[آأإ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

export function CountryPickerModal({ visible, selected, onSelect, onClose }: Props) {
  const { language, isArabic } = useLanguage();
  const labels = LABELS[language];
  const [query, setQuery] = useState('');

  // Clear the search whenever the sheet is dismissed so it reopens fresh — otherwise a
  // stale filter from the previous visit hides most of the list.
  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const filtered = useMemo(() => {
    const raw = query.trim();
    if (!raw) return COUNTRIES;
    const en = raw.toLowerCase();
    const ar = normalizeAr(raw);
    // Match against both languages regardless of the active locale, so the picker is usable
    // whichever script the user types.
    return COUNTRIES.filter(
      (c) => c.en.toLowerCase().includes(en) || normalizeAr(c.ar).includes(ar),
    );
  }, [query]);

  const renderItem = useCallback<ListRenderItem<Country>>(
    ({ item }) => {
      const isSelected = selected === item.en;
      return (
        <Pressable
          style={[s.row, isSelected && s.rowSelected]}
          onPress={() => {
            onSelect(item);
            setQuery('');
            onClose();
          }}
        >
          <Text style={[s.rowName, isArabic && { textAlign: 'right' }, isSelected && s.rowNameSelected]}>
            {language === 'ar' ? item.ar : item.en}
          </Text>
          {isSelected && (
            <Ionicons
              name="checkmark"
              size={18}
              color={palette.brand[500]}
              style={s.checkIcon}
            />
          )}
        </Pressable>
      );
    },
    [selected, language, isArabic, onSelect, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={s.sheet} onPress={() => {}}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.headerRow}>
            {isArabic ? (
              <>
                <Pressable style={s.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={18} color={palette.text.secondary} />
                </Pressable>
                <Text style={s.headerTitle}>{labels.title}</Text>
              </>
            ) : (
              <>
                <Text style={s.headerTitle}>{labels.title}</Text>
                <Pressable style={s.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={18} color={palette.text.secondary} />
                </Pressable>
              </>
            )}
          </View>

          {/* Search */}
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={16} color={palette.text.placeholder} />
            <TextInput
              style={[s.searchInput, isArabic && { textAlign: 'right' }]}
              value={query}
              onChangeText={setQuery}
              placeholder={labels.search}
              placeholderTextColor={palette.text.placeholder}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={palette.text.placeholder} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <FlatList<Country>
            data={filtered}
            keyExtractor={(item) => item.en}
            renderItem={renderItem}
            contentContainerStyle={s.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={s.empty}>{labels.empty}</Text>}
          />
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
