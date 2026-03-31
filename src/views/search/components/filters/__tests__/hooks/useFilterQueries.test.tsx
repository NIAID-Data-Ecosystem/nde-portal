import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterQueries } from '../../hooks/useFilterQueries';

jest.mock('src/views/search/hooks/useAggregation', () => ({
  ALL_FACET_PROPERTIES: 'facet.field,includedInDataCatalog.name,date',
  buildAggregationQueryKey: (params: any) => ['aggregation', params],
  fetchAggregation: jest.fn(),
}));

jest.mock('src/hooks/api/helpers', () => ({
  fetchMetadata: jest.fn(),
}));

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
  });

  it('fetches standard facet query and includes exists/not-exists terms', async () => {
    fetchAggregation.mockResolvedValueOnce({
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
      expect(result.current.results['facet-id'].data.length).toBeGreaterThan(0),
    );

    expect(result.current.error).toBeNull();
    expect(result.current.results['facet-id'].data.map(d => d.term)).toEqual([
      '_exists_',
      't1',
      '-_exists_',
    ]);
    // _exists_ count = total - missing = 10 - 3 = 7
    expect(result.current.results['facet-id'].data[0].count).toBe(7);
    // -_exists_ count = missing = 3
    expect(result.current.results['facet-id'].data[2].count).toBe(3);
  });

  it('fetches source facet query with metadata grouping', async () => {
    fetchAggregation.mockResolvedValueOnce({
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
      expect(result.current.results['source-id'].data.length).toBeGreaterThan(
        0,
      ),
    );
    expect(result.current.results['source-id'].data[0].groupBy).toBe('IID');
  });

  it('fetches histogram query and appends not-exists count', async () => {
    fetchAggregation.mockResolvedValueOnce({
      total: 5,
      facets: {
        date: {
          _type: 'date_histogram',
          terms: [{ term: '2020-01-01', count: 4 }],
          missing: 1,
          other: 0,
          total: 4,
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
      expect(result.current.results.date.data.length).toBeGreaterThan(0),
    );
    expect(result.current.results.date.data.map(d => d.term)).toEqual([
      '2020-01-01',
      '-_exists_',
    ]);
  });

  it('returns empty terms when facets are missing and handles advanced search mode', async () => {
    fetchAggregation.mockResolvedValueOnce({ total: 0 });

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
    expect(result.current.results['facet-id'].data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('respects showMissing: false and does not append -_exists_ term', async () => {
    fetchAggregation.mockResolvedValueOnce({
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
      expect(result.current.results['facet-id'].data.length).toBeGreaterThan(0),
    );
    expect(result.current.results['facet-id'].data.map(d => d.term)).toEqual([
      '_exists_',
      't1',
    ]);
  });
});
