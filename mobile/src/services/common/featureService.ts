import { apiGet } from '@/services/common/apiClient';
import type { FeatureFlagMap } from '@/types/feature';

export const featureService = {
  /**
   * GET /features → `{ key: visible }` map for `featuresSlice`.
   * The backend already returns a flattened `{ feature_key: is_visible }` object,
   * so it maps straight onto `FeatureFlagMap`.
   */
  getFeatures: (): Promise<FeatureFlagMap> => apiGet<FeatureFlagMap>('/features'),
};
