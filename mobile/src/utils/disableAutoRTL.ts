import { DevSettings, I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Every screen's RTL look (icons/text on the right, tab bar order, etc.) is
 * hand-built with explicit styles to match Figma — the app never relies on
 * RN/Yoga auto-mirroring `flexDirection: 'row'`. On a device whose OS locale
 * is Arabic, `I18nManager.isRTL` is `true` natively, so RN auto-mirrors those
 * already-RTL-authored layouts a second time, corrupting them — that's the
 * "some devices" bug. Force `isRTL` off unconditionally so the layout is
 * identical on every device regardless of system locale. `forceRTL` only
 * takes effect after the RN instance is recreated, so a reload is required;
 * `isRTL` is persisted natively, making this self-limiting (no-op once
 * already non-RTL).
 */
function disableAutoRTL(): void {
  if (!I18nManager.isRTL) return;

  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);

  if (__DEV__) {
    DevSettings.reload();
  } else {
    Updates.reloadAsync().catch(() => {});
  }
}

disableAutoRTL();
