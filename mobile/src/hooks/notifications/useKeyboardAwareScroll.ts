import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, type ScrollView } from 'react-native';

const SCROLL_SETTLE_MS = 50;

interface KeyboardAwareScroll {
  scrollRef: React.RefObject<ScrollView | null>;
  keyboardHeight: number;
  /** Re-scroll when switching directly between fields (no new show event). */
  scrollToInput: () => void;
}

/**
 * Android edge-to-edge (SDK 53 default) ignores `adjustResize`, so the window
 * never shrinks for the keyboard and any field low on the screen stays hidden
 * behind it. Tracking the height ourselves lets the caller pad the scroll
 * content by it and lift the focused field clear.
 */
export function useKeyboardAwareScroll(): KeyboardAwareScroll {
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToInput = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), SCROLL_SETTLE_MS);
  }, []);

  useEffect(() => {
    const onShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), SCROLL_SETTLE_MS);
    });
    const onHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return { scrollRef, keyboardHeight, scrollToInput };
}
