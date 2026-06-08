import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
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

export function CountryPickerModal({ visible, selected, onSelect, onClose }: Props) {
  const { language, isArabic } = useLanguage();
  const labels = LABELS[language];
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.en.toLowerCase().includes(q) || c.ar.includes(query.trim()),
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
      </Pressable>
    </Modal>
  );
}
