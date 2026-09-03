import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import SubClose from '@/assets/figma/sub-close.svg';
import SubCrown from '@/assets/figma/sub-crown.svg';
import SubTick from '@/assets/figma/sub-tick.svg';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './SubscriptionSheet.styles';

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
  const { t } = useLanguage();
  const styles = useStyles(createStyles);
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
