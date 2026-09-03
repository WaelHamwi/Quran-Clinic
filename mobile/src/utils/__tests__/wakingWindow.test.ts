import {
  parseHHMM,
  minutesOfDay,
  isWithinWakingWindow,
  localDayKey,
} from '@/utils/wakingWindow';

const at = (hour: number, minute: number): Date => new Date(2026, 6, 28, hour, minute, 0);

describe('parseHHMM', () => {
  it('parses a valid time', () => {
    expect(parseHHMM('04:30')).toEqual({ hour: 4, minute: 30 });
    expect(parseHHMM('23:59')).toEqual({ hour: 23, minute: 59 });
  });

  it('rejects malformed and out-of-range values', () => {
    expect(parseHHMM('')).toBeNull();
    expect(parseHHMM('abc')).toBeNull();
    expect(parseHHMM('24:00')).toBeNull();
    expect(parseHHMM('12:60')).toBeNull();
  });
});

describe('minutesOfDay', () => {
  it('converts to minutes since midnight', () => {
    expect(minutesOfDay('00:00')).toBe(0);
    expect(minutesOfDay('05:45')).toBe(345);
  });

  it('is null for a malformed time', () => {
    expect(minutesOfDay('5:xx')).toBeNull();
  });
});

describe('isWithinWakingWindow', () => {
  it('matches inside a same-day window, inclusive of both bounds', () => {
    expect(isWithinWakingWindow(at(4, 30), '04:30', '05:50')).toBe(true);
    expect(isWithinWakingWindow(at(5, 0), '04:30', '05:50')).toBe(true);
    expect(isWithinWakingWindow(at(5, 50), '04:30', '05:50')).toBe(true);
  });

  it('rejects outside a same-day window', () => {
    expect(isWithinWakingWindow(at(4, 29), '04:30', '05:50')).toBe(false);
    expect(isWithinWakingWindow(at(5, 51), '04:30', '05:50')).toBe(false);
  });

  it('wraps around midnight', () => {
    expect(isWithinWakingWindow(at(23, 30), '23:00', '05:00')).toBe(true);
    expect(isWithinWakingWindow(at(2, 0), '23:00', '05:00')).toBe(true);
    expect(isWithinWakingWindow(at(12, 0), '23:00', '05:00')).toBe(false);
  });

  it('matches nothing when the window is malformed or zero-length', () => {
    expect(isWithinWakingWindow(at(5, 0), 'oops', '05:50')).toBe(false);
    expect(isWithinWakingWindow(at(5, 0), '04:30', '')).toBe(false);
    expect(isWithinWakingWindow(at(5, 0), '05:00', '05:00')).toBe(false);
  });
});

describe('localDayKey', () => {
  it('zero-pads month and day', () => {
    expect(localDayKey(new Date(2026, 0, 5, 3, 0))).toBe('2026-01-05');
    expect(localDayKey(at(4, 30))).toBe('2026-07-28');
  });
});
