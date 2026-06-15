import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { CountryPickerModal } from '@/components/common/CountryPickerModal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch } from '@/store/hooks';
import { showToast } from '@/store/slices/uiSlice';
import { palette } from '@/theme/colors';
import { editProfileStyles as s } from '@/styles/editProfileScreen.styles';
import { COUNTRIES, type Country } from '@/data/countries';

type Gender = 'male' | 'female';

// Resolve the stored country string (which may be either the Arabic or the English name)
// to a full Country object so the picker highlights it and both languages display correctly.
function resolveCountry(value?: string | null): Country | null {
  if (!value) return null;
  const match = COUNTRIES.find((c) => c.en === value || c.ar === value);
  return match ?? { en: value, ar: value };
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { t, isArabic, language } = useLanguage();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState<string>(user?.name ?? '');
  const [email] = useState<string>(user?.email ?? '');
  const [phone, setPhone] = useState<string>(user?.phone ?? '');
  const [country, setCountry] = useState<Country | null>(resolveCountry(user?.country));
  const [gender, setGender] = useState<Gender>(user?.gender === 'female' ? 'female' : 'male');
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const countryLabel = country
    ? (language === 'ar' ? country.ar : country.en)
    : t.editProfile.country;

  const handleSave = async () => {
    if (saving) return;
    const name = fullName.trim();
    if (!name) {
      dispatch(showToast({ message: t.editProfile.errorMessage, type: 'error' }));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name,
        phone: phone.trim() || null,
        // Persist the canonical English name so the value is language-agnostic in the DB.
        country: country?.en ?? null,
        gender,
      });
      dispatch(showToast({ message: t.editProfile.successMessage, type: 'success' }));
      if (router.canGoBack()) router.back();
    } catch (err) {
      const message =
        (err as { errors?: { phone?: unknown } })?.errors?.phone
          ? t.editProfile.phoneTaken
          : t.editProfile.errorMessage;
      dispatch(showToast({ message, type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PatternedBackground />
      <Header title={t.editProfile.title} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >

          {/* Profile avatar */}
          <View style={s.avatarSection}>
            <UserAvatar uri={user?.avatar_path} name={fullName || user?.name} size={80} />
            <Text style={s.avatarName}>{fullName || user?.name}</Text>
          </View>

          {/* Full Name */}
          <View style={s.fieldGroup}>
            <Text style={[s.label, isArabic && s.labelRtl]}>{t.editProfile.fullName}</Text>
            <View style={[s.inputRow, isArabic && s.inputRowRtl]}>
              <View style={s.inputIcon}>
                <Ionicons name="person-outline" size={16} color={palette.text.secondary} />
              </View>
              <TextInput
                style={s.input}
                value={fullName}
                onChangeText={setFullName}
                textAlign={isArabic ? 'right' : 'left'}
                placeholder={t.editProfile.fullName}
                placeholderTextColor={palette.text.placeholder}
              />
            </View>
          </View>

          {/* Email (read-only) */}
          <View style={s.fieldGroup}>
            <Text style={[s.label, isArabic && s.labelRtl]}>{t.editProfile.email}</Text>
            <View style={[s.inputRow, s.inputRowDisabled, isArabic && s.inputRowRtl]}>
              <View style={s.inputIcon}>
                <Ionicons name="mail-outline" size={16} color={palette.text.secondary} />
              </View>
              <TextInput
                style={s.input}
                value={email}
                editable={false}
                textAlign={isArabic ? 'right' : 'left'}
                placeholderTextColor={palette.text.placeholder}
              />
            </View>
            <Text style={[s.hint, isArabic && s.hintRtl]}>{t.editProfile.emailReadOnly}</Text>
          </View>

          {/* Phone */}
          <View style={s.fieldGroup}>
            <Text style={[s.label, isArabic && s.labelRtl]}>{t.editProfile.phone}</Text>
            <View style={[s.inputRow, isArabic && s.inputRowRtl]}>
              <View style={s.inputIcon}>
                <Ionicons name="call-outline" size={16} color={palette.text.secondary} />
              </View>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textAlign={isArabic ? 'right' : 'left'}
                placeholder={t.editProfile.phone}
                placeholderTextColor={palette.text.placeholder}
              />
            </View>
          </View>

          {/* Country — opens picker */}
          <View style={s.fieldGroup}>
            <Text style={[s.label, isArabic && s.labelRtl]}>{t.editProfile.country}</Text>
            <Pressable
              style={[s.inputRow, isArabic && s.inputRowRtl]}
              onPress={() => setCountryPickerOpen(true)}
            >
              {isArabic ? (
                <>
                  <View style={s.chevronIcon}>
                    <Ionicons name="chevron-down" size={16} color={palette.text.secondary} />
                  </View>
                  <Text style={[s.input, !country && { color: palette.text.placeholder }, { textAlign: 'right' }]}>
                    {countryLabel}
                  </Text>
                  <View style={s.inputIcon}>
                    <Ionicons name="flag-outline" size={16} color={palette.text.secondary} />
                  </View>
                </>
              ) : (
                <>
                  <View style={s.inputIcon}>
                    <Ionicons name="flag-outline" size={16} color={palette.text.secondary} />
                  </View>
                  <Text style={[s.input, !country && { color: palette.text.placeholder }]}>
                    {countryLabel}
                  </Text>
                  <View style={s.chevronIcon}>
                    <Ionicons name="chevron-down" size={16} color={palette.text.secondary} />
                  </View>
                </>
              )}
            </Pressable>
          </View>

          {/* Gender */}
          <View style={s.fieldGroup}>
            <Text style={[s.label, isArabic && s.labelRtl]}>{t.editProfile.gender}</Text>
            <View style={[s.genderRow, isArabic && s.genderRowRtl]}>
              <Pressable
                style={[s.genderOption, isArabic && s.genderOptionRtl, gender === 'male' && s.genderOptionSelected]}
                onPress={() => setGender('male')}
              >
                <Text style={[s.genderLabel, isArabic && s.genderLabelRtl]}>{t.editProfile.male}</Text>
                <View style={[s.radioOuter, gender === 'male' && s.radioOuterSelected]}>
                  {gender === 'male' && <View style={s.radioDot} />}
                </View>
              </Pressable>
              <Pressable
                style={[s.genderOption, isArabic && s.genderOptionRtl, gender === 'female' && s.genderOptionSelected]}
                onPress={() => setGender('female')}
              >
                <Text style={[s.genderLabel, isArabic && s.genderLabelRtl]}>{t.editProfile.female}</Text>
                <View style={[s.radioOuter, gender === 'female' && s.radioOuterSelected]}>
                  {gender === 'female' && <View style={s.radioDot} />}
                </View>
              </Pressable>
            </View>
          </View>

          <View style={s.divider} />

          {/* Save */}
          <Pressable
            style={[s.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={palette.text.onBrand} />
            ) : (
              <Text style={s.saveButtonText}>{t.editProfile.save}</Text>
            )}
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={countryPickerOpen}
        selected={country?.en ?? ''}
        onSelect={(c: Country) => setCountry(c)}
        onClose={() => setCountryPickerOpen(false)}
      />
    </Screen>
  );
}
