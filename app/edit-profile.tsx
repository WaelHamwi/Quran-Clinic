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
import * as ImagePicker from 'expo-image-picker';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Ionicons } from '@expo/vector-icons';
import { persistAvatar } from '@/services/avatarStorage';
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
  const { profile, isGuest, updateProfile } = useAuth();
  const { t, isArabic, language } = useLanguage();
  const dispatch = useAppDispatch();

  const [fullName, setFullName] = useState<string>(profile?.name ?? '');
  const [email] = useState<string>(profile?.email ?? '');
  const [phone, setPhone] = useState<string>(profile?.phone ?? '');
  const [country, setCountry] = useState<Country | null>(resolveCountry(profile?.country));
  const [gender, setGender] = useState<Gender>(profile?.gender === 'female' ? 'female' : 'male');
  const [avatar, setAvatar] = useState<string | null>(profile?.avatar_path ?? null);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Guests can set a profile picture from their photo library; the chosen image is copied to
  // permanent app storage and persisted locally on save. (Signed-in users keep their Google
  // avatar — there is no backend image-upload endpoint, so editing is gated to guests.)
  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      dispatch(showToast({ message: t.editProfile.photoPermission, type: 'error' }));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.length) return;
    try {
      setAvatar(await persistAvatar(result.assets[0].uri));
    } catch {
      dispatch(showToast({ message: t.editProfile.errorMessage, type: 'error' }));
    }
  };

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
        // Avatar is a local image — only meaningful for the on-device guest profile.
        ...(isGuest ? { avatar_path: avatar } : {}),
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

          {/* Profile avatar — tappable for guests to pick a picture from their library. */}
          <View style={s.avatarSection}>
            {isGuest ? (
              <Pressable style={s.avatarPressable} onPress={handlePickAvatar}>
                <UserAvatar uri={avatar} name={fullName || profile?.name} size={80} />
                <View style={s.avatarEditBadge}>
                  <Ionicons name="camera" size={15} color={palette.text.onBrand} />
                </View>
              </Pressable>
            ) : (
              <UserAvatar uri={avatar} name={fullName || profile?.name} size={80} />
            )}
            <Text style={s.avatarName}>{fullName || profile?.name}</Text>
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

          {/* Email (read-only) — only signed-in users have one; guests have no account email. */}
          {!isGuest && (
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
          )}

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
