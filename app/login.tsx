import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { fontFamily } from '@/theme/typography';

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
    <View style={styles.root}>
      <PatternedBackground />

      <FigmaTopBar title={t.login.title} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>

        <View style={styles.body}>
          {/* Logo block — Figma 17941:726, 129 × 218 with 3 absolute SVGs. */}
          <View style={styles.logoBlock}>
            <View style={styles.logoTop}>
              <LogoTop width="100%" height="100%" />
            </View>
            <View style={styles.logoMid}>
              <LogoMid width="100%" height="100%" />
            </View>
            <View style={styles.logoBottom}>
              <LogoBottom width="100%" height="100%" />
            </View>
          </View>

          {/* CTA block — Figma 17941:883, gap-24. */}
          <View style={styles.ctaBlock}>
            <View style={styles.textBlock}>
              <Text style={styles.welcome}>{t.login.welcome}</Text>
              <Text style={styles.subtitle}>{t.login.subtitle}</Text>
            </View>

            <View style={styles.buttons}>
              <Pressable
                onPress={handleGoogleSignIn}
                disabled={loading}
                style={({ pressed }) => [
                  styles.googleBtn,
                  pressed && !loading && styles.pressed,
                  loading && styles.disabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={palette.text.onBrand} />
                ) : (
                  <>
                    <Text style={styles.googleBtnText}>{t.login.googleSignIn}</Text>
                    <View style={styles.googleIcon}>
                      <GoogleIcon width={16} height={16} />
                    </View>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.guestBtn, pressed && styles.pressed]}
              >
                <Text style={styles.guestBtnText}>{t.login.guest}</Text>
              </Pressable>
            </View>

            <Text style={styles.terms}>
              {t.login.termsPrefix}{' '}
              <Text style={styles.termsLink}>{t.login.terms}</Text>{' '}
              {t.login.and}{' '}
              <Text style={styles.termsLink}>{t.login.privacy}</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.white },
  flex: { flex: 1 },

  body: {
    flex: 1,
    paddingTop: 90,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },

  logoBlock: { width: 129, height: 218, marginBottom: 120 },
  logoTop: { position: 'absolute', top: 0, right: '2.63%', bottom: '41.54%', left: '4.45%' },
  logoMid: { position: 'absolute', top: '66.85%', right: '0.84%', bottom: '21.42%', left: '0.46%' },
  logoBottom: { position: 'absolute', top: '83.47%', right: '0.46%', bottom: '0.09%', left: '1.37%' },

  ctaBlock: { width: '100%', gap: 24, alignItems: 'center' },

  textBlock: { width: '100%', alignItems: 'center', gap: 16 },
  welcome: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.primary,
    textAlign: 'center',
  },

  buttons: { width: '100%', gap: 16, alignItems: 'stretch' },

  googleBtn: {
    backgroundColor: palette.brand[500],
    borderRadius: 999,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 260,
  },
  googleBtnText: {
    color: palette.text.onBrand,
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  googleIcon: { width: 16, height: 16 },

  guestBtn: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: 999,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    color: palette.text.secondary,
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },

  terms: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.primary,
    textAlign: 'center',
  },
  termsLink: {
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.brand[600],
    textDecorationLine: 'underline',
  },
});
