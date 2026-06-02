import type { AdhkarCategory, AdhkarItem } from '@/types/adhkar';

/** Fisher–Yates shuffle — returns a new array, leaves the input untouched. */
function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const byOrder = (a: { display_order: number }, b: { display_order: number }): number =>
  a.display_order - b.display_order;

/**
 * Flatten a category's sections + ungrouped items into a single ordered list.
 *
 * Sections follow their manual `display_order`. Inside each section, items keep
 * their manual sequence — unless the section has `order_randomly`, in which case
 * its items are shuffled. Call this per view so randomized sections reshuffle
 * every time the screen is opened.
 */
export function flattenAdhkar(category: AdhkarCategory | null | undefined): AdhkarItem[] {
  if (!category) return [];

  const out: AdhkarItem[] = [];

  for (const section of [...(category.sections ?? [])].sort(byOrder)) {
    const items = [...(section.items ?? [])].sort(byOrder);
    out.push(...(section.order_randomly ? shuffle(items) : items));
  }

  out.push(...[...(category.items ?? [])].sort(byOrder));

  return out;
}
