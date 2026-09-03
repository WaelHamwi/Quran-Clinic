import { useState } from 'react';
import type { FontScale } from '@/utils/mushafReader';

/** Font-size picker state (sm/md/lg/xl + the inline picker's open/closed
 *  flag). Only the vertical 'continuous' mode is resizable — 'pages' fits a
 *  whole print page to the screen, so the header hides this control there
 *  (see MadaniPager). */
export function useFontScale() {
  const [fontScale, setFontScale] = useState<FontScale>('xl');
  const [fontScaleOpen, setFontScaleOpen] = useState(false);

  return { fontScale, setFontScale, fontScaleOpen, setFontScaleOpen };
}
