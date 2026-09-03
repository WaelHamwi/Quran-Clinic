import { formatTimeDraft, normalizeTime, shiftTime } from '@/utils/timeInput';

describe('shiftTime', () => {
  it('moves the time by whole minutes', () => {
    expect(shiftTime('06:00', 30)).toBe('06:30');
    expect(shiftTime('06:00', -30)).toBe('05:30');
  });

  it('wraps around midnight in both directions', () => {
    expect(shiftTime('23:45', 30)).toBe('00:15');
    expect(shiftTime('00:15', -30)).toBe('23:45');
  });

  it('keeps the zero-padded HH:MM shape', () => {
    expect(shiftTime('09:05', 1)).toBe('09:06');
  });
});

describe('formatTimeDraft', () => {
  it('inserts the colon once the hour is complete', () => {
    expect(formatTimeDraft('0')).toBe('0');
    expect(formatTimeDraft('06')).toBe('06');
    expect(formatTimeDraft('063')).toBe('06:3');
    expect(formatTimeDraft('0630')).toBe('06:30');
  });

  it('drops non-digits and caps at four digits', () => {
    expect(formatTimeDraft('0a6:3b0')).toBe('06:30');
    expect(formatTimeDraft('063012')).toBe('06:30');
  });
});

describe('normalizeTime', () => {
  it('pads a bare hour to a full time', () => {
    expect(normalizeTime('6')).toBe('06:00');
    expect(normalizeTime('06')).toBe('06:00');
  });

  it('splits the last two digits as minutes', () => {
    expect(normalizeTime('630')).toBe('06:30');
    expect(normalizeTime('0630')).toBe('06:30');
    expect(normalizeTime('06:30')).toBe('06:30');
  });

  it('rejects impossible times', () => {
    expect(normalizeTime('2530')).toBeNull();
    expect(normalizeTime('0680')).toBeNull();
    expect(normalizeTime('')).toBeNull();
    expect(normalizeTime('--:--')).toBeNull();
  });

  it('accepts the edges of the day', () => {
    expect(normalizeTime('0000')).toBe('00:00');
    expect(normalizeTime('2359')).toBe('23:59');
  });
});
