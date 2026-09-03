import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './SearchBar.styles';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function SearchBarBase({ value, onChangeText, placeholder, autoFocus }: SearchBarProps) {
  const { theme } = useTheme();
  const { isArabic } = useLanguage();
  const styles = useStyles(createStyles);

  return (
    <View style={[styles.container, isArabic && styles.containerRtl]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textPlaceholder}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={styles.input}
        textAlign={isArabic ? 'right' : 'left'}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={theme.textMuted} />
        </Pressable>
      ) : (
        <Ionicons name="search-outline" size={20} color={theme.textMuted} />
      )}
    </View>
  );
}

export const SearchBar = React.memo(SearchBarBase);
