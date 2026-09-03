import React from 'react';
import { WirdScreen } from '@/components/players/WirdScreen';

/**
 * A category/subcategory that owns wird directly (no disease layer). Thin route
 * entry — the screen lives in WirdScreen; `?level=subcategory` is read there.
 */
export default function CategoryRecordingsScreen() {
  return <WirdScreen kind="recordings" />;
}
