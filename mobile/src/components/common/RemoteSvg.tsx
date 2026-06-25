import React, { useEffect, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import { cachedFetch } from '@/services/contentCache';

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
 * Renders a remote SVG with offline support. The fetched XML is persisted via
 * `cachedFetch` (SQLite KV) keyed by URI: a successful fetch refreshes the cache,
 * and when the device is offline the last cached copy is returned — so category /
 * subcategory / disease icons still render offline instead of disappearing.
 */
function RemoteSvgBase({ uri, width, height, color }: RemoteSvgProps) {
  const [xml, setXml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setXml(null);
    cachedFetch(`svg:${uri}`, () => fetchSvgXml(uri))
      .then((text) => {
        if (active) setXml(text);
      })
      .catch(() => {
        if (active) setXml(null);
      });
    return () => {
      active = false;
    };
  }, [uri]);

  if (!xml) return null;

  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}

export const RemoteSvg = React.memo(RemoteSvgBase);
