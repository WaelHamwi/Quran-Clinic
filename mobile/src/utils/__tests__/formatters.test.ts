import {
  formatMillis,
  formatSeconds,
  formatBytes,
  pickText,
  resolveMediaUrl,
} from '@/utils/formatters';

// formatters.ts imports API_URL from the native-bound services/api module; mock it so
// these pure formatting functions can be tested in isolation. jest.mock is hoisted above
// the imports by babel-jest, so the mock is in place before formatters.ts loads.
jest.mock('@/services/common/api', () => ({ API_URL: 'http://192.168.1.50:8000/api' }));

describe('formatMillis', () => {
  it('formats minutes:seconds', () => {
    expect(formatMillis(0)).toBe('0:00');
    expect(formatMillis(65_000)).toBe('1:05');
  });

  it('adds an hours segment past 60 minutes', () => {
    expect(formatMillis(3_661_000)).toBe('1:01:01');
  });

  it('guards against negative / non-finite input', () => {
    expect(formatMillis(-5)).toBe('0:00');
    expect(formatMillis(Number.NaN)).toBe('0:00');
  });
});

describe('formatSeconds', () => {
  it('converts seconds via formatMillis and tolerates null', () => {
    expect(formatSeconds(90)).toBe('1:30');
    expect(formatSeconds(null)).toBe('0:00');
  });
});

describe('formatBytes', () => {
  it('renders human-readable sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1_048_576)).toBe('1.0 MB');
  });
});

describe('pickText', () => {
  const value = { ar: 'عربي', en: 'English' };

  it('picks the active language with Arabic fallback', () => {
    expect(pickText(value, true)).toBe('عربي');
    expect(pickText(value, false)).toBe('English');
    expect(pickText(null, true)).toBe('');
  });
});

describe('resolveMediaUrl', () => {
  it('rewrites localhost URLs to the active API origin', () => {
    expect(resolveMediaUrl('http://localhost:8000/storage/a.jpg')).toBe(
      'http://192.168.1.50:8000/storage/a.jpg',
    );
  });

  it('leaves production URLs and null untouched', () => {
    expect(resolveMediaUrl('https://mashfa.odooclick.com/x.png')).toBe(
      'https://mashfa.odooclick.com/x.png',
    );
    expect(resolveMediaUrl(null)).toBeNull();
  });
});
