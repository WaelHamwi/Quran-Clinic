import { StyleSheet } from 'react-native';

/** Vertical gap between favorite rows (Figma 18284:3425 → gap-8). */
export const ROW_GAP = 8;

// Figma 18284:3421/3422 — content padded py-20 px-16, rows stacked with 8px gap.
export const favoriteListStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  dragArea: {
    gap: ROW_GAP,
  },
  rowWrap: {
    width: '100%',
  },
});
