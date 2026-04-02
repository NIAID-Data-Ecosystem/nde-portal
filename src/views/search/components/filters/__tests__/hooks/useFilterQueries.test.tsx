import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterQueries } from '../../hooks/useFilterQueries';
import router from 'next-router-mock';

// Mock only the fetchSearchResults function so fetchAggregation works correctly
jest.mock('src/utils/api', () => {
  const actual = jest.requireActual('src/utils/api');
  return {
    ...actual,
    fetchSearchResults: jest.fn(),
  };
});

jest.mock('src/views/search/hooks/useAggregation', () => {
  // Get the actual module
  const actual = jest.requireActual('src/views/search/hooks/useAggregation');
  return {
    ...actual,
    fetchAggregation: jest.fn(),
  };
});

jest.mock('src/hooks/api/helpers', () => ({
  fetchMetadata: jest.fn(),
}));

const { fetchSearchResults } = jest.requireMock('src/utils/api');
const { fetchAggregation } = jest.requireMock(
  'src/views/search/hooks/useAggregation',
);
const { fetchMetadata } = jest.requireMock('src/hooks/api/helpers');

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('useFilterQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set router.isReady to true to enable queries
    router.isReady = true;
  });

  it('fetches standard facet query and includes exists/not-exists terms', async () => {
    fetchSearchResults.mockResolvedValueOnce({
      total: 10,
      facets: {
        'facet.field': {
          _type: 'terms',
          terms: [{ term: 't1', count: 2 }],
          missing: 3,
          other: 5,
          total: 7,
        },
      },
    });

    const { result } = renderHook(
      () =>
        useFilterQueries({
          configs: [
            {
              id: 'facet-id',
              name: 'Facet',
              property: 'facet.field',
              description: '',
              category: 'Shared',
              queryType: 'facet',
            },
          ] as any,
          params: {
            q: 'term',
            extra_filter: 'x:y',
            advancedSearch: 'false',
          } as any,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(
        result.current.results?.['facet-id']?.data.length ?? 0,
      ).toBeGreaterThan(0),
    );

    const results = result.current.results;
    expect(results).toBeDefined();
    if (!results) {
      throw new Error('Expected results to be defined');
    }

    expect(result.current.error).toBeNull();
    expect(results['facet-id'].data.map(d => d.term)).toEqual([
      '_exists_',
      't1',
      '-_exists_',
    ]);
    // _exists_ count = total - missing = 10 - 3 = 7
    expect(results['facet-id'].data[0].count).toBe(7);
    // -_exists_ count = missing = 3
    expect(results['facet-id'].data[2].count).toBe(3);
  });

  it('fetches source facet query with metadata grouping', async () => {
    fetchSearchResults.mockResolvedValueOnce({
      total: 5,
      facets: {
        'includedInDataCatalog.name': {
          _type: 'terms',
          terms: [{ term: 'repoA', count: 1 }],
          missing: 0,
          other: 0,
          total: 5,
        },
      },
    });
    fetchMetadata.mockResolvedValue({
      src: {
        a: { sourceInfo: { name: 'repoA', genre: 'IID' } },
      },
    });

    const { result } = renderHook(
      () =>
        useFilterQueries({
          configs: [
            {
              id: 'source-id',
              name: 'Source',
              property: 'includedInDataCatalog.name',
              description: '',
              category: 'Shared',
              queryType: 'source',
            },
          ] as any,
          params: { q: 'term' } as any,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(
        result.current.results?.['source-id']?.data.length ?? 0,
      ).toBeGreaterThan(0),
    );
    const results = result.current.results;
    expect(results).toBeDefined();
    if (!results) {
      throw new Error('Expected results to be defined');
    }
    expect(results['source-id'].data[0].groupBy).toBe('IID');
  });

  it('fetches histogram query and appends not-exists count', async () => {
    fetchSearchResults.mockResolvedValueOnce({
      total: 5,
      facets: {
        hist_dates: {
          _type: 'date_histogram',
          terms: [{ term: '2020-01-01', count: 4 }],
          missing: 1,
          other: 0,
          total: 4,
        },
        date: {
          missing: 1,
        },
      },
    });

    const { result } = renderHook(
      () =>
        useFilterQueries({
          configs: [
            {
              id: 'date',
              name: 'Date',
              property: 'date',
              description: '',
              category: 'Shared',
              queryType: 'histogram',
            },
          ] as any,
          params: { q: 'term' } as any,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(result.current.results?.date?.data.length ?? 0).toBeGreaterThan(0),
    );
    const results = result.current.results;
    expect(results).toBeDefined();
    if (!results) {
      throw new Error('Expected results to be defined');
    }
    expect(results.date.data.map(d => d.term)).toEqual([
      '2020-01-01',
      '-_exists_',
    ]);
  });

  it('returns empty terms when facets are missing and handles advanced search mode', async () => {
    fetchSearchResults.mockResolvedValueOnce({ total: 0 });

    const { result } = renderHook(
      () =>
        useFilterQueries({
          configs: [
            {
              id: 'facet-id',
              name: 'Facet',
              property: 'facet.field',
              description: '',
              category: 'Shared',
              queryType: 'facet',
            },
          ] as any,
          params: { q: 'raw-query', advancedSearch: 'true' } as any,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const results = result.current.results;
    expect(results).toBeDefined();
    if (!results) {
      throw new Error('Expected results to be defined');
    }
    expect(results['facet-id'].data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('respects showMissing: false and does not append -_exists_ term', async () => {
    fetchSearchResults.mockResolvedValueOnce({
      total: 10,
      facets: {
        'facet.field': {
          _type: 'terms',
          terms: [{ term: 't1', count: 2 }],
          missing: 3,
          other: 5,
          total: 7,
        },
      },
    });

    const { result } = renderHook(
      () =>
        useFilterQueries({
          configs: [
            {
              id: 'facet-id',
              name: 'Facet',
              property: 'facet.field',
              description: '',
              category: 'Shared',
              queryType: 'facet',
              showMissing: false,
            },
          ] as any,
          params: { q: 'term' } as any,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(
        result.current.results?.['facet-id']?.data.length ?? 0,
      ).toBeGreaterThan(0),
    );
    const results = result.current.results;
    expect(results).toBeDefined();
    if (!results) {
      throw new Error('Expected results to be defined');
    }
    expect(results['facet-id'].data.map(d => d.term)).toEqual([
      '_exists_',
      't1',
    ]);
  });
});
