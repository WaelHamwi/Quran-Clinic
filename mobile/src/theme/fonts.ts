import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import {
  Alexandria_300Light,
  Alexandria_400Regular,
  Alexandria_500Medium,
  Alexandria_600SemiBold,
  Alexandria_700Bold,
} from '@expo-google-fonts/alexandria';

/** Font map passed to `useFonts` in the root layout.
 *  Add new font variants here — the layout picks them up automatically. */
export const FONTS = {
  Amiri_400Regular,
  Amiri_700Bold,
  Alexandria_300Light,
  Alexandria_400Regular,
  Alexandria_500Medium,
  Alexandria_600SemiBold,
  Alexandria_700Bold,
  SurahNameV4: require('../../assets/fonts/surah-name-v4.ttf'),
  QuranCommon: require('../../assets/fonts/quran-common.ttf'),
} as const;
