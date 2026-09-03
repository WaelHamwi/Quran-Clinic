import React, { useEffect, useMemo, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import { contentCache } from '@/services/common/contentCache';

interface RemoteSvgProps {
  uri: string;
  width: number;
  height: number;
  /** Optional tint — only applies to SVGs that use `currentColor`. */
  color?: string;
}

/**
 * `react-native-svg`'s SvgUri fetches without headers, which ngrok's free tier
 * blocks — so we fetch the XML ourselves with the skip header. A non-SVG body
 * (HTML error page, empty response) must throw so it is NOT cached and the last
 * good copy is kept. In production the header is harmless.
 */
async function fetchSvgXml(uri: string): Promise<string> {
  const res = await fetch(uri, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  const text = await res.text();
  if (!text.trimStart().startsWith('<')) throw new Error('Not an SVG document');
  return text;
}

/**
 * An SVG only scales when it has a `viewBox` — without one there is no user
 * coordinate system to map onto the requested width/height, so uploaded icons
 * render at their intrinsic size (e.g. 24px inside a 48px box) and look tiny.
 * Many exported icons ship with `width`/`height` but no `viewBox`, so derive it
 * from those, then drop the intrinsic size so the render size wins.
 */
function normalizeSvg(xml: string): string {
  const rootMatch = xml.match(/<svg\b[^>]*>/i);
  if (!rootMatch) return xml;

  let root = rootMatch[0];

  if (!/\bviewBox\s*=/i.test(root)) {
    const w = root.match(/\bwidth\s*=\s*["']?([\d.]+)/i)?.[1];
    const h = root.match(/\bheight\s*=\s*["']?([\d.]+)/i)?.[1];
    if (!w || !h) return xml;
    root = root.replace(/<svg\b/i, `<svg viewBox="0 0 ${w} ${h}"`);
  }

  root = root.replace(/\s(?:width|height)\s*=\s*["'][^"']*["']/gi, '');

  if (!/\bpreserveAspectRatio\s*=/i.test(root)) {
    root = root.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet"');
  }

  return xml.replace(rootMatch[0], root);
}

/**
 * Renders a remote SVG with offline support, cache-first: the SQLite copy (keyed
 * by URI) renders immediately — icons were previously network-first, so every
 * screen visit re-downloaded every icon and they popped in late — then a
 * background fetch refreshes the cache and swaps the image only if it changed.
 */
function RemoteSvgBase({ uri, width, height, color }: RemoteSvgProps) {
  const [xml, setXml] = useState<string | null>(null);
  const [renderedUri, setRenderedUri] = useState(uri);

  // Clearing the old XML from an effect leaves the previous icon painted for the
  // commit that already carries the new uri — in a row reused for a different
  // disease that reads as "this disease shows the last one's icon". Resetting
  // during render swaps it in the same pass instead.
  if (renderedUri !== uri) {
    setRenderedUri(uri);
    setXml(null);
  }

  useEffect(() => {
    let active = true;
    const key = `svg:${uri}`;
    (async () => {
      const cached = await contentCache.getItem<string>(key);
      if (active && cached) setXml(cached);
      try {
        const fresh = await fetchSvgXml(uri);
        void contentCache.setItem(key, fresh);
        if (active && fresh !== cached) setXml(fresh);
      } catch {
        // Offline or non-SVG body — keep whatever the cache provided.
      }
    })();
    return () => {
      active = false;
    };
  }, [uri]);

  const normalized = useMemo(() => (xml ? normalizeSvg(xml) : null), [xml]);

  if (!normalized) return null;

  return <SvgXml xml={normalized} width={width} height={height} color={color} />;
}

export const RemoteSvg = React.memo(RemoteSvgBase);
