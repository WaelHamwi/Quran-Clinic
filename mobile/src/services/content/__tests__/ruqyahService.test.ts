import { apiGet } from '@/services/common/apiClient';
import { contentCache } from '@/services/common/contentCache';
import { ruqyahService } from '@/services/content/ruqyahService';
import type { Disease } from '@/types/disease';

jest.mock('@/services/common/apiClient', () => ({
  apiGet: jest.fn(),
  apiGetPaginated: jest.fn(),
  apiPost: jest.fn(),
}));

jest.mock('@/services/common/contentCache', () => ({
  contentCache: { getItem: jest.fn(), setItem: jest.fn() },
  cachedFetch: jest.fn((_key, fetcher) => fetcher()),
}));

const apiGetMock = apiGet as jest.MockedFunction<typeof apiGet>;
const getItemMock = contentCache.getItem as jest.MockedFunction<typeof contentCache.getItem>;

const disease = (id: number, ar: string, en: string): Disease =>
  ({ id, name: { ar, en }, slug: `d-${id}`, description: { ar: '', en: '' }, display_order: 0 }) as Disease;

describe('ruqyahService.searchDiseasesOfflineFirst', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns the server search result when the network call succeeds', async () => {
    apiGetMock.mockResolvedValue([disease(1, 'صداع', 'Headache')]);

    const results = await ruqyahService.searchDiseasesOfflineFirst('Head');

    expect(results).toEqual([disease(1, 'صداع', 'Headache')]);
  });

  it('falls back to filtering the cached disease list when the network call fails', async () => {
    apiGetMock.mockRejectedValue(new Error('offline'));
    getItemMock.mockResolvedValue({
      items: [disease(1, 'صداع', 'Headache'), disease(2, 'ألم الظهر', 'Backache')],
      meta: {} as any,
    });

    const results = await ruqyahService.searchDiseasesOfflineFirst('head');

    expect(results.map((d) => d.id)).toEqual([1]);
  });

  it('matches the cached list by Arabic name too', async () => {
    apiGetMock.mockRejectedValue(new Error('offline'));
    getItemMock.mockResolvedValue({
      items: [disease(1, 'صداع', 'Headache')],
      meta: {} as any,
    });

    const results = await ruqyahService.searchDiseasesOfflineFirst('صد');

    expect(results.map((d) => d.id)).toEqual([1]);
  });

  it('rethrows the original error when nothing is cached', async () => {
    const err = new Error('offline');
    apiGetMock.mockRejectedValue(err);
    getItemMock.mockResolvedValue(null);

    await expect(ruqyahService.searchDiseasesOfflineFirst('head')).rejects.toThrow('offline');
  });
});
