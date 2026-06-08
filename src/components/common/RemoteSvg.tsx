import React, { useEffect, useState } from 'react';
import { SvgXml } from 'react-native-svg';

interface RemoteSvgProps {
  uri: string;
  width: number;
  height: number;
  /** Optional tint — only applies to SVGs that use `currentColor`. */
  color?: string;
}

/**
 * Renders a remote SVG. `react-native-svg`'s SvgUri fetches without headers,
 * which ngrok's free tier blocks — so we fetch the XML ourselves with the
 * skip header and hand it to SvgXml. In production the header is harmless.
 */
function RemoteSvgBase({ uri, width, height, color }: RemoteSvgProps) {
  const [xml, setXml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setXml(null);
    fetch(uri, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then((r) => r.text())
      .then((text) => {
        if (active) setXml(text.trimStart().startsWith('<') ? text : null);
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
