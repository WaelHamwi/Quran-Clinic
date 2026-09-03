import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DriveCar from '@/assets/figma/drive-car.svg';
import DriveStop from '@/assets/figma/drive-stop.svg';
import DriveResume from '@/assets/figma/drive-resume.svg';
import DriveStopBtn from '@/assets/figma/drive-stop-btn.svg';
import { PatternedBackground } from '@/components/layout/PatternedBackground';
import { useLanguage } from '@/context/LanguageContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from './DrivingModeOverlay.styles';

interface DrivingModeOverlayProps {
  visible: boolean;
  onContinueAnyway: () => void;
  onStop: () => void;
}

export function DrivingModeOverlay({
  visible,
  onContinueAnyway,
  onStop,
}: DrivingModeOverlayProps) {
  const { t } = useLanguage();
  const styles = useStyles(createStyles);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinueAnyway}>
      <View style={styles.root}>
        <PatternedBackground />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.card}>
            <View style={styles.inner}>
              <View style={styles.topGroup}>
                {/* Title block */}
                <View style={styles.titleBlock}>
                  <View style={styles.carBubble}>
                    <View style={styles.carIcon}>
                      <DriveCar width="100%" height="100%" />
                    </View>
                  </View>
                  <Text style={styles.title}>{t.drivingMode.title}</Text>
                </View>

                {/* Status block */}
                <View style={styles.statusBlock}>
                  <View style={styles.stopBubble}>
                    <View style={styles.stopIcon}>
                      <DriveStop width="100%" height="100%" />
                    </View>
                  </View>
                  <Text style={styles.body}>{t.drivingMode.body}</Text>
                  <Text style={styles.focus}>{t.drivingMode.focus}</Text>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttons}>
                <Pressable
                  onPress={onContinueAnyway}
                  style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.secondaryText}>{t.drivingMode.continueAnyway}</Text>
                  <View style={styles.btnIcon}>
                    <DriveResume width="100%" height="100%" />
                  </View>
                </Pressable>
                <Pressable
                  onPress={onStop}
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryText}>{t.drivingMode.stop}</Text>
                  <View style={styles.btnIcon}>
                    <DriveStopBtn width="100%" height="100%" />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
