import type { AdhkarCategory, AdhkarItem } from '@/types/adhkar';
import { flattenSectioned } from '@/utils/sections';

/**
 * Flatten an adhkar category's sections + ungrouped items into one ordered list,
 * reshuffling any `order_randomly` section. See {@link flattenSectioned}.
 */
export function flattenAdhkar(category: AdhkarCategory | null | undefined): AdhkarItem[] {
  return flattenSectioned<AdhkarItem>(category);
}
