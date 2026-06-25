import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { reportService } from '@/services/reportService';
import type { ReportType } from '@/types/report';
import { palette } from '@/theme/colors';
import { reportBugScreenStyles as s } from '@/styles/reportBugScreen.styles';

export default function ReportBugScreen() {
  const { t, isArabic } = useLanguage();
  const { isGuest } = useAuth();
  const [type, setType] = useState<ReportType>('bug');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t.reportBug.imageLabel, t.reportBug.photoPermission);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      // Compress on device so the upload stays well under the server cap and is fast.
      quality: 0.5,
    });
    if (result.canceled || !result.assets?.length) return;
    setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (submitting || !message.trim()) return;
    setSubmitting(true);
    try {
      await reportService.submitReport({
        type,
        message: message.trim(),
        ...(isGuest ? { name: name.trim() } : {}),
        imageUri,
      });
      setSubmitted(true);
    } catch (err) {
      // Surface the real reason in the Metro logs; users still see a friendly message.
      console.warn('[report] submit failed:', (err as Error)?.message ?? err);
      Alert.alert(t.reportBug.errorTitle, t.reportBug.errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Screen>
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

  const labelStyle = [s.fieldLabel, isArabic && s.fieldLabelRtl];
  const canSubmit = !!message.trim() && !submitting;

  return (
    <Screen keyboardAvoiding>
      <PatternedBackground />
      <Header title={t.reportBug.title} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >

        <Text style={s.intro}>{t.reportBug.intro}</Text>

        {/* ── Name (guests only) ────────────────────────────── */}
        {isGuest ? (
          <View style={s.field}>
            <Text style={labelStyle}>{t.reportBug.nameLabel}</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder={t.reportBug.namePlaceholder}
              placeholderTextColor={palette.text.placeholder}
              textAlign={isArabic ? 'right' : 'left'}
            />
          </View>
        ) : null}

        {/* ── Report type ───────────────────────────────────── */}
        <View style={s.field}>
          <Text style={labelStyle}>{t.reportBug.typeLabel}</Text>
          <View style={s.typeRow}>
            {(['bug', 'suggestion'] as const).map((option) => {
              const active = type === option;
              return (
                <Pressable
                  key={option}
                  style={[s.typeCard, active && s['typeCard--active']]}
                  onPress={() => setType(option)}
                >
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={active ? palette.brand[500] : palette.text.tertiary}
                  />
                  <Text style={[s.typeLabel, active && s['typeLabel--active']]}>
                    {option === 'bug' ? t.reportBug.typeBug : t.reportBug.typeSuggestion}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Optional image ────────────────────────────────── */}
        <View style={s.field}>
          <Text style={labelStyle}>{t.reportBug.imageLabel}</Text>
          {imageUri ? (
            <View style={s.imagePreviewWrap}>
              <Image source={{ uri: imageUri }} style={s.imagePreview} resizeMode="cover" />
              <Pressable style={s.imageRemoveBtn} onPress={() => setImageUri(null)} hitSlop={8}>
                <Ionicons name="close" size={16} color={palette.white} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={s.imageBox} onPress={pickImage}>
              <Text style={s.imageBoxText}>{t.reportBug.attachImage}</Text>
              <Ionicons name="add" size={16} color={palette.text.primary} />
            </Pressable>
          )}
        </View>

        {/* ── Details ───────────────────────────────────────── */}
        <View style={s.field}>
          <Text style={labelStyle}>{t.reportBug.descLabel}</Text>
          <TextInput
            style={s.textArea}
            value={message}
            onChangeText={setMessage}
            placeholder={t.reportBug.descPlaceholder}
            placeholderTextColor={palette.text.placeholder}
            multiline
            textAlignVertical="top"
            textAlign={isArabic ? 'right' : 'left'}
          />
        </View>

        {/* ── Submit ────────────────────────────────────────── */}
        <Pressable
          style={[s.submitBtn, !canSubmit && s['submitBtn--disabled']]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={palette.text.onBrand} />
          ) : (
            <Text style={s.submitBtnText}>{t.reportBug.submit}</Text>
          )}
        </Pressable>

      </ScrollView>
    </Screen>
  );
}
