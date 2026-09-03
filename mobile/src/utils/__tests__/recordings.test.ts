import { groupByType, recordingTypeOf, sortSummarizedFirst } from '@/utils/recordings';

type Row = {
  id: number;
  type: 'summarized' | 'detailed' | undefined;
  requires_subscription: boolean;
  session_number: number;
};

const rec = (
  id: number,
  type: Row['type'],
  session_number: number,
  requires_subscription = type === 'detailed',
): Row => ({ id, type, requires_subscription, session_number });

describe('recordingTypeOf', () => {
  it('falls back to the paid flag for pre-migration cached rows without a type', () => {
    expect(recordingTypeOf(rec(1, undefined, 1, true))).toBe('detailed');
    expect(recordingTypeOf(rec(2, undefined, 1, false))).toBe('summarized');
  });
});

describe('sortSummarizedFirst', () => {
  it('puts summarized before detailed, then orders by session number', () => {
    const sorted = sortSummarizedFirst([
      rec(1, 'detailed', 2),
      rec(2, 'summarized', 2),
      rec(3, 'summarized', 1),
      rec(4, 'detailed', 1),
    ]);

    expect(sorted.map((r) => r.id)).toEqual([3, 2, 4, 1]);
  });
});

describe('groupByType', () => {
  it('returns one group per type, never one per recording', () => {
    // Three summarized sessions are one ruqyah to the reader — one tab.
    const groups = groupByType([
      rec(1, 'summarized', 1),
      rec(2, 'summarized', 2),
      rec(3, 'summarized', 3),
      rec(4, 'detailed', 1),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].type).toBe('summarized');
    expect(groups[0].recordings.map((r) => r.id)).toEqual([1, 2, 3]);
    expect(groups[1].type).toBe('detailed');
    expect(groups[1].recordings.map((r) => r.id)).toEqual([4]);
  });

  it('keeps each group in session order so it plays back-to-back correctly', () => {
    const groups = groupByType([
      rec(9, 'summarized', 3),
      rec(7, 'summarized', 1),
      rec(8, 'summarized', 2),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].recordings.map((r) => r.id)).toEqual([7, 8, 9]);
  });

  it('yields a single group when only one type is present', () => {
    const groups = groupByType([rec(1, 'detailed', 1), rec(2, 'detailed', 2)]);

    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe('detailed');
  });

  it('returns nothing for an empty list, so the tab strip hides', () => {
    expect(groupByType([])).toEqual([]);
  });

  it('groups untyped legacy rows by their paid flag', () => {
    const groups = groupByType([
      rec(1, undefined, 1, false),
      rec(2, undefined, 1, true),
      rec(3, undefined, 2, false),
    ]);

    expect(groups.map((g) => g.type)).toEqual(['summarized', 'detailed']);
    expect(groups[0].recordings.map((r) => r.id)).toEqual([1, 3]);
  });
});
