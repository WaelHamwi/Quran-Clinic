import React, { useCallback } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import type { Reciter } from '@/types/reciter';
import { createStyles } from './ReciterPickerModal.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  filteredReciters: Reciter[];
  selectedReciterId: number | null;
  onSelect: (id: number | null) => void;
  reciterSearch: string;
  onSearchChange: (q: string) => void;
};

export function ReciterPickerModal({
  visible,
  onClose,
  filteredReciters,
  selectedReciterId,
  onSelect,
  reciterSearch,
  onSearchChange,
}: Props) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const renderItem = useCallback(
    ({ item }: { item: Reciter }) => (
      <TouchableOpacity
        style={[s.row, selectedReciterId === item.id && s.rowActive]}
        onPress={() => onSelect(item.id)}
      >
        <View style={s.rowContent}>
          <Text style={[s.rowName, selectedReciterId === item.id && s.rowNameActive]}>
            {language === 'ar' ? item.name.ar : (item.name.en ?? item.name.ar)}
          </Text>
          <Text style={s.rowNameAr}>
            {language === 'ar' ? (item.name.en ?? '') : item.name.ar}
          </Text>
        </View>
        {selectedReciterId === item.id && <Text style={s.check}>✓</Text>}
      </TouchableOpacity>
    ),
    [selectedReciterId, onSelect, language, s]
  );

  const ListHeader = (
    <TouchableOpacity
      style={[s.row, selectedReciterId === null && s.rowActive]}
      onPress={() => onSelect(null)}
    >
      <View style={s.rowContent}>
        <Text style={s.noneName}>{t.mushaf.none}</Text>
      </View>
      {selectedReciterId === null && <Text style={s.check}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.sheet}>
            <View style={s.handle} />

            <View style={s.header}>
              <Text style={s.title}>{t.mushaf.selectReciter}</Text>
              <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                <Text style={s.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={s.searchWrap}>
              <TextInput
                style={s.searchInput}
                placeholder={t.mushaf.searchReciter}
                placeholderTextColor={theme.textPlaceholder}
                value={reciterSearch}
                onChangeText={onSearchChange}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
            </View>

            <FlatList
              data={filteredReciters}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              style={s.list}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={ListHeader}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
