import React, { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import HomeSearch from '@/assets/figma/home-search.svg';
import HomeUser from '@/assets/figma/home-user.svg';
import HomeUserWrap from '@/assets/figma/home-user-wrap.svg';
import HomeBell from '@/assets/figma/home-bell.svg';
import HomeBellDot from '@/assets/figma/home-bell-dot.svg';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { selectInboxUnreadCount } from '@/store/slices/notificationInboxSlice';
import { IconButton } from '@/components/common/IconButton';
import { createHeaderStyles, ICON_FOREGROUND, BELL_DOT_COLOR } from './Header.styles';

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
  const { top } = useSafeAreaInsets();
  const s = useMemo(() => createHeaderStyles(theme), [theme]);
  const unreadCount = useAppSelector(selectInboxUnreadCount);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  }, [onBack, router]);

  // The bell opens the in-app notification inbox (delivered adhkar reminders).
  const goNotifications = useCallback(() => router.push('/notification-inbox'), [router]);

  if (variant === 'homepage') {
    return (
      // paddingTop = status-bar inset so the patterned background can bleed up
      // BEHIND this bar (the home Screen no longer pads the top). The translucent
      // bar then floats over the pattern, separated only by its box shadow — the
      // header "sits on" the body instead of a solid white strip above it.
      <View style={[s['header--homepage'], { paddingTop: top }]}>
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
          <Pressable
            onPress={goNotifications}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t.notifications.inboxTitle}
            style={s.header__bell}
          >
            <HomeBell width="100%" height="100%" color={ICON_FOREGROUND} />
            {unreadCount > 0 ? (
              <View style={s.header__bellDot} pointerEvents="none">
                <HomeBellDot width="100%" height="100%" color={BELL_DOT_COLOR} />
              </View>
            ) : null}
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
    <View style={[s.header, isArabic && s['header--rtl']]}>
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
          <Text style={s.header__title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={s.header__subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[s.header__side, s['header__side--right']]}>{right}</View>
    </View>
  );
}

export const Header = React.memo(HeaderBase);
