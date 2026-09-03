import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import WarningEllipse from '@/assets/figma/warning-ellipse.svg';
import WarningIcon from '@/assets/figma/warning-icon.svg';
import TickButtonIcon from '@/assets/figma/tick-button.svg';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './DisclaimerPopup.styles';

interface DisclaimerPopupProps {
  visible: boolean;
  onAccept: () => void;
}

export function DisclaimerPopup({ visible, onAccept }: DisclaimerPopupProps) {
  const { t } = useLanguage();
  const styles = useStyles(createStyles);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onAccept}>
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <View style={styles.card}>
          <View style={styles.handle} />
          <View style={styles.content}>
            <View style={styles.illustration}>
              <View style={StyleSheet.absoluteFill}>
                <WarningEllipse width="100%" height="100%" />
              </View>
              <View style={styles.illoIcon}>
                <WarningIcon width="100%" height="100%" />
              </View>
            </View>
            <Text style={styles.title}>{t.disclaimer.title}</Text>
            <Text style={styles.body}>{t.disclaimer.body}</Text>
          </View>
          <Pressable
            onPress={onAccept}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>{t.disclaimer.accept}</Text>
            <View style={styles.ctaIcon}>
              <TickButtonIcon width={14} height={10} />
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
