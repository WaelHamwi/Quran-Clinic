import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { getRingtone, type RingtoneId } from '@/services/notifications/ringtones';

// The tones run ~12 s, which is far longer than anyone needs to recognise one.
const PREVIEW_MS = 4500;

let player: AudioPlayer | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function teardown(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  try {
    player?.remove();
  } catch {
    // already released
  }
  player = null;
}

/**
 * Play a few seconds of `ringtone` so the user can hear it before choosing.
 *
 * Only the bundled tones have something to preview — 'default' and 'device'
 * resolve to a system sound the app has no handle on, and 'silent' to nothing,
 * so those are no-ops rather than a misleading silence-as-failure.
 */
function play(ringtone: RingtoneId): boolean {
  const source = getRingtone(ringtone).preview;
  stop();
  if (source == null) return false;
  try {
    player = createAudioPlayer(source);
    player.play();
    timer = setTimeout(teardown, PREVIEW_MS);
    return true;
  } catch {
    teardown();
    return false;
  }
}

/**
 * Play the tone at full length because the reminder is firing now.
 *
 * The notification's own sound comes from its Android channel, which cannot be
 * relied on to make any noise: a channel's sound is frozen when it is created,
 * belongs to the user afterwards, and may sit on a muted stream. The JS detector
 * only ever fires while the app is foregrounded, so it can simply play the tone
 * itself — the same thing the foreground service does natively.
 *
 * Returns false for the tones the app has no file for ('default', 'device') and
 * for 'silent'; those fall back to whatever the channel does.
 */
function playAlert(ringtone: RingtoneId): boolean {
  const source = getRingtone(ringtone).preview;
  stop();
  if (source == null) return false;
  try {
    player = createAudioPlayer(source);
    player.play();
    return true;
  } catch {
    teardown();
    return false;
  }
}

function stop(): void {
  teardown();
}

export const ringtonePreview = { play, playAlert, stop };
