import React, { useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { palette, type Theme } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { fontSize, fontFamily } from '@/theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function SearchBarBase({ value, onChangeText, placeholder, autoFocus }: SearchBarProps) {
  const { theme } = useTheme();
  const { isArabic } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, isArabic && styles.containerRtl]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.text.placeholder}
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

// Figma RTL Input Field/Text (17941:2320): white bg, #d5d7da border, h-40, pill,
// px-16 py-8, placeholder Alexandria Light 14/20 #717680.
function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: palette.bg.primary,
      borderRadius: radius.pill,
      paddingHorizontal: 16,
      paddingVertical: 8,
      height: 40,
      borderWidth: 1,
      borderColor: palette.border.primary,
    },
    containerRtl: {
      flexDirection: 'row-reverse',
    },
    input: {
      flex: 1,
      fontSize: fontSize.sm,
      lineHeight: 20,
      color: theme.text,
      paddingVertical: 0,
      fontFamily: fontFamily.alexandriaLight,
    },
  });
}

export const SearchBar = React.memo(SearchBarBase);
