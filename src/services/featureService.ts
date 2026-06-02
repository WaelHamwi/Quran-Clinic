import { apiGet } from '@/services/apiClient';
import type { FeatureFlag, FeatureFlagMap } from '@/types/feature';

export const featureService = {
  /** GET /features → flattened `{ key: visible }` map for `featuresSlice`. */
  getFeatures: async (): Promise<FeatureFlagMap> => {
    const flags = await apiGet<FeatureFlag[]>('/features');
    const map: FeatureFlagMap = {};
    for (const flag of flags) {
      map[flag.feature_key] = flag.is_visible;
    }
    return map;
  },
};
