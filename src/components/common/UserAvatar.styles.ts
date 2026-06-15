import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const s = StyleSheet.create({
  initialsText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    color: palette.brand[500],
  },
});

export const avatarContainerStyle = (size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: palette.brand[50],
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});

export const avatarImageStyle = (size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
});

export const initialsTextStyle = (size: number) => ({
  fontFamily: fontFamily.alexandriaSemiBold,
  fontSize: Math.floor(size * 0.38),
  color: palette.brand[500],
});
