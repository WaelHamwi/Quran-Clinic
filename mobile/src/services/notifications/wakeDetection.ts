import { isWithinWakingWindow, localDayKey } from '@/utils/wakingWindow';

type AccelerometerModule = (typeof import('expo-sensors'))['Accelerometer'];
type Subscription = ReturnType<AccelerometerModule['addListener']>;

// Resolved lazily rather than imported at module scope: an OTA update can ship
// this JS to a binary that was built before expo-sensors was linked, and a
// top-level import would take the whole app down at startup. Missing native
// module simply means no motion detection — the timed reminder still runs.
let accelerometer: AccelerometerModule | null | undefined;

function getAccelerometer(): AccelerometerModule | null {
  if (accelerometer !== undefined) return accelerometer;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay a runtime require so a binary without the module degrades instead of crashing
    accelerometer = (require('expo-sensors') as typeof import('expo-sensors')).Accelerometer;
  } catch {
    accelerometer = null;
  }
  return accelerometer;
}

// The accelerometer reports acceleration in g. At rest the magnitude is ≈1
// (gravity alone), so |‖a‖ − 1| is the deviation caused by real movement.

// Deviation below this is sensor noise on a phone lying untouched — the
// "asleep" state that must precede movement for it to count as waking up.
const REST_EPSILON = 0.06;

// Above this the phone is being handled. Between the two lies ambient
// vibration (traffic, a fan, a mattress) which is neither stillness nor
// handling, and must not be allowed to end a stillness run on its own.
const MOTION_THRESHOLD = 0.15;

// Once the phone has lain untouched for the whole stillness period, picking it
// up is the wake-up — so the armed threshold is deliberately low. Lifting a
// phone off a table deviates 0.15–0.5 g, and a hand simply holding one already
// deviates more than this, while a phone resting on a surface does not.
const HOLD_THRESHOLD = 0.12;

// Two consecutive armed samples (400 ms at 5 Hz) rather than one, so a lone
// noise sample cannot ring the alarm. Anything longer would miss a quick lift.
const HOLD_BURST_SAMPLES = 2;

// A phone resting on a surface is dead flat between disturbances; a phone in a
// hand never is. That *continuity*, not amplitude, is what separates the two —
// so being held is detected as an unbroken run of faint movement, which catches
// a user who lifted the phone gently enough never to cross HOLD_THRESHOLD.
const HELD_THRESHOLD = 0.03;
const HELD_CONSECUTIVE = 6; // 1.2 s at 5 Hz

// The settling period can be *credited* from time the app spent backgrounded,
// which means the sensor can come up already past it — with the phone in the
// user's hand, because handling it is what brought the app back. Firing then is
// the false alarm users actually hit: changing a setting, or simply opening the
// app, rings the reminder. So the armed phase additionally requires the sensor
// to have *seen* the phone lying still — dead flat by HELD_THRESHOLD, which is
// the same line the held-detector uses. A phone on a table clears that within a
// second; a phone in a hand never does.
const REST_RUN_TO_ARM = 3; // 600 ms at 5 Hz

// Before the phone has settled, only sustained handling at this level counts as
// "being used" and ends the stillness run.
const WAKE_BURST_SAMPLES = 3;
const BURST_WINDOW_MS = 1500;

// 5 Hz. The old 900 ms sampled roughly once a second, far too slow to land
// inside a pick-up transient of 100–300 ms, so the motion was simply missed.
// An accelerometer at this rate is negligible for battery, and detection stops
// altogether the moment it fires.
const SAMPLE_INTERVAL_MS = 200;

export interface WakeWindow {
  start: string;
  end: string;
  /** User-set settling period, in minutes (`wakeStillnessMinutes`). */
  stillnessMinutes: number;
  /**
   * When the app was last backgrounded, or null if it has been foregrounded all
   * along. The phone stops delivering sensor events the moment the screen goes
   * off, so a phone left on a table overnight produces no samples at all — the
   * settling period could never accumulate, and the reminder could never fire.
   * Crediting that gap is what makes the real "left it, then picked it up"
   * case work; see `watch`.
   */
  awaySince: number | null;
}

let subscription: Subscription | null = null;
let watching = false;
let lastFiredDay: string | null = null;
let stillSince: number | null = null;
/** Timestamps of the recent consecutive samples that registered as movement. */
let burst: number[] = [];
/** Unbroken run of faint-movement samples — the phone sitting in a hand. */
let heldRun = 0;
/** Consecutive dead-flat samples, and whether enough have been seen to trust
 *  that the phone really was put down. See REST_RUN_TO_ARM. */
let restRun = 0;
let restObserved = false;

function detach(): void {
  subscription?.remove();
  subscription = null;
}

/**
 * Watch the accelerometer for a wake-up inside `window` and call `onWake` once.
 *
 * Sensors stop the moment the screen goes off, which is the whole difficulty:
 * the phone spends the night producing no samples, so stillness observed *in
 * the foreground* can never reach a period measured in minutes. The time the
 * app spent backgrounded is therefore credited as settling — a phone the user
 * has not returned to for that long was not being used. The trade-off is
 * deliberate: coming back to the app inside the waking window after a long
 * absence is treated as waking up, which is bounded by the window and by firing
 * at most once a day.
 */
async function watch(window: WakeWindow, onWake: () => void): Promise<void> {
  watching = true;
  detach();

  if (lastFiredDay === localDayKey()) return;

  const accel = getAccelerometer();
  if (!accel) return; // module not in this binary — timed reminder still covers it

  try {
    if (!(await accel.isAvailableAsync())) return;
  } catch {
    return; // no sensor / permission denied — the timed fallback still covers it
  }
  if (!watching) return; // stopped while awaiting availability

  const stillnessMs = Math.max(1, window.stillnessMinutes) * 60 * 1000;
  if (window.awaySince != null) stillSince = window.awaySince;

  accel.setUpdateInterval(SAMPLE_INTERVAL_MS);
  subscription = accel.addListener(({ x, y, z }) => {
    const deviation = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1);
    const at = Date.now();

    while (burst.length > 0 && at - burst[0] > BURST_WINDOW_MS) burst.shift();

    // Dead flat, by the held-detector's own threshold rather than the looser
    // REST_EPSILON: the band between the two is exactly the faint tremor a hand
    // produces, so counting it here would let a held phone satisfy the gate it
    // is meant to fail.
    if (deviation < HELD_THRESHOLD) {
      restRun++;
      if (restRun >= REST_RUN_TO_ARM) restObserved = true;
    } else {
      restRun = 0;
    }

    // Armed: the phone has been untouched for the whole settling period *and*
    // has been seen lying still, so any handling at all is the user picking it
    // up. This is the sensitive phase — the stillness run in front of it is what
    // keeps it from false-alarming.
    if (restObserved && stillSince != null && at - stillSince >= stillnessMs) {
      if (deviation >= HELD_THRESHOLD) heldRun++;
      else heldRun = 0;

      if (deviation >= HOLD_THRESHOLD) burst.push(at);

      const pickedUp = burst.length >= HOLD_BURST_SAMPLES;
      const beingHeld = heldRun >= HELD_CONSECUTIVE;
      if (!pickedUp && !beingHeld) return;

      const today = localDayKey();
      if (lastFiredDay === today) return;
      if (!isWithinWakingWindow(new Date(at), window.start, window.end)) return;

      lastFiredDay = today;
      stop();
      onWake();
      return;
    }

    if (deviation < REST_EPSILON) {
      stillSince ??= at;
      burst = [];
      return;
    }

    // Still settling. Ambient vibration is not stillness, but not handling
    // either — leaving the run intact is what lets the gate open on a real
    // nightstand, where one passing lorry used to wipe out minutes of it.
    if (deviation < MOTION_THRESHOLD) return;

    burst.push(at);
    if (burst.length < WAKE_BURST_SAMPLES) return;

    // Sustained handling before the phone ever settled: the user is using it,
    // so the run starts again from scratch.
    stillSince = null;
    burst = [];
  });
}

function stop(): void {
  watching = false;
  // The run is dropped here, not carried across the gap: the next `watch` call
  // decides what the time away was worth, via `awaySince`.
  stillSince = null;
  burst = [];
  heldRun = 0;
  restRun = 0;
  restObserved = false;
  detach();
}

/** Clears the once-per-day guard. Tests only. */
function reset(): void {
  stop();
  lastFiredDay = null;
}

export const wakeDetection = { watch, stop, reset };
