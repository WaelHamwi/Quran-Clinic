import { wakeDetection, type WakeWindow } from '@/services/notifications/wakeDetection';

let mockListener: ((reading: { x: number; y: number; z: number }) => void) | null = null;
const mockRemove = jest.fn();
const mockAddListener = jest.fn((cb: (r: { x: number; y: number; z: number }) => void) => {
  mockListener = cb;
  return { remove: mockRemove };
});
const mockIsAvailable = jest.fn(() => Promise.resolve(true));

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: () => mockIsAvailable(),
    setUpdateInterval: jest.fn(),
    addListener: (cb: (r: { x: number; y: number; z: number }) => void) => mockAddListener(cb),
  },
}));

// 05:00 local, comfortably inside the window the tests use.
const AT_5AM = new Date(2026, 7, 1, 5, 0, 0);
const STILLNESS_MINUTES = 5;
const WINDOW: WakeWindow = {
  start: '04:00',
  end: '08:00',
  stillnessMinutes: STILLNESS_MINUTES,
  awaySince: null,
};
/** Just past the settling period, so the sensor is armed. */
const SETTLED_MS = STILLNESS_MINUTES * 60 * 1000 + 1000;

// The listener only ever sees the magnitude, so a single axis carries the
// whole reading: |‖a‖ − 1| == deviation.
const emit = (deviation: number): void => mockListener?.({ x: 1 + deviation, y: 0, z: 0 });

const STILL = 0;
const HAND_JITTER = 0.04; // the faint, unbroken tremor of a phone held in a hand
const AMBIENT = 0.1; // above REST_EPSILON, below both HOLD and MOTION thresholds
const HANDLING = 0.2; // above HOLD_THRESHOLD and MOTION_THRESHOLD
const PICKUP = 0.5; // a deliberate lift

const advance = (ms: number): void => jest.setSystemTime(Date.now() + ms);

/** `count` samples 200 ms apart — a burst at the sampling rate. */
function burst(deviation: number, count = 3): void {
  for (let i = 0; i < count; i++) {
    emit(deviation);
    advance(200);
  }
}

/**
 * The phone lying on a surface, which streams rest samples at the sampling rate.
 * The detector requires a short run of them before it will arm, so a single
 * reading is not enough — nor should it be, since one flat sample is something a
 * hand produces too.
 */
function settle(count = 3): void {
  burst(STILL, count);
}

async function watchNow(onWake: jest.Mock, window = WINDOW): Promise<void> {
  await wakeDetection.watch(window, onWake);
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(AT_5AM);
  mockListener = null;
  mockAddListener.mockClear();
  mockIsAvailable.mockClear();
  mockIsAvailable.mockResolvedValue(true);
  wakeDetection.reset();
});

afterEach(() => {
  wakeDetection.stop();
  jest.useRealTimers();
});

describe('wakeDetection', () => {
  // The headline behaviour: after the settling period, merely picking the phone
  // up is enough. No shake, no deliberate gesture.
  it('fires as soon as a settled phone is handled at all', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);
    burst(HANDLING, 2);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  // The real-world case, and the one that silently could not work: the screen
  // goes off, so not a single sample arrives while the phone sits on the table.
  // Only the length of the absence can stand in for that unobserved stillness.
  it('credits time spent backgrounded as settling, then fires on being picked up', async () => {
    const onWake = jest.fn();
    const awaySince = Date.now() - 40 * 60 * 1000; // screen off for 40 minutes
    await watchNow(onWake, { ...WINDOW, awaySince });

    settle(); // still on the table when sampling resumes
    burst(HAND_JITTER, 6);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  // The false alarm users actually hit: a credited absence leaves the sensor
  // already past its settling period, and the phone is in their hand because
  // handling it is what brought the app back. Changing a setting rang the
  // reminder. Crediting the absence is still right — firing without ever having
  // seen the phone at rest is not.
  it('does not ring when the app comes back with the phone in the hand', async () => {
    const onWake = jest.fn();
    const awaySince = Date.now() - 40 * 60 * 1000;
    await watchNow(onWake, { ...WINDOW, awaySince });

    burst(HAND_JITTER, 10);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('does not ring while the phone is handled outright, however long the absence', async () => {
    const onWake = jest.fn();
    const awaySince = Date.now() - 8 * 60 * 60 * 1000; // left overnight
    await watchNow(onWake, { ...WINDOW, awaySince });

    burst(HANDLING, 10);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('does not treat a brief absence as settling', async () => {
    const onWake = jest.fn();
    const awaySince = Date.now() - 30 * 1000; // glanced at the notification shade
    await watchNow(onWake, { ...WINDOW, awaySince });

    burst(PICKUP, 4);

    expect(onWake).not.toHaveBeenCalled();
  });

  // A phone lifted gently may never cross the pick-up threshold, but a hand is
  // never perfectly still — so simply holding it has to be enough.
  it('fires while the phone is merely being held', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);
    burst(HAND_JITTER, 6);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  it('does not mistake a phone resting on a surface for one being held', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);
    // Faint tremor, but broken by stillness the way a table is — never a hand.
    for (let i = 0; i < 10; i++) {
      emit(HAND_JITTER);
      advance(200);
      emit(STILL);
      advance(200);
    }

    expect(onWake).not.toHaveBeenCalled();
  });

  it('fires on a firm pick-up too', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);
    burst(PICKUP, 2);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  it('honours a shorter settling period set by the user', async () => {
    const onWake = jest.fn();
    await watchNow(onWake, { ...WINDOW, stillnessMinutes: 1 });

    settle();
    advance(61_000);
    burst(HANDLING, 2);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  it('does not arm before the user-set period has elapsed', async () => {
    const onWake = jest.fn();
    await watchNow(onWake, { ...WINDOW, stillnessMinutes: 10 });

    settle();
    advance(SETTLED_MS); // enough for 5 minutes, not for 10
    burst(PICKUP, 2);

    expect(onWake).not.toHaveBeenCalled();
  });

  // The nightstand case: a passing lorry or a fan used to reset the stillness
  // run, so the gate never opened and no reminder was ever delivered.
  it('lets ambient vibration pass without wiping the stillness run', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(30_000);
    emit(AMBIENT);
    advance(SETTLED_MS);
    burst(HANDLING, 2);

    expect(onWake).toHaveBeenCalledTimes(1);
  });

  it('does not let ambient vibration alone ring the alarm', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);
    burst(AMBIENT, 5);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('ignores a lone spike, which is sensor noise rather than handling', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);
    emit(PICKUP);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('does not fire without a preceding stillness run', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    burst(PICKUP, 4);

    expect(onWake).not.toHaveBeenCalled();
  });

  // Being handled before it ever settled means the phone is in use, so the
  // settling period has to start over rather than carry on accumulating.
  it('restarts the settling period when the phone is used before it arms', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(60_000);
    burst(PICKUP, 3); // sustained handling resets the run
    advance(SETTLED_MS - 60_000);
    burst(HANDLING, 2);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('does not fire outside the waking window', async () => {
    const onWake = jest.fn();
    await watchNow(onWake, { ...WINDOW, start: '04:00', end: '04:30' });

    settle();
    advance(SETTLED_MS);
    burst(PICKUP, 2);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('fires at most once a day and stops sampling afterwards', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);
    burst(PICKUP, 2);
    expect(onWake).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalled();

    mockAddListener.mockClear();
    await watchNow(onWake);

    expect(mockAddListener).not.toHaveBeenCalled();
    expect(onWake).toHaveBeenCalledTimes(1);
  });

  // Backgrounding suspends sensor delivery, so the gap is unobserved time, not
  // stillness — and a half-built burst must not survive it either.
  it('discards the stillness run and the burst when it stops', async () => {
    const onWake = jest.fn();
    await watchNow(onWake);

    settle();
    advance(SETTLED_MS);

    wakeDetection.stop();
    await watchNow(onWake);
    burst(PICKUP, 2);

    expect(onWake).not.toHaveBeenCalled();
  });

  it('degrades quietly when the device has no accelerometer', async () => {
    mockIsAvailable.mockResolvedValue(false);
    const onWake = jest.fn();
    await watchNow(onWake);

    expect(mockAddListener).not.toHaveBeenCalled();
    expect(onWake).not.toHaveBeenCalled();
  });
});
