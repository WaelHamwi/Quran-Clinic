import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
                العربية
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
                English
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
          <View style={s.logoTopWrap}>
            <SplashLogoTop width="100%" height="100%" />
          </View>
          <View style={s.logoMidWrap}>
            <SplashLogoMid width="100%" height="100%" />
          </View>
          <View style={s.logoBottomWrap}>
            <SplashLogoBottom width="100%" height="100%" />
          </View>
        </View>

        <Text style={s.title}>{t.splash.subtitle}</Text>
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
