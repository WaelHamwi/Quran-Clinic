import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './LegalSheet.styles';

export type LegalKind = 'terms' | 'privacy';

type Props = {
  kind: LegalKind | null;
  onClose: () => void;
};

export function LegalSheet({ kind, onClose }: Props) {
  const { t, isArabic } = useLanguage();
  const s = useStyles(createStyles);

  const sections = kind === 'privacy' ? t.legal.privacySections : t.legal.termsSections;
  const title = kind === 'privacy' ? t.legal.privacyTitle : t.legal.termsTitle;

  return (
    <Modal visible={kind != null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.card}>
          <View style={s.handle} />
          <Text style={s.title}>{title}</Text>
          <Text style={s.updated}>{t.legal.lastUpdated}</Text>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section, i) => (
              <View key={i}>
                <Text style={[s.heading, isArabic && s.rtlText]}>{section.heading}</Text>
                <Text style={[s.body, isArabic && s.rtlText]}>{section.body}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable onPress={onClose} style={({ pressed }) => [s.cta, pressed && s.pressed]}>
            <Text style={s.ctaText}>{t.legal.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
