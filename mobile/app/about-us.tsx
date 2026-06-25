import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import LogoTop from '@/assets/figma/login-logo-3.svg';
import LogoMid from '@/assets/figma/login-logo-2.svg';
import LogoBottom from '@/assets/figma/login-logo-1.svg';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/context/LanguageContext';
import { aboutUsScreenStyles as s } from '@/styles/aboutUsScreen.styles';

export default function AboutUsScreen() {
  const { t, isArabic } = useLanguage();

  const bullets = [
    t.aboutUs.appContainsItem1,
    t.aboutUs.appContainsItem2,
    t.aboutUs.appContainsItem3,
  ];

  return (
    <Screen>
      <PatternedBackground />
      <Header title={t.aboutUs.title} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Brand logo ────────────────────────────────────────── */}
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

        {/* ── Content card ──────────────────────────────────────── */}
        <View style={s.card}>

          {/* Section 1 — Who we are */}
          <View style={s.divider} />
          <View style={s.section}>
            <Text style={[s.sectionTitle, isArabic && s.sectionTitleRtl]}>{t.aboutUs.whoWeAre}</Text>
            <Text style={[s.sectionBody, isArabic && s.sectionBodyRtl]}>{t.aboutUs.whoWeAreBody}</Text>
          </View>

          {/* Section 2 — What the app includes */}
          <View style={s.divider} />
          <View style={s.section}>
            <Text style={[s.sectionTitle, isArabic && s.sectionTitleRtl]}>{t.aboutUs.appContains}</Text>
            {bullets.map((item, i) => (
              <View key={i} style={[s.bulletRow, !isArabic && s.bulletRowLtr]}>
                <Text style={[s.bulletText, !isArabic && s.bulletTextLtr]}>{item}</Text>
                <Text style={s.bullet}>{'•'}</Text>
              </View>
            ))}
          </View>

          {/* Section 3 — Medical note */}
          <View style={s.divider} />
          <View style={s.section}>
            <Text style={[s.sectionTitle, isArabic && s.sectionTitleRtl]}>{t.aboutUs.medicalNote}</Text>
            <Text style={[s.sectionBody, isArabic && s.sectionBodyRtl]}>{t.aboutUs.medicalNoteBody}</Text>
          </View>

        </View>

      </ScrollView>
    </Screen>
  );
}
