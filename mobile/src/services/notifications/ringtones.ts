export type RingtoneId = 'chime' | 'bells' | 'dawn' | 'pulse' | 'default' | 'device' | 'silent';

/**
 * Which Android audio stream the reminder plays on.
 *
 * `alarm` is semantically right for a wake-up and is the only one that survives
 * silent mode and Do Not Disturb — but it plays at *alarm* volume, which is a
 * separate slider most people never touch. A phone whose alarm volume sits at
 * zero delivers the reminder in complete silence while every other app still
 * rings, because those use the notification stream.
 *
 * `notification` plays at the same volume as every other app's notifications,
 * so it is audible whenever they are. That predictability is why it is the
 * default; `alarm` is opt-in for people who want it to break through silent.
 */
export type SoundStream = 'alarm' | 'notification';

export interface Ringtone {
  id: RingtoneId;
  /** Bundled resource name, as registered under `expo-notifications.sounds` in
   *  app.json. `'default'` is the OS notification tone, `null` is silent. */
  fileName: string | 'default' | null;
  /** Bundled copy used for in-app preview. Absent for tones we do not own. */
  preview: number | null;
  label: Record<'ar' | 'en', string>;
}

/** The channel the user owns: created once and never deleted or re-created, so
 *  a tone they picked in Android's own settings survives every app change. */
export const DEVICE_CHANNEL_ID = 'adhkar-waking';

/**
 * Bumped whenever the bundled tones change.
 *
 * A channel's sound is fixed at creation and survives app updates — Android
 * ignores a later `setNotificationChannelAsync` that tries to change it, and
 * even restores the old settings if the channel is deleted and re-created under
 * the same id. So a device that first ran a build *without* the WAVs in
 * `res/raw` has channels permanently stuck on the default notification tone,
 * and no amount of reinstalling fixes them. A new id is the only way to hand
 * that device a channel that actually carries the tone. Bump this whenever the
 * files under `assets/sounds` or the `sounds` list in app.json change, and add
 * the outgoing ids to LEGACY_CHANNEL_IDS so they get swept up.
 */
const CHANNEL_VERSION = 'v2';

export const RINGTONES: Ringtone[] = [
  {
    id: 'chime',
    fileName: 'tone_chime.wav',
    preview: require('../../../assets/sounds/tone_chime.wav'),
    label: { ar: 'جرس هادئ', en: 'Soft chime' },
  },
  {
    id: 'bells',
    fileName: 'tone_bells.wav',
    preview: require('../../../assets/sounds/tone_bells.wav'),
    label: { ar: 'أجراس', en: 'Calm bells' },
  },
  {
    id: 'dawn',
    fileName: 'tone_dawn.wav',
    preview: require('../../../assets/sounds/tone_dawn.wav'),
    label: { ar: 'تصاعدي', en: 'Dawn rise' },
  },
  {
    id: 'pulse',
    fileName: 'tone_pulse.wav',
    preview: require('../../../assets/sounds/tone_pulse.wav'),
    label: { ar: 'نبضة', en: 'Gentle pulse' },
  },
  {
    id: 'default',
    fileName: 'default',
    preview: null,
    label: { ar: 'نغمة النظام', en: 'System default' },
  },
  {
    id: 'device',
    fileName: 'default',
    preview: null,
    label: { ar: 'من الجهاز', en: 'From device' },
  },
  {
    id: 'silent',
    fileName: null,
    preview: null,
    label: { ar: 'صامت', en: 'Silent' },
  },
];

export const DEFAULT_RINGTONE_ID: RingtoneId = 'chime';

const BY_ID = new Map(RINGTONES.map((r) => [r.id, r]));

export function getRingtone(id: RingtoneId | undefined): Ringtone {
  return BY_ID.get(id as RingtoneId) ?? BY_ID.get(DEFAULT_RINGTONE_ID)!;
}

/**
 * The channel carrying `id` on `stream`.
 *
 * The stream is part of the identity for the same reason the tone is: audio
 * attributes are immutable once a channel exists, so switching stream means
 * moving to a different channel rather than editing one in place.
 *
 * The `device` tone is exempt — it means "whatever the user configured in
 * Android's own settings", so it always resolves to the channel they own and
 * ignores the stream preference entirely.
 */
export function ringtoneChannelId(id: RingtoneId | undefined, stream: SoundStream): string {
  const tone = getRingtone(id);
  if (tone.id === 'device') return DEVICE_CHANNEL_ID;
  const suffix = stream === 'alarm' ? 'alm' : 'ntf';
  return `adhkar-waking-${tone.id}-${suffix}-${CHANNEL_VERSION}`;
}

/** Every channel the app manages itself — i.e. all of them except the one the
 *  user owns, which must never be torn down. */
export const MANAGED_CHANNEL_IDS = RINGTONES.filter((r) => r.id !== 'device').flatMap((r) => [
  ringtoneChannelId(r.id, 'alarm'),
  ringtoneChannelId(r.id, 'notification'),
]);

/** Superseded channel ids, kept only so they can be deleted — otherwise they
 *  linger in Android's notification settings as dead entries. */
export const LEGACY_CHANNEL_IDS = [
  'adhkar-waking-chime',
  'adhkar-waking-bells',
  'adhkar-waking-dawn',
  'adhkar-waking-pulse',
  'adhkar-waking-default',
  'adhkar-waking-silent',
  'adhkar-waking-chime-v2',
  'adhkar-waking-bells-v2',
  'adhkar-waking-dawn-v2',
  'adhkar-waking-pulse-v2',
  'adhkar-waking-default-v2',
  'adhkar-waking-silent-v2',
];
