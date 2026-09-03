import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '@/hooks/player/useAudio';
import { useLanguage } from '@/context/LanguageContext';
import { useMushafContext } from '@/context/MushafContext';
import { claimAudioFocus, registerAudioEngine } from '@/services/player/audioFocus';
import { resolveNextSurahSource } from '@/services/mushaf/mushafQueue';

export type PlayingSurah = { id: number; name: { ar: string; en?: string | null } };

/** What happens when a surah's recitation finishes:
 *  `next` advances through the mushaf (khatma listening), `repeat` loops the
 *  current surah, `stop` keeps the old single-surah behaviour. */
export type PlaybackEndMode = 'next' | 'repeat' | 'stop';

const END_MODE_KEY = '@mushaf:end-mode';

type MushafAudio = ReturnType<typeof useAudio> & {
  playingSurah: PlayingSurah | null;
  setPlayingSurah: (s: PlayingSurah | null) => void;
  endMode: PlaybackEndMode;
  setEndMode: (m: PlaybackEndMode) => void;
};

const MushafAudioContext = createContext<MushafAudio | null>(null);

/**
 * Root-level home for the Mushaf `useAudio` engine. The engine used to live
 * inside the reader screen, which destroyed the native player (and killed
 * playback) the moment the user navigated away — hoisting it here lets the
 * recitation keep playing app-wide, mirroring how `PlayerProvider` keeps the
 * Ruqyah engine alive. Still a separate player from the Ruqyah one (RULE_42).
 *
 * Also owns end-of-surah handling (advance/repeat/stop) so it works regardless
 * of which screen the user is on — the reader may be unmounted when the track
 * ends, exactly like the Ruqyah queue auto-advance in PlayerContext.
 */
export function MushafAudioProvider({ children }: { children: React.ReactNode }) {
  const audio = useAudio();
  const { language, t } = useLanguage();
  const { selectedReciterId } = useMushafContext();
  // Which surah the loaded source belongs to — lets the reader decide whether a
  // remount is "returning to the playing surah" (keep the audio) or a different
  // surah (unload), and gives the mini player its title + return route.
  const [playingSurah, setPlayingSurah] = useState<PlayingSurah | null>(null);
  const [endMode, setEndModeState] = useState<PlaybackEndMode>('next');

  const {
    play: basePlay,
    pause,
    unload: baseUnload,
    loadAudio,
    seekTo,
    setNowPlaying,
  } = audio;

  useEffect(() => {
    AsyncStorage.getItem(END_MODE_KEY)
      .then((v: string | null) => {
        if (v === 'next' || v === 'repeat' || v === 'stop') setEndModeState(v);
      })
      .catch(() => {});
  }, []);

  const setEndMode = useCallback((m: PlaybackEndMode) => {
    setEndModeState(m);
    AsyncStorage.setItem(END_MODE_KEY, m).catch(() => {});
  }, []);

  useEffect(() => registerAudioEngine('mushaf', pause), [pause]);

  const play = useCallback(async () => {
    claimAudioFocus('mushaf');
    await basePlay();
  }, [basePlay]);

  const unload = useCallback(async () => {
    setPlayingSurah(null);
    await baseUnload();
  }, [baseUnload]);

  // ── End-of-surah: advance / repeat / stop ───────────────────────────────────
  // Values the (rare) end-transition needs, kept in refs so the detection
  // effect below re-runs only when playbackState changes.
  const endModeRef = useRef(endMode);
  useEffect(() => { endModeRef.current = endMode; }, [endMode]);
  const playingSurahRef = useRef(playingSurah);
  useEffect(() => { playingSurahRef.current = playingSurah; }, [playingSurah]);
  const reciterIdRef = useRef(selectedReciterId);
  useEffect(() => { reciterIdRef.current = selectedReciterId; }, [selectedReciterId]);
  const languageRef = useRef(language);
  useEffect(() => { languageRef.current = language; }, [language]);
  const appNameRef = useRef(t.more.appName);
  useEffect(() => { appNameRef.current = t.more.appName; }, [t]);

  const prevFinishedRef = useRef(false);
  const advancingRef = useRef(false);

  const advanceToNextSurah = useCallback(async () => {
    const current = playingSurahRef.current;
    if (!current || advancingRef.current) return;
    advancingRef.current = true;
    try {
      const next = await resolveNextSurahSource(current.id, reciterIdRef.current);
      if (!next) return;
      const lang = languageRef.current;
      await loadAudio(next.uri);
      setPlayingSurah({ id: next.surahId, name: next.name });
      setNowPlaying({
        title: next.name[lang] || next.name.ar,
        artist:
          (next.reciterName && (next.reciterName[lang] || next.reciterName.ar)) ||
          appNameRef.current,
        albumTitle: appNameRef.current,
      });
      await play();
    } finally {
      advancingRef.current = false;
    }
  }, [loadAudio, setNowPlaying, play]);

  // Rising edge of `didJustFinish` = natural end (a user pause never sets it).
  // Android holds the flag true while the player sits at the end, so only the
  // false → true edge may trigger — not every status tick.
  useEffect(() => {
    const finished = audio.didJustFinish;
    const wasFinished = prevFinishedRef.current;
    prevFinishedRef.current = finished;
    if (!finished || wasFinished) return;
    if (!playingSurahRef.current) return;

    switch (endModeRef.current) {
      case 'repeat':
        seekTo(0);
        play();
        break;
      case 'next':
        advanceToNextSurah();
        break;
      case 'stop':
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- end-of-track detector: must fire only on didJustFinish changes; everything else is read via always-fresh refs
  }, [audio.didJustFinish]);

  const value: MushafAudio = {
    ...audio,
    play,
    unload,
    playingSurah,
    setPlayingSurah,
    endMode,
    setEndMode,
  };
  return <MushafAudioContext.Provider value={value}>{children}</MushafAudioContext.Provider>;
}

export function useMushafAudio(): MushafAudio {
  const ctx = useContext(MushafAudioContext);
  if (!ctx) throw new Error('useMushafAudio must be used within MushafAudioProvider');
  return ctx;
}
