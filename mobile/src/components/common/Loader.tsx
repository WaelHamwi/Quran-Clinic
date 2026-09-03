import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './Loader.styles';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

function LoaderBase({ message, fullScreen = false, size = 'large' }: LoaderProps) {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={fullScreen ? styles.fullScreen : styles.inline}>
      <ActivityIndicator size={size} color={theme.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

export const Loader = React.memo(LoaderBase);
