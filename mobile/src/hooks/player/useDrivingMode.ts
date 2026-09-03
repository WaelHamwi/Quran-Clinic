import { useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enterDriving, exitDriving, selectIsDriving, selectWasPausedByDriving } from '@/store/slices/drivingModeSlice';
import { stop , selectIsPlaying } from '@/store/slices/playerSlice';
import { useRuqyahEngine } from '@/context/PlayerContext';

/** Enter driving mode above 30 km/h; auto-exit below 15 km/h. The gap is hysteresis
 *  so speed hovering near a single threshold can't flap the overlay on and off. */
const ENTER_SPEED_MS = 8.33; // 30 km/h
const EXIT_SPEED_MS = 4.17; // 15 km/h

/** GPS speed is spiky — a single bad fix can report a false 30 km/h while stopped.
 *  Require the band to hold for this many consecutive fixes (~2s each) before acting. */
const CONSECUTIVE_ENTER = 3;
const CONSECUTIVE_EXIT = 3;

/** After the user dismisses the overlay while driving, stay quiet this long so it
 *  doesn't re-pop every couple of seconds for the rest of the trip. */
const SNOOZE_MS = 10 * 60 * 1000;

/** Fixes with poor horizontal accuracy (indoors, urban canyon, cold GPS start) can
 *  report a phantom speed while the phone isn't moving at all. Discard those fixes
 *  entirely rather than feeding them into the enter/exit counters. */
const MAX_ACCURACY_M = 30;

export function useDrivingMode() {
  const dispatch = useAppDispatch();
  const engine = useRuqyahEngine();
  const isDriving = useAppSelector(selectIsDriving);
  const wasPausedByDriving = useAppSelector(selectWasPausedByDriving);
  const isPlaying = useAppSelector(selectIsPlaying);

  // Keep refs so the location callback always sees the latest value without re-subscribing.
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const isDrivingRef = useRef(isDriving);
  useEffect(() => {
    isDrivingRef.current = isDriving;
  }, [isDriving]);

  const wasPausedByDrivingRef = useRef(wasPausedByDriving);
  useEffect(() => {
    wasPausedByDrivingRef.current = wasPausedByDriving;
  }, [wasPausedByDriving]);

  const fastCountRef = useRef(0);
  const slowCountRef = useRef(0);
  const snoozeUntilRef = useRef(0);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 0,
        },
        (loc) => {
          const { accuracy, speed: rawSpeed } = loc.coords;
          if (accuracy == null || accuracy > MAX_ACCURACY_M) return;
          const speed = rawSpeed ?? 0;

          if (!isDrivingRef.current) {
            slowCountRef.current = 0;
            if (Date.now() < snoozeUntilRef.current) return;

            if (speed > ENTER_SPEED_MS) {
              fastCountRef.current += 1;
              if (fastCountRef.current >= CONSECUTIVE_ENTER) {
                fastCountRef.current = 0;
                const wasPlaying = isPlayingRef.current;
                if (wasPlaying) engine.pause();
                dispatch(enterDriving(wasPlaying));
              }
            } else {
              fastCountRef.current = 0;
            }
            return;
          }

          // Currently in driving mode — auto-exit once the car has genuinely slowed.
          fastCountRef.current = 0;
          if (speed < EXIT_SPEED_MS) {
            slowCountRef.current += 1;
            if (slowCountRef.current >= CONSECUTIVE_EXIT) {
              slowCountRef.current = 0;
              if (wasPausedByDrivingRef.current) engine.play();
              dispatch(exitDriving());
            }
          } else {
            slowCountRef.current = 0;
          }
        },
      );
    })().catch(() => {
      // Location unavailable on this device or permission flow failed — driving mode silently disabled.
    });

    return () => {
      subscription?.remove();
    };
  }, [dispatch, engine]);

  const onContinueAnyway = useCallback(() => {
    if (wasPausedByDriving) engine.play();
    snoozeUntilRef.current = Date.now() + SNOOZE_MS;
    fastCountRef.current = 0;
    dispatch(exitDriving());
  }, [dispatch, engine, wasPausedByDriving]);

  const onStop = useCallback(() => {
    snoozeUntilRef.current = Date.now() + SNOOZE_MS;
    fastCountRef.current = 0;
    dispatch(stop());
    dispatch(exitDriving());
  }, [dispatch]);

  return { isDriving, onContinueAnyway, onStop };
}
