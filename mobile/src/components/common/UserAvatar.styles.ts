import type { Theme } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const avatarContainerStyle = (theme: Theme, size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  backgroundColor: theme.brandSubtleBorder,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
});

export const avatarImageStyle = (size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
});

export const initialsTextStyle = (theme: Theme, size: number) => ({
  fontFamily: fontFamily.alexandriaSemiBold,
  fontSize: Math.floor(size * 0.38),
  color: theme.primary,
});
