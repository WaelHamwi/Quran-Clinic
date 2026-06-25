// Intercepts incoming deep links before expo-router tries to match them to a route.
//
// The Google OAuth browser pages redirect to `quranicclinic://auth-callback` to hand
// control back to the app. Normally `openAuthSessionAsync` consumes that redirect
// internally and no OS deep link is emitted. But if the in-app auth session was already
// closed when the redirect fires (timing/edge cases), the URL leaks to the router and,
// because there is no `auth-callback` route, expo-router shows its "Unmatched Route"
// screen. Rewriting the path to the app root here makes that impossible — actual auth
// completion is handled by AuthContext's session polling, so all we need to do is keep
// the navigation on a valid screen.
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    if (typeof path === 'string' && path.includes('auth-callback')) {
      return '/';
    }
  } catch {
    return '/';
  }
  return path;
}
