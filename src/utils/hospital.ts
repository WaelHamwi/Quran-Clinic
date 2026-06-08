import type { Category, Subcategory } from '@/types/category';

/**
 * A "direct" category has ruqyah recordings attached straight to it —
 * the app opens the recordings page directly.
 * True only when `type === 'direct'`.
 */
export function categoryIsDirect(
  category: Pick<Category, 'type'> | null | undefined,
): boolean {
  if (!category) return false;
  return category.type === 'direct';
}

/**
 * A "disease direct" category has diseases attached without a subcategory layer —
 * the app opens the diseases list for the category directly.
 */
export function categoryIsDiseaseDirect(
  category: Pick<Category, 'type'> | null | undefined,
): boolean {
  if (!category) return false;
  return category.type === 'disease_direct';
}

/** Route a category tap should navigate to. */
export function categoryRoute(category: Category): string {
  if (category.type === 'direct') {
    return `/hospital/recordings/${category.slug}`;
  }
  if (category.type === 'disease_direct') {
    return `/hospital/diseases/${category.slug}?level=category`;
  }
  return `/hospital/subcategories/${category.slug}`;
}

/**
 * A "direct" subcategory has recordings attached straight to it and no
 * diseases — the app opens recordings directly instead of a disease list.
 */
export function subcategoryIsDirect(
  subcategory: Pick<Subcategory, 'diseases' | 'diseases_count'> | null | undefined,
): boolean {
  if (!subcategory) return false;
  const diseaseCount = subcategory.diseases_count ?? subcategory.diseases?.length ?? 0;
  return diseaseCount === 0;
}

/** Route a subcategory tap should navigate to (recordings page passes level). */
export function subcategoryRoute(subcategory: Subcategory): string {
  return subcategoryIsDirect(subcategory)
    ? `/hospital/recordings/${subcategory.slug}?level=subcategory`
    : `/hospital/diseases/${subcategory.slug}`;
}
