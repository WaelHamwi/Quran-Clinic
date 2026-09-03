import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';
import { QCF4_PAGE_DIVIDER_HEIGHT } from '@/constants/qcf4';

export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
    },
    pageItem: {
      borderBottomWidth: QCF4_PAGE_DIVIDER_HEIGHT,
      borderBottomColor: palette.mushaf.divider,
    },
  });
