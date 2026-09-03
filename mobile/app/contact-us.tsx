import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/contactUsScreen.styles';

export default function ContactUsScreen() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const [name, setName] = useState<string>(user?.name ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [message, setMessage] = useState<string>('');

  return (
    <Screen>
      <PatternedBackground />
      <Header title={t.contactUs.title} />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.subtitle}>{t.contactUs.subtitle}</Text>

        {/* Name */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, isArabic && s.labelRtl]}>{t.contactUs.nameLabel}</Text>
          <View style={[s.inputRow, isArabic && s.inputRowRtl]}>
            <View style={s.inputIcon}>
              <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
            </View>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              textAlign={isArabic ? 'right' : 'left'}
              placeholder={t.contactUs.nameLabel}
              placeholderTextColor={theme.textPlaceholder}
            />
          </View>
        </View>

        {/* Email */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, isArabic && s.labelRtl]}>{t.contactUs.emailLabel}</Text>
          <View style={[s.inputRow, isArabic && s.inputRowRtl]}>
            <View style={s.inputIcon}>
              <Ionicons name="mail-outline" size={16} color={theme.textSecondary} />
            </View>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign={isArabic ? 'right' : 'left'}
              placeholder={t.contactUs.emailLabel}
              placeholderTextColor={theme.textPlaceholder}
            />
          </View>
        </View>

        {/* Message */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, isArabic && s.labelRtl]}>{t.contactUs.messageLabel}</Text>
          <View style={s.textareaWrap}>
            <TextInput
              style={s.textarea}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlign={isArabic ? 'right' : 'left'}
              placeholder={t.contactUs.messagePlaceholder}
              placeholderTextColor={theme.textPlaceholder}
            />
          </View>
        </View>

        {/* Send */}
        <Pressable style={s.sendButton}>
          <Text style={s.sendButtonText}>{t.contactUs.send}</Text>
        </Pressable>

      </ScrollView>
    </Screen>
  );
}
