import { useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enterDriving, exitDriving, selectIsDriving, selectWasPausedByDriving } from '@/store/slices/drivingModeSlice';
import { stop } from '@/store/slices/playerSlice';
import { selectIsPlaying } from '@/store/slices/playerSlice';
import { useRuqyahEngine } from '@/context/PlayerContext';

/** Speed threshold in m/s — 25 km/h ≈ 6.94 m/s */
const DRIVING_SPEED_MS = 6.94;

export function useDrivingMode() {
  const dispatch = useAppDispatch();
  const engine = useRuqyahEngine();
  const isDriving = useAppSelector(selectIsDriving);
  const wasPausedByDriving = useAppSelector(selectWasPausedByDriving);
  const isPlaying = useAppSelector(selectIsPlaying);

  // Keep a ref so the location callback always sees the latest value without re-subscribing.
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const isDrivingRef = useRef(isDriving);
  useEffect(() => {
    isDrivingRef.current = isDriving;
  }, [isDriving]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,
          distanceInterval: 0,
        },
        (loc) => {
          const speed = loc.coords.speed ?? 0;
          if (speed > DRIVING_SPEED_MS && !isDrivingRef.current) {
            const wasPlaying = isPlayingRef.current;
            if (wasPlaying) engine.pause();
            dispatch(enterDriving(wasPlaying));
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
    dispatch(exitDriving());
  }, [dispatch, engine, wasPausedByDriving]);

  const onStop = useCallback(() => {
    dispatch(stop());
    dispatch(exitDriving());
  }, [dispatch]);

  return { isDriving, onContinueAnyway, onStop };
}
