import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/theme/colors';
import { subscriptionScreenStyles as s } from '@/styles/subscriptionScreen.styles';

type Plan = 'yearly' | 'monthly';

const FEATURE_ICONS: [keyof typeof Ionicons.glyphMap, string, string][] = [
  ['lock-open-outline', 'feature1Title', 'feature1Desc'],
  ['document-text-outline', 'feature2Title', 'feature2Desc'],
  ['shield-checkmark-outline', 'feature3Title', 'feature3Desc'],
];

export default function SubscriptionScreen() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Plan>('yearly');

  return (
    <View style={s.screen}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ── Hero ──────────────────────────────────────────── */}
        <View style={s.hero}>
          <View style={s.lockCircle}>
            <Ionicons name="lock-closed" size={36} color={palette.text.onBrand} />
          </View>
          <Text style={s.heroTitle}>{t.subscription.title}</Text>
          <Text style={s.heroSubtitle}>{t.subscription.subtitle}</Text>
        </View>

        {/* ── Features ──────────────────────────────────────── */}
        <View style={s.featuresSection}>
          {FEATURE_ICONS.map(([icon, titleKey, descKey]) => (
            <View key={titleKey} style={s.featureRow}>
              <View style={s.featureIcon}>
                <Ionicons name={icon} size={20} color={palette.brand[500]} />
              </View>
              <View style={s.featureText}>
                <Text style={s.featureTitle}>
                  {t.subscription[titleKey as keyof typeof t.subscription] as string}
                </Text>
                <Text style={s.featureDesc}>
                  {t.subscription[descKey as keyof typeof t.subscription] as string}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Pricing cards ─────────────────────────────────── */}
        <View style={s.pricingSection}>
          {/* Yearly */}
          <Pressable
            style={[s.priceCard, selected === 'yearly' && s['priceCard--selected']]}
            onPress={() => setSelected('yearly')}
          >
            <View style={[s.priceCardRadio, selected === 'yearly' && s['priceCardRadio--selected']]}>
              {selected === 'yearly' && <View style={s.priceCardRadioDot} />}
            </View>
            <View style={s.priceCardContent}>
              <View style={s.priceCardHeader}>
                <Text style={s.priceCardLabel}>{t.subscription.yearly}</Text>
                <View style={s.saveBadge}>
                  <Text style={s.saveBadgeText}>{t.subscription.save}</Text>
                </View>
              </View>
              <View style={s.priceRow}>
                <Text style={s.priceAmount}>{t.subscription.yearlyPrice}</Text>
                <Text style={s.pricePer}>{t.subscription.yearlyPer}</Text>
              </View>
            </View>
          </Pressable>

          {/* Monthly */}
          <Pressable
            style={[s.priceCard, selected === 'monthly' && s['priceCard--selected']]}
            onPress={() => setSelected('monthly')}
          >
            <View style={[s.priceCardRadio, selected === 'monthly' && s['priceCardRadio--selected']]}>
              {selected === 'monthly' && <View style={s.priceCardRadioDot} />}
            </View>
            <View style={s.priceCardContent}>
              <Text style={s.priceCardLabel}>{t.subscription.monthly}</Text>
              <View style={s.priceRow}>
                <Text style={s.priceAmount}>{t.subscription.monthlyPrice}</Text>
                <Text style={s.pricePer}>{t.subscription.monthlyPer}</Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* ── CTA ───────────────────────────────────────────── */}
        <View style={s.ctaSection}>
          <Pressable style={s.ctaButton}>
            <Text style={s.ctaLabel}>{t.subscription.cta}</Text>
          </Pressable>
          <Pressable>
            <Text style={s.trialText}>{t.subscription.trial}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Close button — overlaid on hero */}
      <Pressable style={s.closeBtn} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="close" size={18} color={palette.text.onBrand} />
      </Pressable>
    </View>
  );
}
