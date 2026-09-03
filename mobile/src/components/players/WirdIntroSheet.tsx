import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import IntroBubble from '@/assets/figma/wird-intro-bubble.svg';
import IntroPlay from '@/assets/figma/wird-intro-play.svg';
import IntroRewards from '@/assets/figma/wird-intro-rewards.svg';
import IntroLock from '@/assets/figma/wird-intro-lock.svg';
import SubClose from '@/assets/figma/sub-close.svg';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { recordingTypeOf } from '@/utils/recordings';
import type { AccessibleRecording } from '@/types/recording';
import { createStyles } from './WirdIntroSheet.styles';

type Props = {
  visible: boolean;
  title: string;
  recordings: AccessibleRecording[];
  /** Dismissing the sheet without choosing — the parent sends the user home. */
  onClose: () => void;
  onSelect: (recording: AccessibleRecording) => void;
  onOpenInstructions: () => void;
};

/** Ruqyah intro sheet — Figma 19164:3739. Shown before the wird is reached;
 *  the user picks the summarized (free) or detailed (subscribers) ruqyah. */
export function WirdIntroSheet({
  visible,
  title,
  recordings,
  onClose,
  onSelect,
  onOpenInstructions,
}: Props) {
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const summarized = recordings.find((r) => recordingTypeOf(r) === 'summarized');
  const detailed = recordings.find((r) => recordingTypeOf(r) === 'detailed');

  const renderCard = (
    recording: AccessibleRecording,
    label: string,
    sub: string,
    brand: boolean,
  ) => (
    <Pressable
      style={({ pressed }) => [
        s.card,
        !isArabic && s['card--ltr'],
        brand && s['card--brand'],
        pressed && { opacity: 0.85 },
      ]}
      onPress={() => onSelect(recording)}
    >
      <View style={s.sideIcon}>
        {brand && !recording.accessible ? (
          <IntroLock width={16} height={20} />
        ) : (
          <Ionicons
            name={isArabic ? 'chevron-back' : 'chevron-forward'}
            size={14}
            color={brand ? theme.textOnBrand : theme.text}
          />
        )}
      </View>
      <View style={[s.cardGroup, !isArabic && s['cardGroup--ltr']]}>
        <View style={[s.cardTexts, !isArabic && s['cardTexts--ltr']]}>
          <Text style={[s.cardTitle, brand && s['cardTitle--onBrand']]}>{label}</Text>
          <Text style={[s.cardSub, brand && s['cardSub--onBrand']]}>{sub}</Text>
        </View>
        <View style={s.iconBubble}>
          {brand ? (
            <IntroRewards width={22} height={30} />
          ) : (
            <IntroPlay width={28} height={28} />
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.header}>
            <View style={s.handle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={s.body}>
              <Pressable style={[s.closeBtn, !isArabic && s['closeBtn--ltr']]} onPress={onClose}>
                <SubClose width={16} height={16} />
              </Pressable>

              <View style={s.intro}>
                <View style={s.bubbleWrap}>
                  <IntroBubble width={233} height={174} style={s.bubbleSvg} />
                  <Text style={s.bubbleText}>{t.disease.introBubble}</Text>
                </View>

                <View style={s.texts}>
                  <Text style={s.title}>{title}</Text>
                  <Text style={s.bodyText}>
                    {t.disease.introBody}
                    {'\n'}
                    {t.disease.introSeeMore}
                    {'\n'}
                    <Text style={s.link} onPress={onOpenInstructions}>
                      {t.disease.introInstructions}
                    </Text>
                  </Text>
                  <View style={s.banner}>
                    <Text style={s.bannerText}>{t.disease.introBanner}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={s.cards}>
              {summarized &&
                renderCard(summarized, t.disease.typeSummarized, t.disease.typeFree, false)}
              {detailed &&
                renderCard(detailed, t.disease.typeDetailed, t.disease.typePaid, true)}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
