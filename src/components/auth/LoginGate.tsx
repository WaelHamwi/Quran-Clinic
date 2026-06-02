import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoTop from '@/assets/figma/login-logo-3.svg';
import LogoMid from '@/assets/figma/login-logo-2.svg';
import LogoBottom from '@/assets/figma/login-logo-1.svg';
import GoogleIcon from '@/assets/figma/google-icon.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { FigmaTopBar } from '@/components/layout/FigmaTopBar';
import { useLanguage } from '@/context/LanguageContext';
import { loginGateStyles as s } from './LoginGate.styles';

type Props = { onSuccess: () => void };

export function LoginGate({ onSuccess }: Props) {
  const { t } = useLanguage();

  return (
    <View style={s.root}>
      <PatternedBackground />
      <FigmaTopBar title={t.login.title} />
      <SafeAreaView style={s.flex} edges={['bottom']}>

        <View style={s.body}>
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

          <View style={s.ctaBlock}>
            <View style={s.textBlock}>
              <Text style={s.welcome}>{t.login.welcome}</Text>
              <Text style={s.subtitle}>{t.login.subtitle}</Text>
            </View>

            <View style={s.buttons}>
              <Pressable
                onPress={onSuccess}
                style={({ pressed }) => [s.googleBtn, pressed && s.pressed]}
              >
                <Text style={s.googleBtnText}>{t.login.googleSignIn}</Text>
                <View style={s.googleIcon}>
                  <GoogleIcon width={16} height={16} />
                </View>
              </Pressable>

              <Pressable
                onPress={onSuccess}
                style={({ pressed }) => [s.guestBtn, pressed && s.pressed]}
              >
                <Text style={s.guestBtnText}>{t.login.guest}</Text>
              </Pressable>
            </View>

            <Text style={s.terms}>
              {t.login.termsPrefix}{' '}
              <Text style={s.termsLink}>{t.login.terms}</Text>
              {' '}{t.login.and}{' '}
              <Text style={s.termsLink}>{t.login.privacy}</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
