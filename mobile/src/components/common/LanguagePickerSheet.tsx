import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './LanguagePickerSheet.styles';

interface LanguagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguagePickerSheet({ visible, onClose }: LanguagePickerSheetProps) {
  const { language, isArabic, toggleLanguage } = useLanguage();
  const styles = useStyles(createStyles);

  const choose = (lang: 'ar' | 'en') => {
    if (lang !== language) toggleLanguage();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.handle} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title}>
              {isArabic ? 'لغة التطبيق' : 'App Language'}
            </Text>
            <View style={styles.options}>
              <Pressable style={styles.option} onPress={() => choose('ar')}>
                <View
                  style={[styles.radio, isArabic && styles.radioActive]}
                >
                  {isArabic ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optRight}>
                  <Text style={styles.optText}>العربية</Text>
                  <View style={styles.flag}>
                    <View style={styles.flagSa}>
                      <Text style={styles.flagSaText}>SA</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
              <Pressable style={styles.option} onPress={() => choose('en')}>
                <View
                  style={[styles.radio, !isArabic && styles.radioActive]}
                >
                  {!isArabic ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optRight}>
                  <Text style={styles.optText}>English</Text>
                  <View style={styles.flag}>
                    <View style={styles.flagGb}>
                      <Text style={styles.flagGbText}>GB</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
