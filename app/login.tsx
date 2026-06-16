import React from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoTop from '@/assets/figma/login-logo-3.svg';
import LogoMid from '@/assets/figma/login-logo-2.svg';
import LogoBottom from '@/assets/figma/login-logo-1.svg';
import GoogleIcon from '@/assets/figma/google-icon.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { FigmaTopBar } from '@/components/layout/FigmaTopBar';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/theme/colors';
import { loginStyles as s } from '@/styles/login.styles';

export default function LoginScreen() {
  // ─── Logic preserved verbatim ────────────────────────────────────────────────
  const { signIn, loading } = useAuth();
  const { t } = useLanguage();

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
    } catch (error: any) {
      Alert.alert(t.login.error, error?.message || t.login.errorBody);
    }
  };

  // ─── Figma hierarchy ────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <PatternedBackground />

      <FigmaTopBar title={t.login.title} />
      <SafeAreaView style={s.flex} edges={['bottom']}>

        <View style={s.body}>
          {/* Logo block — Figma 17941:726, 129 × 218 with 3 absolute SVGs. */}
          <View style={s.logoBlock}>
            <View style={s.logoTop}>
              <LogoTop width="100%" height="100%" />
            </View>
            <View style={s.logoMid}>
              <LogoMid width="100%" height="100%" />
            </View>
            <View style={s.logoBottom}>
              <LogoBottom width="100%" height="100%" />
            </View>
          </View>

          {/* CTA block — Figma 17941:883, gap-24. */}
          <View style={s.ctaBlock}>
            <View style={s.textBlock}>
              <Text style={s.welcome}>{t.login.welcome}</Text>
              <Text style={s.subtitle}>{t.login.subtitle}</Text>
            </View>

            <View style={s.buttons}>
              <Pressable
                onPress={handleGoogleSignIn}
                disabled={loading}
                style={({ pressed }) => [
                  s.googleBtn,
                  pressed && !loading && s.pressed,
                  loading && s.disabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={palette.text.onBrand} />
                ) : (
                  <>
                    <Text style={s.googleBtnText}>{t.login.googleSignIn}</Text>
                    <View style={s.googleIcon}>
                      <GoogleIcon width={16} height={16} />
                    </View>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [s.guestBtn, pressed && s.pressed]}
              >
                <Text style={s.guestBtnText}>{t.login.guest}</Text>
              </Pressable>
            </View>

            <Text style={s.terms}>
              {t.login.termsPrefix}{' '}
              <Text style={s.termsLink}>{t.login.terms}</Text>{' '}
              {t.login.and}{' '}
              <Text style={s.termsLink}>{t.login.privacy}</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
