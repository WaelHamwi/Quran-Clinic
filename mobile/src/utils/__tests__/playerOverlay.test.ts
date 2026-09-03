import { screenHasOwnPlayer, screenIsTabHosted, shouldHideGlobalPlayer } from '@/utils/playerOverlay';

describe('screenHasOwnPlayer', () => {
  it('covers both wird routes, which already show a full transport', () => {
    expect(screenHasOwnPlayer('/hospital/disease/anxiety')).toBe(true);
    expect(screenHasOwnPlayer('/hospital/recordings/general')).toBe(true);
  });

  it('leaves the bar on the subscription screen pushed from a wird screen', () => {
    // It has no player of its own, so hiding the bar would strand playback.
    expect(screenHasOwnPlayer('/hospital/disease/subscription')).toBe(false);
  });

  it('keeps covering the mushaf reader', () => {
    expect(screenHasOwnPlayer('/mushaf/2')).toBe(true);
  });

  it('leaves other stacked hospital screens alone', () => {
    expect(screenHasOwnPlayer('/hospital/subcategories/ruqyah')).toBe(false);
    expect(screenHasOwnPlayer('/hospital/diseases/heart')).toBe(false);
  });
});

describe('screenIsTabHosted', () => {
  it('matches the tab roots, which host the bars themselves', () => {
    for (const path of ['/', '/mushaf', '/askme', '/favorites', '/more']) {
      expect(screenIsTabHosted(path)).toBe(true);
    }
  });

  it('does not match a stacked screen under a tab', () => {
    expect(screenIsTabHosted('/mushaf/2')).toBe(false);
  });
});

describe('shouldHideGlobalPlayer', () => {
  it('hides the floating bar on a wird screen', () => {
    expect(shouldHideGlobalPlayer('/hospital/disease/anxiety')).toBe(true);
  });

  it('shows it again once the user navigates off that screen', () => {
    // Playback is untouched by hiding, so the bar returns mid-track.
    expect(shouldHideGlobalPlayer('/hospital/subcategories/ruqyah')).toBe(false);
    expect(shouldHideGlobalPlayer('/tawjihat/listening-instructions')).toBe(false);
  });
});
