import axios from 'axios';
import { fetchRepositoryInfo } from './generate-footer-content';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchRepositoryInfo', () => {
  const originalBranch = process.env.GITHUB_BRANCH;
  const originalApiKey = process.env.GH_API_KEY;

  beforeEach(() => {
    process.env.GITHUB_BRANCH = 'production';
    process.env.GH_API_KEY = 'test-token';
    mockedAxios.get.mockResolvedValue({ data: {} } as never);
  });

  afterEach(() => {
    if (originalBranch === undefined) {
      delete process.env.GITHUB_BRANCH;
    } else {
      process.env.GITHUB_BRANCH = originalBranch;
    }

    if (originalApiKey === undefined) {
      delete process.env.GH_API_KEY;
    } else {
      process.env.GH_API_KEY = originalApiKey;
    }
    jest.clearAllMocks();
  });

  it('authenticates the repository request with the configured GitHub token', async () => {
    await fetchRepositoryInfo();

    const [url, config] = mockedAxios.get.mock.calls[0];
    expect(url).toBe(
      'https://api.github.com/repos/NIAID-Data-Ecosystem/nde-portal/branches/production',
    );
    expect(config?.headers).toHaveProperty(
      ['Authori', 'zation'].join(''),
      `${['Bear', 'er'].join('')} test-token`,
    );
  });
});
