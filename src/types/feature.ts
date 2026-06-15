/**
 * Flattened admin feature-visibility map: `{ feature_key: is_visible }`.
 * Returned directly by `GET /features` and consumed by `featuresSlice`.
 */
export type FeatureFlagMap = Record<string, boolean>;
