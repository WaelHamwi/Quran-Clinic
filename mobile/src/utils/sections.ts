/** Generic helpers for "category → sections → items" content (Adhkar, Tahsinat). */

export interface OrderableItem {
  display_order: number;
}

export interface OrderableSection<TItem extends OrderableItem> {
  order_randomly: boolean;
  display_order: number;
  items?: TItem[];
}

export interface SectionedCategory<TItem extends OrderableItem> {
  sections?: OrderableSection<TItem>[];
  items?: TItem[];
}

/** Fisher–Yates shuffle — returns a new array, leaves the input untouched. */
function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const byOrder = (a: OrderableItem, b: OrderableItem): number => a.display_order - b.display_order;

/**
 * Flatten a category's sections + ungrouped items into a single ordered list.
 *
 * Sections follow their manual `display_order`. Inside each section, items keep
 * their manual sequence — unless the section has `order_randomly`, in which case
 * its items are shuffled. Call this per view so randomized sections reshuffle
 * every time the screen is opened.
 */
export function flattenSectioned<TItem extends OrderableItem>(
  category: SectionedCategory<TItem> | null | undefined,
): TItem[] {
  if (!category) return [];

  const out: TItem[] = [];

  for (const section of [...(category.sections ?? [])].sort(byOrder)) {
    const items = section.items ?? [];
    // Randomized sections ignore each item's order number and reshuffle on every
    // view; ordered sections follow the manual order number (display_order).
    out.push(...(section.order_randomly ? shuffle(items) : [...items].sort(byOrder)));
  }

  out.push(...[...(category.items ?? [])].sort(byOrder));

  return out;
}
