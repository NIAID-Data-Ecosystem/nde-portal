import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { COLLECTION_SIZE_BUCKETS } from 'src/views/search/config/collection-size';
import {
  trimEmptyEdgeBuckets,
  useCollectionSizeBuckets,
} from './useCollectionSizeBuckets';

jest.mock('src/utils/api', () => ({
  fetchSearchResults: jest.fn(),
}));

const { fetchSearchResults } = jest.requireMock('src/utils/api');

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

/** Every request's params, keyed by the bucket range in its extra_filter. */
const requestsByRange = () =>
  Object.fromEntries(
    fetchSearchResults.mock.calls.map(([params]: any[]) => {
      const range = params.extra_filter.match(/\[[^\]]*\]/)?.[0];
      return [range, params];
    }),
  );

describe('trimEmptyEdgeBuckets', () => {
  const bucket = (key: string, count: number) => ({ key, min: 0, count });

  it('drops empty buckets at both ends', () => {
    expect(
      trimEmptyEdgeBuckets([
        bucket('a', 0),
        bucket('b', 5),
        bucket('c', 2),
        bucket('d', 0),
      ]).map(b => b.key),
    ).toEqual(['b', 'c']);
  });

  // A gap in the middle is information, and dropping it would make the decades
  // unevenly spaced.
  it('keeps empty buckets between occupied ones', () => {
    expect(
      trimEmptyEdgeBuckets([
        bucket('a', 5),
        bucket('b', 0),
        bucket('c', 2),
      ]).map(b => b.key),
    ).toEqual(['a', 'b', 'c']);
  });

  it('returns nothing when every bucket is empty', () => {
    expect(trimEmptyEdgeBuckets([bucket('a', 0), bucket('b', 0)])).toEqual([]);
  });
});

describe('useCollectionSizeBuckets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('counts every bucket with its own range query', async () => {
    fetchSearchResults.mockResolvedValue({
      results: [],
      total: 7,
      facets: null,
    });

    const { result } = renderHook(
      () => useCollectionSizeBuckets({ q: '__all__' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(result.current.data).toHaveLength(COLLECTION_SIZE_BUCKETS.length),
    );

    expect(fetchSearchResults).toHaveBeenCalledTimes(
      COLLECTION_SIZE_BUCKETS.length,
    );

    const requests = requestsByRange();
    expect(requests['[0 TO 9]']).toBeDefined();
    expect(requests['[1000 TO 9999]']).toBeDefined();
    // The last bucket is open-ended.
    expect(requests['[10000000 TO *]']).toBeDefined();
    // Counts only — no documents needed.
    Object.values(requests).forEach((params: any) => {
      expect(params.size).toBe(0);
    });
  });

  it('reads each bucket count off the response total, in bucket order', async () => {
    const totals = [600, 100, 20, 5, 0, 0, 0, 0];
    totals.forEach(total =>
      fetchSearchResults.mockResolvedValueOnce({
        results: [],
        total,
        facets: null,
      }),
    );

    const { result } = renderHook(
      () => useCollectionSizeBuckets({ q: '__all__' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    // Trailing empty buckets are trimmed.
    expect(result.current.data?.map(b => [b.key, b.count])).toEqual([
      ['0-9', 600],
      ['10-99', 100],
      ['100-999', 20],
      ['1000-9999', 5],
    ]);
  });

  // The chart shows the whole distribution with the applied range highlighted,
  // so scoping the counts by that range would collapse it to the selection.
  it('strips the applied range but keeps the other filters', async () => {
    fetchSearchResults.mockResolvedValue({
      results: [],
      total: 1,
      facets: null,
    });

    renderHook(
      () =>
        useCollectionSizeBuckets({
          q: '__all__',
          extra_filter:
            '(collectionSize.minValue:[1000 TO 50000]) AND (collectionSize.unitText:("Genomes"))',
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(fetchSearchResults).toHaveBeenCalledTimes(
        COLLECTION_SIZE_BUCKETS.length,
      ),
    );

    const { extra_filter } = requestsByRange()['[0 TO 9]'];
    expect(extra_filter).not.toContain('[1000 TO 50000]');
    expect(extra_filter).toContain('collectionSize.unitText:("Genomes")');
    expect(extra_filter).toContain('collectionSize.minValue:[0 TO 9]');
  });

  it('does not fetch while disabled', () => {
    renderHook(
      () => useCollectionSizeBuckets({ q: '__all__' }, { enabled: false }),
      { wrapper: createWrapper() },
    );

    expect(fetchSearchResults).not.toHaveBeenCalled();
  });
});
