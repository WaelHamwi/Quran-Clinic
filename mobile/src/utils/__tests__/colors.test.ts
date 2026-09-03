import { luminance, readableOn } from '@/utils/colors';

describe('luminance', () => {
  it('spans black to white', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#ffffff')).toBe(1);
  });

  it('expands 3-digit hex', () => {
    expect(luminance('#fff')).toBe(luminance('#ffffff'));
  });

  it('returns 0 for a non-hex value', () => {
    expect(luminance('rgba(0,0,0,0.5)')).toBe(0);
  });
});

describe('readableOn', () => {
  it('swaps a dark pick for white on a dark surface', () => {
    expect(readableOn('#181d27', true)).toBe('#ffffff');
    expect(readableOn('#135452', true)).toBe('#ffffff');
  });

  it('keeps a light pick on a dark surface', () => {
    expect(readableOn('#fdb022', true)).toBe('#fdb022');
    expect(readableOn('#ffffff', true)).toBe('#ffffff');
  });

  it('swaps a light pick for near-black on a light surface', () => {
    expect(readableOn('#ffffff', false)).toBe('#181d27');
  });

  it('keeps a dark pick on a light surface', () => {
    expect(readableOn('#135452', false)).toBe('#135452');
  });
});
