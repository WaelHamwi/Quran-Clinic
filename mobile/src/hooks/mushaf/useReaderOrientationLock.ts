import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';

/**
 * Reader orientation: normally unlocked to `ALL` so a physical rotation
 * genuinely resizes the app into landscape (letting MadaniPager's own
 * flex/onLayout sizing fill the real screen). Without this, the rest of
 * the app is portrait-locked (see app/_layout.tsx), so rotating the device
 * while reading never resizes the surface — some OEM skins (MIUI/Xiaomi
 * especially) then show a shrunk, letterboxed preview of the still-portrait
 * content instead of rotating, which is the "narrow strip in the middle"
 * artifact.
 *
 * "Flip" reading mode layers on top of that: locks orientation to landscape
 * (both directions), so resting the phone flat between two people and
 * physically rotating it 180° lets the OS auto-rotate the content to face
 * whoever is looking at it — used for reading from the opposite side of a
 * table (the phone lying flat means the accelerometer won't trigger a normal
 * sensor rotation on its own). Locks back to portrait on toggle-off or
 * unmount, matching the rest of the app. Shared by both Mushaf readers.
 */
export function useReaderOrientationLock() {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (flipped) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL).catch(() => {});
    }
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, [flipped]);

  return { flipped, setFlipped };
}
