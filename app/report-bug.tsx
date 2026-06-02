import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/theme/colors';
import { reportBugScreenStyles as s } from '@/styles/reportBugScreen.styles';

type ReportType = 'bug' | 'suggestion';

export default function ReportBugScreen() {
  const { t, isArabic } = useLanguage();
  const [type, setType] = useState<ReportType>('bug');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Screen edges={['top']}>
        <PatternedBackground />
        <Header title={t.reportBug.title} />
        <View style={s.successWrap}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark-circle" size={36} color={palette.brand[500]} />
          </View>
          <Text style={s.successTitle}>{t.reportBug.successTitle}</Text>
          <Text style={s.successMessage}>{t.reportBug.successMessage}</Text>
          <Pressable style={s.successBtn} onPress={() => router.back()}>
            <Text style={s.successBtnText}>{t.common.done}</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.reportBug.title} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Type selector ─────────────────────────────────── */}
        <View style={s.typeRow}>
          <Pressable
            style={[s.typeCard, type === 'bug' && s['typeCard--active']]}
            onPress={() => setType('bug')}
          >
            <Ionicons
              name="bug-outline"
              size={24}
              color={type === 'bug' ? palette.brand[500] : palette.text.tertiary}
            />
            <Text style={[s.typeLabel, type === 'bug' && s['typeLabel--active']]}>
              {t.reportBug.typeBug}
            </Text>
          </Pressable>
          <Pressable
            style={[s.typeCard, type === 'suggestion' && s['typeCard--active']]}
            onPress={() => setType('suggestion')}
          >
            <Ionicons
              name="bulb-outline"
              size={24}
              color={type === 'suggestion' ? palette.brand[500] : palette.text.tertiary}
            />
            <Text style={[s.typeLabel, type === 'suggestion' && s['typeLabel--active']]}>
              {t.reportBug.typeSuggestion}
            </Text>
          </Pressable>
        </View>

        {/* ── Description ───────────────────────────────────── */}
        <View style={s.fieldWrap}>
          <Text style={[s.fieldLabel, isArabic && s.fieldLabelRtl]}>{t.reportBug.descLabel}</Text>
          <TextInput
            style={s.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder={t.reportBug.descPlaceholder}
            placeholderTextColor={palette.text.placeholder}
            multiline
            textAlignVertical="top"
            textAlign={isArabic ? 'right' : 'left'}
          />
        </View>

        {/* ── Submit ────────────────────────────────────────── */}
        <Pressable style={s.submitBtn} onPress={handleSubmit}>
          <Text style={s.submitBtnText}>{t.reportBug.submit}</Text>
        </Pressable>

      </ScrollView>
    </Screen>
  );
}
