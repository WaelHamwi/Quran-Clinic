import React, { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import HomeSearch from '@/assets/figma/home-search.svg';
import HomeUser from '@/assets/figma/home-user.svg';
import HomeUserWrap from '@/assets/figma/home-user-wrap.svg';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { IconButton } from '@/components/common/IconButton';
import { createHeaderStyles, ICON_FOREGROUND } from './Header.styles';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  variant?: 'default' | 'homepage';
  userName?: string | null;
  onSearchPress?: () => void;
}

function HeaderBase({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  variant = 'default',
  userName,
  onSearchPress,
}: HeaderProps) {
  const { theme } = useTheme();
  const { isArabic, t } = useLanguage();
  const router = useRouter();
  const s = useMemo(() => createHeaderStyles(theme), [theme]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  }, [onBack, router]);

  if (variant === 'homepage') {
    return (
      <View style={s['header--homepage']}>
        <View style={s.header__row}>
          <Pressable
            onPress={onSearchPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="search"
            style={s.header__icon}
          >
            <HomeSearch width="100%" height="100%" color={ICON_FOREGROUND} />
          </Pressable>
          <View style={s.header__greetingGroup}>
            <Text style={s.header__greeting} numberOfLines={1}>
              {t.home.greeting(userName ?? null)}
            </Text>
            <View style={s.header__userIcon}>
              <HomeUserWrap width="100%" height="100%" />
              <View style={s.header__userIconInner}>
                <HomeUser width="100%" height="100%" />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.header}>
      <View style={s.header__side}>
        {showBack ? (
          <IconButton
            icon={isArabic ? 'chevron-forward' : 'chevron-back'}
            onPress={handleBack}
            color={ICON_FOREGROUND}
          />
        ) : null}
      </View>
      <View style={s.header__titleWrap}>
        {title ? (
          <Text style={s.header__title}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={s.header__subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[s.header__side, s['header__side--right']]}>{right}</View>
    </View>
  );
}

export const Header = React.memo(HeaderBase);
