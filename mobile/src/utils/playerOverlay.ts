/** Tab screens get the bars from TabBar, pinned above the tab bar. */
const TAB_PATHS = new Set(['/', '/mushaf', '/askme', '/favorites', '/more']);

/**
 * Screens carrying their own full player UI (ReaderPlayer, WirdPlayerFooter) or
 * an immersive print-identical reading surface the bar must not cover.
 *
 * Both wird routes belong here: the screen already shows a full transport, so a
 * second bar underneath it is a duplicate whose close button stops the audio the
 * top one is playing.
 */
const OWN_PLAYER_PREFIXES = ['/mushaf/', '/hospital/recordings/', '/hospital/disease/'];

/**
 * Pushed from a wird screen but not one itself — it has no player of its own,
 * so the bar still belongs there and playback stays reachable.
 */
const OWN_PLAYER_EXCEPTIONS = new Set(['/hospital/disease/subscription']);

/** Whether a screen hosts its own player, so the floating bar must stay off it. */
export function screenHasOwnPlayer(pathname: string): boolean {
  if (OWN_PLAYER_EXCEPTIONS.has(pathname)) return false;

  return OWN_PLAYER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function screenIsTabHosted(pathname: string): boolean {
  return TAB_PATHS.has(pathname);
}

/**
 * Purely about where the bar may appear — never about whether audio plays. A
 * hidden bar leaves playback untouched, so leaving the screen shows it again
 * mid-track.
 */
export function shouldHideGlobalPlayer(pathname: string): boolean {
  return screenIsTabHosted(pathname) || screenHasOwnPlayer(pathname);
}
