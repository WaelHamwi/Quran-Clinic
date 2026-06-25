import type { FeatureFlagMap } from '@/types/feature';

/**
 * Canonical feature keys — must mirror the backend `feature_flags.feature_key`
 * values (see FeatureFlagSeeder). Single source of truth for the mobile side.
 */
export const FEATURE_KEYS = {
  HOSPITAL: 'hospital',
  ADHKAR: 'adhkar',
  TAHSINAT: 'tahsinat',
  MUSHAF: 'mushaf',
  COURSES: 'courses',
  SPONSORS: 'sponsors',
  ASK_ME: 'ask_me',
} as const;

/**
 * Parent → child nesting. The "Clinic" (المشفى / hospital) screen hosts Courses,
 * Adhkar and Tahsinat as sub-sections, so hiding the parent must hide them too.
 */
export const FEATURE_PARENT: Record<string, string> = {
  [FEATURE_KEYS.ADHKAR]: FEATURE_KEYS.HOSPITAL,
  [FEATURE_KEYS.TAHSINAT]: FEATURE_KEYS.HOSPITAL,
  [FEATURE_KEYS.COURSES]: FEATURE_KEYS.HOSPITAL,
};

/**
 * Pure visibility resolver with single-level parent cascade.
 * Unknown keys default to visible — a missing flag must never hide a feature.
 */
export function resolveFeatureVisible(flags: FeatureFlagMap, key: string): boolean {
  if (flags[key] === false) return false;
  const parent = FEATURE_PARENT[key];
  if (parent && flags[parent] === false) return false;
  return true;
}
