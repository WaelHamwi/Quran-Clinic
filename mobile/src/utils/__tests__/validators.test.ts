import {
  hasMinLength,
  isNonEmpty,
  isValidEmail,
  isValidTime,
} from '@/utils/validators';

describe('isValidEmail', () => {
  it.each(['a@b.co', 'user.name@example.com', '  spaced@trim.io  '])(
    'accepts %s',
    (value) => {
      expect(isValidEmail(value)).toBe(true);
    },
  );

  it.each(['', 'no-at', 'a@b', 'a@b.', 'two @spaces.com'])(
    'rejects %s',
    (value) => {
      expect(isValidEmail(value)).toBe(false);
    },
  );
});

describe('isNonEmpty', () => {
  it('is false for blank / whitespace-only strings', () => {
    expect(isNonEmpty('')).toBe(false);
    expect(isNonEmpty('   ')).toBe(false);
  });

  it('is true once there is real content', () => {
    expect(isNonEmpty(' x ')).toBe(true);
  });
});

describe('hasMinLength', () => {
  it('counts trimmed length', () => {
    expect(hasMinLength('  ab  ', 2)).toBe(true);
    expect(hasMinLength('  a  ', 2)).toBe(false);
  });
});

describe('isValidTime', () => {
  it.each(['00:00', '09:30', '23:59'])('accepts %s', (value) => {
    expect(isValidTime(value)).toBe(true);
  });

  it.each(['24:00', '12:60', '9:30', '7:5', 'noon'])(
    'rejects %s',
    (value) => {
      expect(isValidTime(value)).toBe(false);
    },
  );
});
