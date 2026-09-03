import { useCallback, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import * as Font from 'expo-font';
import fontMap from '@/assets/data/qcf4-font-map.json';
import { QCF4_HEADER_FONT, QCF4_TOTAL_PAGES } from '@/constants/qcf4';
import { QCF4_FONT_ASSETS } from '@/constants/qcf4FontAssets';

const PAGE_FONTS = fontMap as Record<string, string>;

const loadedFamilies = new Set<string>();
const inflight = new Map<string, Promise<void>>();

export function pageFontFamily(page: number): string {
  return PAGE_FONTS[String(page)] ?? PAGE_FONTS['1'];
}

// Registers the family from its bundled font asset. Fonts ship in the app, so
// this is a fast local load with no network — done lazily per page because
// expo-font cannot unload, and registering all 47 up front would pin ~93MB.
function loadFamily(family: string): Promise<void> {
  if (loadedFamilies.has(family) || Font.isLoaded(family)) {
    loadedFamilies.add(family);
    return Promise.resolve();
  }
  const pending = inflight.get(family);
  if (pending) return pending;

  const asset = QCF4_FONT_ASSETS[family];
  if (asset == null) return Promise.reject(new Error(`unknown QCF4 family ${family}`));

  const promise = Font.loadAsync({ [family]: asset })
    .then(() => {
      loadedFamilies.add(family);
    })
    .finally(() => {
      inflight.delete(family);
    });
  inflight.set(family, promise);
  return promise;
}

function prefetchNeighbors(page: number): void {
  for (const p of [page - 2, page - 1, page + 1, page + 2]) {
    if (p >= 1 && p <= QCF4_TOTAL_PAGES) void loadFamily(pageFontFamily(p)).catch(() => {});
  }
  void loadFamily(QCF4_HEADER_FONT).catch(() => {});
}

// Kicks off the (local, ~2 MB) font-family load for `page` and the shared
// header font ahead of the reader mounting — e.g. at tap time, so the load
// overlaps the route transition instead of the page sitting on a spinner
// (MadaniPage gates rendering on `fonts.loaded`) once the reader is on screen.
// Idempotent: loadFamily no-ops for already-loaded/in-flight families.
export function warmReaderFonts(page: number): void {
  void loadFamily(pageFontFamily(page)).catch(() => {});
  void loadFamily(QCF4_HEADER_FONT).catch(() => {});
}

let allFontsWarmed = false;

// Registers *every* QCF4 page font in the background so any surah/page opens
// with its text already rendered instead of waiting on a per-page font load.
// This deliberately trades memory for instant navigation: expo-font cannot
// unload, so once warmed all 47 Hafs families + the banner stay resident
// (~90MB) for the app's lifetime — the caller must only invoke it off the
// critical path (Mushaf list idle). Loading is sequential, one family at a
// time yielded through InteractionManager, so it never blocks a frame or an
// on-demand load the user's actual page triggers first (loadFamily dedupes
// in-flight/loaded families). Self-guarding + idempotent: runs its full sweep
// at most once.
export function warmAllReaderFonts(): void {
  if (allFontsWarmed) return;
  allFontsWarmed = true;

  const families = Object.keys(QCF4_FONT_ASSETS);
  let i = 0;

  const loadNext = () => {
    if (i >= families.length) return;
    const family = families[i++];
    loadFamily(family)
      .catch(() => {})
      .finally(() => {
        InteractionManager.runAfterInteractions(loadNext);
      });
  };

  loadNext();
}

export function useQcfFonts(page: number): {
  fontFamily: string;
  loaded: boolean;
  error: boolean;
  retry: () => void;
} {
  const family = pageFontFamily(page);
  const [loaded, setLoaded] = useState(() => loadedFamilies.has(family));
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    if (loadedFamilies.has(family)) {
      setLoaded(true);
      setError(false);
    } else {
      setLoaded(false);
      setError(false);
      loadFamily(family)
        .then(() => {
          if (alive) setLoaded(true);
        })
        .catch(() => {
          if (alive) setError(true);
        });
    }
    prefetchNeighbors(page);
    return () => {
      alive = false;
    };
  }, [family, page, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);

  return { fontFamily: family, loaded, error, retry };
}
