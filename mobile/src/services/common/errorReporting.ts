export function reportError(error: Error, extra?: Record<string, unknown>): void {
  if (__DEV__) {
    console.warn('[errorReporting]', error, extra);
  }
}
