export { TabsLayout as default } from '@/components/layout/TabsLayout';

// Anchor the (tabs) group on the Clinic tab so deep links (e.g. the OAuth
// auth-callback redirect) land there instead of the first-declared tab (more).
export const unstable_settings = { anchor: 'index' };
