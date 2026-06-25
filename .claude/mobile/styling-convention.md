# STYLING CONVENTION & CSS FILE STRUCTURE

## STYLING APPROACH
- Use React Native StyleSheet.create for all styles
- NO inline styles (performance and maintainability)
- NO global CSS files (component-scoped styles only)
- NEVER mix styles inside .tsx component files
- ALWAYS create separate .styles.ts file for each component
- Use BEM-like naming convention for style keys: component__element--modifier
- Export styles object from .styles.ts and import into .tsx

## FILE STRUCTURE
Each component SHALL have a dedicated adjacent stylesheet file:

```
src/components/onboarding/OnboardingPager.tsx        ← JSX only, no StyleSheet
src/components/onboarding/OnboardingPager.styles.ts  ← StyleSheet.create + color constants
```

Export pattern:
```ts
// *.styles.ts
export const myComponentStyles = StyleSheet.create({ ... });

// *.tsx
import { myComponentStyles as s } from './MyComponent.styles';
```

## COLOR CONSTANTS

- Declare each color as a standalone `const` at the top of the `.styles.ts` file.
- Names must be descriptive and SCREAMING_SNAKE_CASE: `BRAND_500`, `TEXT_PRIMARY`, `WHITE`.
- **NEVER** group colors into an object (`const FIGMA = {}`, `const F = {}`, `const C = {}`).
  These collapse distinct semantic colors into an opaque bag and make searching harder.

Correct:
```ts
const BRAND_500 = '#135452';
const TEXT_PRIMARY = '#181d27';
const WHITE = '#ffffff';
```

Wrong:
```ts
const FIGMA = { brand500: '#135452', textPrimary: '#181d27' }; // ❌
const F = { bgPrimary: '#ffffff' };                            // ❌
```

## LAYOUT FILES (app/**/_layout.tsx)

Layout files in `app/` are Expo Router entry points — they must be pure re-exports with
zero logic, zero styles, and zero comments.

```tsx
// app/(tabs)/_layout.tsx  ✅
export { TabsLayout as default } from '@/components/layout/TabsLayout';
```

All navigation logic (hooks, screen options, tab configuration) belongs in the
corresponding component inside `src/components/layout/`.
