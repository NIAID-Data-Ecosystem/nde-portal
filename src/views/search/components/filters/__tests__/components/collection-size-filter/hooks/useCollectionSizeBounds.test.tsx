import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCollectionSizeBounds } from '../../../../components/collection-size-filter/hooks/useCollectionSizeBounds';

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

const hit = (collectionSize: unknown) => ({
  results: [{ collectionSize }],
  total: 1,
  facets: null,
});

/** The two probes' params, identified by sort direction rather than by order. */
const probeParams = () => {
  const calls = fetchSearchResults.mock.calls.map(([params]: any[]) => params);
  return {
    all: calls,
    ascending: calls.find((params: any) => !params.sort.startsWith('-')),
    descending: calls.find((params: any) => params.sort.startsWith('-')),
  };
};

describe('useCollectionSizeBounds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('probes the lowest and highest collection size', async () => {
    fetchSearchResults
      .mockResolvedValueOnce(hit([{ minValue: 0 }]))
      .mockResolvedValueOnce(hit([{ minValue: 9000 }]));

    const { result } = renderHook(
      () => useCollectionSizeBounds({ q: '__all__' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(result.current.data).toEqual({
        min: 0,
        max: 9000,
      }),
    );

    const { ascending, descending } = probeParams();
    expect(ascending.sort).toBe('collectionSize.minValue');
    expect(descending.sort).toBe('-collectionSize.minValue');
    // One record is enough to read a bound from, and only the collection size
    // is needed off it.
    expect(ascending.size).toBe(1);
    expect(ascending.fields).toEqual(['collectionSize']);
  });

  // Elasticsearch sorts a multi-valued field by its lowest value ascending and
  // its highest descending, so the hit still has to be reduced.
  it('reduces a record holding several collection sizes', async () => {
    fetchSearchResults
      .mockResolvedValueOnce(hit([{ minValue: 12 }, { minValue: 400 }]))
      .mockResolvedValueOnce(
        hit([{ minValue: 84 }, { minValue: 16300000000 }]),
      );

    const { result } = renderHook(
      () => useCollectionSizeBounds({ q: '__all__' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(result.current.data).toEqual({ min: 12, max: 16300000000 }),
    );
  });

  it('reads a single non-array collection size', async () => {
    fetchSearchResults
      .mockResolvedValueOnce(hit({ minValue: 5 }))
      .mockResolvedValueOnce(hit({ minValue: 700 }));

    const { result } = renderHook(
      () => useCollectionSizeBounds({ q: '__all__' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(result.current.data).toEqual({ min: 5, max: 700 }),
    );
  });

  it('scopes the probes to records that carry a collection size', async () => {
    fetchSearchResults.mockResolvedValue(hit([{ minValue: 1 }]));

    renderHook(() => useCollectionSizeBounds({ q: '__all__' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(fetchSearchResults).toHaveBeenCalledTimes(2));
    probeParams().all.forEach((params: any) => {
      expect(params.extra_filter).toBe('_exists_:collectionSize.minValue');
    });
  });

  // Leaving the applied range in would bound the inputs by the current
  // selection, so the user could never widen it.
  it('drops the applied range from the probe filter but keeps other filters', async () => {
    fetchSearchResults.mockResolvedValue(hit([{ minValue: 1 }]));

    renderHook(
      () =>
        useCollectionSizeBounds({
          q: '__all__',
          extra_filter:
            '(collectionSize.minValue:[1000 TO 50000]) AND (topicCategory.name.raw:("Genomics"))',
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(fetchSearchResults).toHaveBeenCalledTimes(2));
    const { extra_filter } = probeParams().ascending;
    expect(extra_filter).not.toContain('[1000 TO 50000]');
    expect(extra_filter).toContain('topicCategory.name.raw:("Genomics")');
    expect(extra_filter).toContain('_exists_:collectionSize.minValue');
  });

  // The dropdown probes bounds for the unit being looked at, which may not be
  // the one already in the URL.
  it('scopes the probes to the supplied unit spellings', async () => {
    fetchSearchResults.mockResolvedValue(hit([{ minValue: 1 }]));

    renderHook(
      () =>
        useCollectionSizeBounds({
          q: '__all__',
          unitTerms: ['Assays', 'assays'],
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(fetchSearchResults).toHaveBeenCalledTimes(2));
    expect(probeParams().ascending.extra_filter).toContain(
      'collectionSize.unitText:("Assays" OR "assays")',
    );
  });

  it('returns no bounds when a probe finds nothing', async () => {
    fetchSearchResults.mockResolvedValue({
      results: [],
      total: 0,
      facets: null,
    });

    const { result } = renderHook(
      () => useCollectionSizeBounds({ q: '__all__' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it('does not fetch while disabled', () => {
    renderHook(
      () => useCollectionSizeBounds({ q: '__all__' }, { enabled: false }),
      { wrapper: createWrapper() },
    );

    expect(fetchSearchResults).not.toHaveBeenCalled();
  });
});
