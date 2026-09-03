import { renderHook } from '@testing-library/react-native';
import { groupByType } from '@/utils/recordings';
import type { AccessibleRecording } from '@/types/recording';

const recording = (id: number, session: number, type: 'summarized' | 'detailed') => ({
  id,
  type,
  session_number: session,
  requires_subscription: type === 'detailed',
  audio_url: `https://example.test/${id}.mp3`,
  description: { ar: `نص ${id}`, en: `Text ${id}` },
  segments: null,
});

let mockSubRecordings: ReturnType<typeof recording>[] = [];
let mockCatRecordings: ReturnType<typeof recording>[] = [];

jest.mock('@/hooks/hospital/useSubcategory', () => ({
  useSubcategory: (slug: string) => ({
    subcategory: slug ? { id: 21, slug, name: { ar: 'قسم', en: 'Sub' } } : undefined,
    diseases: [],
    recordings: slug ? mockSubRecordings : [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/hooks/hospital/useCategory', () => ({
  useCategory: (slug: string) => ({
    category: slug ? { id: 13, slug, name: { ar: 'قسم', en: 'Cat' } } : undefined,
    subcategories: [],
    directDiseases: [],
    recordings: slug ? mockCatRecordings : [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('@/hooks/hospital/useDisease', () => ({
  useDisease: () => ({ disease: undefined, isLoading: false, error: null, refetch: jest.fn() }),
}));

jest.mock('@/hooks/hospital/useRecordings', () => ({
  useRecordings: () => ({ recordings: [], isLoading: false, error: null, refetch: jest.fn() }),
}));

jest.mock('@/hooks/content/useFavorites', () => ({
  useFavorites: () => ({ isFavorited: () => false, toggleFavorite: jest.fn() }),
}));

jest.mock('@/hooks/common/useRefresh', () => ({
  useRefresh: () => ({ refreshing: false, onRefresh: jest.fn() }),
}));

jest.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({ isArabic: true, t: { hospital: {}, disease: {} } }),
}));

jest.mock('@/store/hooks', () => ({
  useAppSelector: () => false,
  useAppDispatch: () => jest.fn(),
}));

// eslint-disable-next-line import/first
import { useWirdScreenSource } from '@/hooks/player/useWirdScreenSource';

const sessionsOfFirstTab = (recordings: AccessibleRecording[]) =>
  groupByType(recordings)[0]?.recordings ?? [];

describe('useWirdScreenSource — a node that owns its wird directly', () => {
  beforeEach(() => {
    mockSubRecordings = [];
    mockCatRecordings = [];
  });

  it('surfaces every recording a direct subcategory holds, not just the first', () => {
    mockSubRecordings = [1, 2, 3, 4, 5].map((n) => recording(n + 30, n, 'summarized'));

    const { result } = renderHook(() =>
      useWirdScreenSource('recordings', 'sub-direct', 'subcategory'),
    );

    expect(result.current.recordings).toHaveLength(5);
    expect(sessionsOfFirstTab(result.current.recordings)).toHaveLength(5);
  });

  it('keeps a direct subcategory to one tab per type, each holding all of its sessions', () => {
    mockSubRecordings = [
      recording(31, 1, 'summarized'),
      recording(32, 2, 'summarized'),
      recording(33, 3, 'detailed'),
      recording(34, 4, 'detailed'),
    ];

    const { result } = renderHook(() =>
      useWirdScreenSource('recordings', 'sub-direct', 'subcategory'),
    );

    const groups = groupByType(result.current.recordings);

    expect(groups.map((g) => [g.type, g.recordings.length])).toEqual([
      ['summarized', 2],
      ['detailed', 2],
    ]);
  });

  it('plays a direct subcategory in the session order the CMS listed', () => {
    mockSubRecordings = [
      recording(42, 5, 'summarized'),
      recording(36, 1, 'summarized'),
      recording(43, 4, 'summarized'),
    ];

    const { result } = renderHook(() =>
      useWirdScreenSource('recordings', 'sub-direct', 'subcategory'),
    );

    expect(result.current.recordings.map((r) => r.id)).toEqual([36, 43, 42]);
  });

  it('reads the subcategory, not the category, when the route says so', () => {
    mockSubRecordings = [recording(31, 1, 'summarized'), recording(32, 2, 'summarized')];
    mockCatRecordings = [recording(90, 1, 'summarized')];

    const { result } = renderHook(() =>
      useWirdScreenSource('recordings', 'sub-direct', 'subcategory'),
    );

    expect(result.current.contextId).toBe(21);
    expect(result.current.recordings.map((r) => r.id)).toEqual([31, 32]);
  });

  it('surfaces every recording a direct category holds', () => {
    mockCatRecordings = [1, 2, 3, 4].map((n) => recording(n + 10, n, 'summarized'));

    const { result } = renderHook(() =>
      useWirdScreenSource('recordings', 'cat-direct', 'category'),
    );

    expect(result.current.recordings).toHaveLength(4);
    expect(sessionsOfFirstTab(result.current.recordings)).toHaveLength(4);
  });
});
