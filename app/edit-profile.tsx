import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/theme/colors';
import { editProfileStyles as s } from '@/styles/editProfileScreen.styles';

type Gender = 'male' | 'female';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();

  const [fullName, setFullName] = useState<string>(user?.name ?? '');
  const [email] = useState<string>(user?.email ?? '');
  const [phone, setPhone] = useState<string>(user?.phone ?? '');
  const [country, setCountry] = useState<string>(user?.country ?? '');
  const [gender, setGender] = useState<Gender>('male');

  return (
    <Screen edges={['top']}>
      <PatternedBackground />
      <Header title={t.editProfile.title} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

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

        {/* Email */}
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

        {/* Country */}
        <View style={s.fieldGroup}>
          <Text style={[s.label, isArabic && s.labelRtl]}>{t.editProfile.country}</Text>
          <Pressable style={[s.inputRow, isArabic && s.inputRowRtl]}>
            <View style={s.chevronIcon}>
              <Ionicons name="chevron-down" size={16} color={palette.text.secondary} />
            </View>
            <View style={s.inputIcon}>
              <Ionicons name="flag-outline" size={16} color={palette.text.secondary} />
            </View>
            <Text style={[s.input, !country && { color: palette.text.placeholder }, isArabic && { textAlign: 'right' }]}>
              {country || t.editProfile.country}
            </Text>
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
        <Pressable style={s.saveButton}>
          <Text style={s.saveButtonText}>{t.editProfile.save}</Text>
        </Pressable>

      </ScrollView>
    </Screen>
  );
}
