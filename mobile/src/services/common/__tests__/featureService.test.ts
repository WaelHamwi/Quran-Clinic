import { apiGet } from '@/services/common/apiClient';
import { featureService } from '@/services/common/featureService';

jest.mock('@/services/common/apiClient', () => ({
  apiGet: jest.fn(),
}));

const apiGetMock = apiGet as jest.MockedFunction<typeof apiGet>;

describe('featureService', () => {
  it('getFeatures requests /features and returns the flag map', async () => {
    apiGetMock.mockResolvedValue({ mushaf: true, courses: false });

    const flags = await featureService.getFeatures();

    expect(apiGetMock).toHaveBeenCalledWith('/features');
    expect(flags).toEqual({ mushaf: true, courses: false });
  });

  it('propagates errors from the API layer', async () => {
    apiGetMock.mockRejectedValue(new Error('network down'));

    await expect(featureService.getFeatures()).rejects.toThrow('network down');
  });
});
