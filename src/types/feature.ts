/** A single admin-controlled feature visibility flag. */
export interface FeatureFlag {
  feature_key: string;
  is_visible: boolean;
}

/** Flattened flag map consumed by `featuresSlice`. */
export type FeatureFlagMap = Record<string, boolean>;
