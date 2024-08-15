import {
  createCommonQuery,
  createNotExistsQuery,
  createCommonQueryWithMetadata,
} from '../../utils/queries';
import { fetchSearchResults } from 'src/utils/api';
import { Metadata } from 'src/hooks/api/types';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

jest.mock('src/utils/api', () => ({
  fetchSearchResults: jest.fn(),
}));

jest.mock('src/hooks/api/helpers', () => ({
  fetchMetadata: jest.fn(),
}));

jest.mock('src/utils/querystring-helpers', () => ({
  encodeString: jest.fn((str: string) => `encoded-${str}`),
}));

describe('API Query Functions', () => {
  const params = {
    advancedSearch: 'false',
    q: 'test',
    extra_filter: 'filter',
    facets: 'facet',
  };

  const fetchSearchResultsResponse: FetchSearchResultsResponse = {
    total: 100,
    results: [],
    facets: {
      facet: {
        terms: [
          {
            term: 'term1',
            count: 50,
          },
          { term: 'term2', count: 50 },
        ],
        missing: 0,
        other: 0,
        total: 0,
        _type: '',
      },
      multi_terms_agg: {
        terms: [
          { term: 'group1|term1', count: 0 },
          { term: 'group2|term2', count: 0 },
        ],
        missing: 0,
        other: 0,
        total: 0,
        _type: '',
      },
    },
  };

  const metadata: Metadata = {
    src: {
      source1: {
        code: {} as Metadata['src'][number]['code'],
        stats: {} as Metadata['src'][number]['stats'],
        version: {} as Metadata['src'][number]['version'],
        sourceInfo: {
          name: 'term1',
          identifier: 'term1',
          description: 'Lorem',
          genre: 'Generalist',
          url: '#',
          schema: null,
        },
      },

      source2: {
        code: {} as Metadata['src'][number]['code'],
        stats: {} as Metadata['src'][number]['stats'],
        version: {} as Metadata['src'][number]['version'],
        sourceInfo: {
          name: 'term2',
          identifier: 'term2',
          description: 'ipsum',
          genre: 'IID',
          url: '#',
          schema: null,
        },
      },
    },
    biothing_type: '',
    build_date: '',
    build_version: '',
  };

  describe('createCommonQuery', () => {
    it('should build a query correctly', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );

      const query = createCommonQuery({
        params,
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: 'filter AND _exists_:facet',
          filters: '',
          size: 0,
          facet_size: 1000,
          sort: undefined,
        },
      ]);

      const data = await query.queryFn();

      expect(data).toEqual(fetchSearchResultsResponse);

      const selectedData = query.select!(fetchSearchResultsResponse);

      expect(selectedData).toEqual({
        facet: 'facet',
        results: [
          {
            label: 'Any Specified',
            term: '_exists_',
            count: 100,
            facet: 'facet',
          },
          { term: 'term1', count: 50, groupBy: 'group1' },
          { term: 'term2', count: 50, groupBy: 'group2' },
        ],
      });
    });

    it('should handle missing extra_filter', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );
      const paramsmissingExtraFilters = {
        ...params,
        facets: 'facet',
        extra_filter: '',
      };
      const query = createCommonQuery({
        params: paramsmissingExtraFilters,
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: '_exists_:facet',
          facets: 'facet',
          filters: '',
          size: 0,
          facet_size: 1000,
          sort: undefined,
        },
      ]);

      const data = await query.queryFn();
      expect(data).toEqual(fetchSearchResultsResponse);
    });

    it('should handle missing facets', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );

      const query = createCommonQuery({
        params: { ...params, facets: '' },
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: 'filter',
          filters: '',
          size: 0,
          facet_size: 1000,
          sort: undefined,
          facets: '', // Ensure this matches the original params
        },
      ]);

      const data = await query.queryFn();
      expect(data).toEqual(fetchSearchResultsResponse);
    });
    it('should handle missing extra_filter and missing facet', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );
      const paramsmissingExtraFilters = {
        ...params,
        facets: '',
        extra_filter: '',
      };
      const query = createCommonQuery({
        params: paramsmissingExtraFilters,
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: '',
          facets: '',
          filters: '',
          size: 0,
          facet_size: 1000,
          sort: undefined,
        },
      ]);

      const data = await query.queryFn();
      expect(data).toEqual(fetchSearchResultsResponse);
    });
  });

  describe('createNotExistsQuery', () => {
    it('should build a query correctly', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );

      const query = createNotExistsQuery({
        params,
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: 'filter AND -_exists_:facet',
          filters: '',
          size: 0,
          facet_size: 0,
          sort: undefined,
        },
      ]);

      const data = await query.queryFn();

      expect(data).toEqual(fetchSearchResultsResponse);

      const selectedData = query.select!(fetchSearchResultsResponse);

      expect(selectedData).toEqual({
        facet: 'facet',
        results: [
          {
            label: 'Not Specified',
            term: '-_exists_',
            count: 100,
            facet: 'facet',
          },
        ],
      });
    });

    it('should handle missing extra_filter', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );

      const query = createNotExistsQuery({
        //@ts-ignore
        params: { ...params, facets: 'facet', extra_filter: '' },
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          facets: 'facet',
          extra_filter: '-_exists_:facet',
          filters: '',
          size: 0,
          facet_size: 0,
          sort: undefined,
        },
      ]);

      const data = await query.queryFn();
      expect(data).toEqual(fetchSearchResultsResponse);
    });

    it('should handle missing facets', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );

      const query = createNotExistsQuery({
        params: { ...params, facets: '' },
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: 'filter',
          filters: '',
          size: 0,
          facet_size: 0,
          sort: undefined,
          facets: '',
        },
      ]);

      const data = await query.queryFn();
      expect(data).toEqual(fetchSearchResultsResponse);
    });
    it('should handle missing extra_filter and missing facet', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );
      const paramsmissingExtraFilters = {
        ...params,
        facets: '',
        extra_filter: '',
      };
      const query = createCommonQuery({
        params: paramsmissingExtraFilters,
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: '',
          facets: '',
          filters: '',
          size: 0,
          facet_size: 1000,
          sort: undefined,
        },
      ]);

      const data = await query.queryFn();
      expect(data).toEqual(fetchSearchResultsResponse);
    });
  });

  describe('createCommonQueryWithMetadata', () => {
    it('should build a query correctly', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );
      (fetchMetadata as jest.Mock).mockResolvedValue(metadata);

      const query = createCommonQueryWithMetadata({
        params,
        queryKey: ['testKey'],
      });

      expect(query.queryKey).toEqual([
        'testKey',
        {
          ...params,
          q: 'encoded-test',
          extra_filter: 'filter',
          filters: '',
          size: 0,
          facet_size: 1000,
          sort: undefined,
        },
      ]);

      const data = await query.queryFn();

      expect(data).toEqual({ ...fetchSearchResultsResponse, repos: metadata });

      const selectedData = query.select!({
        ...fetchSearchResultsResponse,
        repos: metadata,
      });

      expect(selectedData).toEqual({
        facet: 'facet',
        results: [
          {
            label: 'term1',
            term: 'term1',
            count: 50,
            facet: 'facet',
            groupBy: 'Generalist',
          },
          {
            label: 'term2',
            term: 'term2',
            count: 50,
            facet: 'facet',
            groupBy: 'IID',
          },
        ],
      });
    });

    it('should handle missing metadata', async () => {
      (fetchSearchResults as jest.Mock).mockResolvedValue(
        fetchSearchResultsResponse,
      );
      (fetchMetadata as jest.Mock).mockResolvedValue(null);

      const query = createCommonQueryWithMetadata({
        params,
        queryKey: ['testKey'],
      });

      const data = await query.queryFn();
      expect(data).toEqual({ ...fetchSearchResultsResponse, repos: null });
    });

    it('should handle missing data in response', async () => {
      const mockResponse = null;
      (fetchSearchResults as jest.Mock).mockResolvedValue(mockResponse);
      (fetchMetadata as jest.Mock).mockResolvedValue(metadata);

      const query = createCommonQueryWithMetadata({
        params: { ...params, facets: 'facet' },
        queryKey: ['testKey'],
      });
      //@ts-ignore
      await expect(() => query.select!(mockResponse)).toThrow(
        'No data returned from fetchSearchResults',
      );
    });

    it('should handle missing facets in response', async () => {
      const mockResponse = { total: 100, facets: '' };
      (fetchSearchResults as jest.Mock).mockResolvedValue(mockResponse);
      (fetchMetadata as jest.Mock).mockResolvedValue(metadata);

      const query = createCommonQueryWithMetadata({
        params: { ...params, facets: '' },
        queryKey: ['testKey'],
      });
      //@ts-ignore
      await expect(() => query.select!(mockResponse)).toThrow(
        'No facets returned from fetchSearchResults',
      );
    });
  });
});