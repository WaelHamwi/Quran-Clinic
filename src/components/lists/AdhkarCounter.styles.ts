import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const RING_SIZE = 128;
export const RING_CX = RING_SIZE / 2;        // 64
export const RING_CY = RING_SIZE / 2;        // 64
export const RING_R = 60;                    // track radius (stroke centred here)
export const RING_R_FILL = 58;              // white fill inside the track
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R; // ≈ 376.99

export const adhkarCounterStyles = StyleSheet.create({
  pressable: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  textGroup: {
    alignItems: 'center',
  },
  countNum: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 30,
    lineHeight: 36,
    color: palette.brand[500],
    textAlign: 'center',
  },
  countLabel: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 12,
    lineHeight: 16,
    color: palette.fg.quaternary,
    textAlign: 'center',
  },
});
