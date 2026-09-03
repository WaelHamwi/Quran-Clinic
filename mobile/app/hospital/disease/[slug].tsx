import React from 'react';
import { WirdScreen } from '@/components/players/WirdScreen';

/** A single disease's wird. Thin route entry — the screen lives in WirdScreen. */
export default function DiseaseDetailScreen() {
  return <WirdScreen kind="disease" />;
}
