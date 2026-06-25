import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontWeight, fontFamily } from '@/theme/typography';

interface GreetingProps {
  name?: string | null;
  avatarUri?: string;
}

function GreetingBase({ name }: GreetingProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <Text style={styles.text}>
        {name ? `أهلاً بك، ${name}` : 'أهلاً بك'}
      </Text>
      <View style={styles.avatar}>
        <Ionicons name="person" size={18} color={palette.brand[500]} />
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.md,
    },
    text: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: theme.text,
      fontFamily: fontFamily.alexandriaMedium,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: radius.pill,
      backgroundColor: palette.brand[25],
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export const Greeting = React.memo(GreetingBase);
