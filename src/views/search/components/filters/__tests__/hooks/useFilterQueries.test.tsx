import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFilterQueries } from '../../hooks/useFilterQueries';

jest.mock('src/utils/api', () => ({
  fetchSearchResults: jest.fn(),
}));

jest.mock('src/hooks/api/helpers', () => ({
  fetchMetadata: jest.fn(),
}));

jest.mock('src/utils/querystring-helpers', () => ({
  encodeString: jest.fn((q: string) => `enc:${q}`),
}));

const { fetchSearchResults } = jest.requireMock('src/utils/api');
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
    fetchSearchResults
      .mockResolvedValueOnce({
        total: 10,
        facets: { x: { terms: [{ term: 't1', count: 2 }] } },
      })
      .mockResolvedValueOnce({ total: 3, facets: { x: { terms: [] } } });

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
  });

  it('fetches source facet query with metadata grouping', async () => {
    fetchSearchResults.mockResolvedValue({
      total: 5,
      facets: { x: { terms: [{ term: 'repoA', count: 1 }] } },
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
    fetchSearchResults
      .mockResolvedValueOnce({
        total: 5,
        facets: { x: { terms: [{ term: '2020-01-01', count: 4 }] } },
      })
      .mockResolvedValueOnce({ total: 1, facets: { x: { terms: [] } } });

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
    fetchSearchResults.mockResolvedValue({ total: 0 });

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
});
