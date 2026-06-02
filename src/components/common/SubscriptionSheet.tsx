import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SubClose from '@/assets/figma/sub-close.svg';
import SubCrown from '@/assets/figma/sub-crown.svg';
import SubTick from '@/assets/figma/sub-tick.svg';
import { useLanguage } from '@/context/LanguageContext';
import { palette, type Theme } from '@/theme/colors';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

interface SubscriptionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: (plan: 'yearly' | 'monthly') => void;
}

/** Premium subscription sheet — Figma 18152:3443.
 *  Spec: white bg, radius-top 24, gap-sections, header handle 60×4,
 *  72×77 crown icon, 24/30 SemiBold brand-500 title, 14/20 Light tertiary subtitle,
 *  3 feature rows with right-aligned text + 32-tick on left,
 *  plan cards (yearly: brand-25 bg + brand-500 border + #fb364a "وفّر 25%" pill;
 *   monthly: white bg + #d5d7da border),
 *  RTL Button brand-500 radius-md (16) full-width, trial text Light 12/18 tertiary. */
export function SubscriptionSheet({
  visible,
  onClose,
  onSubscribe,
}: SubscriptionSheetProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.header}>
            <View style={styles.handle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.body}>
              {/* Close button — gray-100 60-radius bubble */}
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <SubClose width={16} height={16} />
              </Pressable>

              {/* Crown + title block */}
              <View style={styles.intro}>
                <View style={styles.crown}>
                  <SubCrown width="100%" height="100%" />
                </View>
                <View style={styles.introTexts}>
                  <Text style={styles.title}>{t.subscription.title}</Text>
                  <Text style={styles.subtitle}>{t.subscription.subtitle}</Text>
                </View>
              </View>
            </View>

            {/* Feature rows */}
            <View style={styles.features}>
              {[
                { title: t.subscription.feature1Title, desc: t.subscription.feature1Desc },
                { title: t.subscription.feature2Title, desc: t.subscription.feature2Desc },
                { title: t.subscription.feature3Title, desc: t.subscription.feature3Desc },
              ].map((f) => (
                <View key={f.title} style={styles.featureRow}>
                  <View style={styles.featureTextWrap}>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                  <View style={styles.featureTick}>
                    <SubTick width={32} height={32} />
                  </View>
                </View>
              ))}
            </View>

            {/* Plan cards */}
            <View style={styles.plans}>
              <Pressable
                style={[styles.planCard, plan === 'yearly' && styles.planYearlyActive]}
                onPress={() => setPlan('yearly')}
              >
                <View style={styles.planRow}>
                  <View style={styles.savePill}>
                    <Text style={styles.savePillText}>{t.subscription.save}</Text>
                  </View>
                  <View style={styles.planTexts}>
                    <Text style={styles.planTitle}>{t.subscription.yearly}</Text>
                    <View style={styles.planPriceRow}>
                      <Text style={styles.planPer}>{t.subscription.yearlyPer}</Text>
                      <Text style={styles.planPrice}>{t.subscription.yearlyPrice}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
              <Pressable
                style={[styles.planCard, styles.planMonthly, plan === 'monthly' && styles.planMonthlyActive]}
                onPress={() => setPlan('monthly')}
              >
                <View style={styles.planTexts}>
                  <Text style={styles.planTitleMono}>{t.subscription.monthly}</Text>
                  <View style={styles.planPriceRow}>
                    <Text style={styles.planPerMono}>{t.subscription.monthlyPer}</Text>
                    <Text style={styles.planPriceMono}>{t.subscription.monthlyPrice}</Text>
                  </View>
                </View>
              </Pressable>
            </View>

            {/* CTA + trial line */}
            <View style={styles.footer}>
              <Pressable
                style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
                onPress={() => onSubscribe?.(plan)}
              >
                <Text style={styles.ctaText}>{t.subscription.cta}</Text>
              </Pressable>
              <Text style={styles.trial}>{t.subscription.trial}</Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(_theme: Theme) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: palette.bg.primary,
      borderTopWidth: 1,
      borderTopColor: palette.border.secondary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '92%',
    },
    header: { padding: 16, alignItems: 'center' },
    handle: { width: 60, height: 4, borderRadius: 24, backgroundColor: palette.gray[200] },

    body: { paddingHorizontal: 20, alignItems: 'stretch', gap: 20 },
    // Close button — gray-100 p-12 rounded-60
    closeBtn: {
      alignSelf: 'flex-end',
      backgroundColor: palette.gray[100],
      padding: 12,
      borderRadius: 60,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    intro: { alignItems: 'center', gap: 20 },
    crown: { width: 72.213, height: 76.782 },
    introTexts: { width: '100%', gap: 14, alignItems: 'flex-end' },
    title: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 24,
      lineHeight: lineHeight.xl,
      color: palette.brand[500],
      textAlign: 'right',
      width: '100%',
    },
    subtitle: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.text.tertiary,
      textAlign: 'right',
      width: '100%',
    },

    // Features — pt-30 px-20, gap 12
    features: { paddingTop: 30, paddingHorizontal: 20, gap: 12 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    featureTextWrap: { flex: 1, gap: 4, alignItems: 'flex-end' },
    featureTitle: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.brand[500],
      textAlign: 'right',
    },
    featureDesc: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: palette.text.tertiary,
      textAlign: 'right',
    },
    featureTick: { paddingLeft: 8, paddingVertical: 8 },

    // Plans
    plans: { paddingHorizontal: 16, paddingVertical: 30, gap: 12 },
    planCard: {
      borderRadius: radius.md,
      padding: 16,
      borderWidth: 1,
    },
    planYearlyActive: {
      backgroundColor: palette.brand[25],
      borderColor: palette.border.brand,
    },
    planMonthly: {
      backgroundColor: palette.bg.primary,
      borderColor: palette.border.primary,
    },
    planMonthlyActive: { borderColor: palette.brand[500] },
    planRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    savePill: {
      backgroundColor: '#fb364a',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 60,
    },
    savePillText: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xs,
      color: palette.fg.white,
    },
    planTexts: { gap: 10, alignItems: 'flex-end' },
    planTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: palette.brand[500],
      textAlign: 'right',
    },
    planTitleMono: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: palette.text.secondary,
      textAlign: 'right',
    },
    planPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
    planPer: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.sm,
      color: palette.brand[500],
    },
    planPrice: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 24,
      lineHeight: lineHeight.sm,
      color: palette.brand[500],
    },
    planPerMono: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.sm,
      color: palette.text.secondary,
    },
    planPriceMono: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 24,
      lineHeight: lineHeight.sm,
      color: palette.text.secondary,
    },

    // Footer
    footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30, gap: 12 },
    // CTA — RTL Button: brand-500, radius md (16, not pill here!), py-12 px-12
    cta: {
      backgroundColor: palette.brand[500],
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.85 },
    ctaText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: palette.fg.white,
    },
    trial: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: palette.text.tertiary,
      textAlign: 'center',
    },
  });
}
