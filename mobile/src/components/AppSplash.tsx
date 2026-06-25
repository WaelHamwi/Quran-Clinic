import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SplashLogoTop from '@/assets/figma/splash-logo-top.svg';
import SplashLogoMid from '@/assets/figma/splash-logo-mid.svg';
import SplashLogoBottom from '@/assets/figma/splash-logo-bottom.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/theme/colors';
import { appSplashStyles as s } from './AppSplash.styles';

type Props = { onReady: () => void };

export function AppSplash({ onReady }: Props) {
  const insets = useSafeAreaInsets();
  const { language, isArabic, selectLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const buttonTop = insets.top + 24;

  // FR-2.1 — welcome screen flashes/animates on first launch: the three logo
  // parts reveal in sequence, then the subtitle fades up.
  const topA = useRef(new Animated.Value(0)).current;
  const midA = useRef(new Animated.Value(0)).current;
  const botA = useRef(new Animated.Value(0)).current;
  const titleA = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.stagger(150, [
        Animated.spring(topA, { toValue: 1, useNativeDriver: true, friction: 6, tension: 55 }),
        Animated.spring(midA, { toValue: 1, useNativeDriver: true, friction: 6, tension: 55 }),
        Animated.spring(botA, { toValue: 1, useNativeDriver: true, friction: 6, tension: 55 }),
      ]),
      Animated.timing(titleA, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [topA, midA, botA, titleA]);

  /** Fade + scale-in reveal for one logo part. */
  const partStyle = (a: Animated.Value) => ({
    opacity: a,
    transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  });

  return (
    <View style={s.container}>
      <PatternedBackground />

      {/* Language picker button */}
      <Pressable
        onPress={() => setMenuOpen((v) => !v)}
        style={({ pressed }) => [
          s.langPicker,
          { top: buttonTop, left: 32 },
          pressed && s.langPickerPressed,
        ]}
      >
        <Ionicons name="globe-outline" size={16} color={palette.text.primary} />
        <Text style={s.langText}>{isArabic ? 'العربية' : 'English'}</Text>
        <Ionicons
          name={menuOpen ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={palette.text.secondary}
        />
      </Pressable>

      {/* Dropdown — backdrop closes menu, card shows options */}
      {menuOpen && (
        <>
          <Pressable style={s.langMenuBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={[s.langMenu, { top: buttonTop + 48, left: 32 }]}>
            <Pressable
              style={[s.langOption, language === 'ar' && s.langOptionActive]}
              onPress={() => { selectLanguage('ar'); setMenuOpen(false); }}
            >
              <Text style={[s.langOptionText, language === 'ar' && s.langOptionTextActive]}>
                العربية dasdsad 
              </Text>
              {language === 'ar' && (
                <Ionicons name="checkmark" size={16} color={palette.brand[500]} />
              )}
            </Pressable>
            <View style={s.langOptionDivider} />
            <Pressable
              style={[s.langOption, language === 'en' && s.langOptionActive]}
              onPress={() => { selectLanguage('en'); setMenuOpen(false); }}
            >
              <Text style={[s.langOptionText, language === 'en' && s.langOptionTextActive]}>
                English dasd asd
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark" size={16} color={palette.brand[500]} />
              )}
            </Pressable>
          </View>
        </>
      )}

      {/* Centered logo block + subtitle */}
      <View style={s.content}>
        <View style={s.logoBlock}>
          <Animated.View style={[s.logoTopWrap, partStyle(topA)]}>
            <SplashLogoTop width="100%" height="100%" />
          </Animated.View>
          <Animated.View style={[s.logoMidWrap, partStyle(midA)]}>
            <SplashLogoMid width="100%" height="100%" />
          </Animated.View>
          <Animated.View style={[s.logoBottomWrap, partStyle(botA)]}>
            <SplashLogoBottom width="100%" height="100%" />
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            s.title,
            {
              opacity: titleA,
              transform: [
                { translateY: titleA.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              ],
            },
          ]}
        >
          {t.splash.subtitle}
        </Animated.Text>
      </View>

      {/* CTA button */}
      <Pressable
        onPress={onReady}
        style={({ pressed }) => [
          s.cta,
          { bottom: 40 + insets.bottom },
          pressed && s.ctaPressed,
        ]}
      >
        <Text style={s.ctaText}>{t.splash.cta}</Text>
      </Pressable>
    </View>
  );
}
