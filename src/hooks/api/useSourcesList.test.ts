import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { useResourceCatalogs } from './useResourceCatalogs';
import {
  buildResourceCatalogSearchURL,
  useSourcesList,
} from './useSourcesList';

jest.mock('./helpers', () => ({ fetchMetadata: jest.fn() }));
jest.mock('./useResourceCatalogs');

const mockFetchMetadata = fetchMetadata as jest.Mock;
const mockUseResourceCatalogs = useResourceCatalogs as jest.Mock;

// Fresh QueryClient per test so cached metadata doesn't leak between cases.
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Two metadata sources: `repoA` is a plain repository; `repoB` maps to the
// `dde_existing` resource catalog via `sameAs`.
const metadata = {
  src: {
    repoA: {
      sourceInfo: {
        identifier: 'repoA',
        name: 'Repo A',
        collectionType: 'Dataset Repository',
      },
    },
    repoB: {
      sourceInfo: {
        identifier: 'repoB',
        name: 'Repo B',
        collectionType: 'Dataset Repository',
        sameAs: 'https://data.niaid.nih.gov/resources?id=dde_existing',
      },
    },
  },
};

const setCatalogs = ({
  data = [] as any[],
  isLoading = false,
  error = null as Error | null,
}: {
  data?: any[];
  isLoading?: boolean;
  error?: Error | null;
} = {}) => {
  mockUseResourceCatalogs.mockReturnValue({ data, isLoading, error });
};

describe('buildResourceCatalogSearchURL', () => {
  it('returns an empty string when no id is given', () => {
    expect(buildResourceCatalogSearchURL('')).toBe('');
  });

  it('scopes the search to the catalog record by _id', () => {
    const url = buildResourceCatalogSearchURL('dde_new');
    const params = new URLSearchParams(url.split('?')[1]);
    expect(url.startsWith('/search?')).toBe(true);
    expect(params.get('q')).toBe('');
    expect(params.get('filters')).toBe('(_id:("dde_new"))');
    expect(params.get('applyDefaultDate')).toBe('false');
  });
});

describe('useSourcesList', () => {
  afterEach(() => jest.clearAllMocks());

  it('merges in only the resource catalogs not already represented by a source', async () => {
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({
      data: [
        // Already represented by `repoB` (sameAs -> dde_existing): skipped.
        { _id: 'dde_existing', name: 'Existing Catalog' },
        // Not represented anywhere: added as a standalone source.
        { _id: 'dde_new', name: 'New Catalog', abstract: 'a new catalog' },
      ],
    });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const data = result.current.data || [];
    // 2 metadata sources + 1 added catalog (the duplicate is dropped).
    expect(data).toHaveLength(3);

    // The already-represented catalog is not added as its own row: the only
    // source carrying its id is the metadata source (`repoB`) that points to
    // it, which now adopts the catalog id as its own `_id`.
    const withExistingId = data.filter(source => source._id === 'dde_existing');
    expect(withExistingId).toHaveLength(1);
    expect(withExistingId[0].identifier).toBe('repoB');
    // ...and that source keeps the parsed identifier.
    const repoB = data.find(source => source.identifier === 'repoB');
    expect(repoB?.resourceCatalogIdentifier).toBe('dde_existing');

    // The unrepresented catalog is added, typed, and scoped by `_id`.
    const added = data.find(source => source._id === 'dde_new');
    expect(added).toBeDefined();
    expect(added?.name).toBe('New Catalog');
    expect(added?.type).toEqual(['Resource Catalog']);
    const params = new URLSearchParams((added?.searchURL || '').split('?')[1]);
    expect(params.get('filters')).toBe('(_id:("dde_new"))');
  });

  it('enriches metadata sources with numberOfRecords, isNiaidFunded and dateModified', async () => {
    mockFetchMetadata.mockResolvedValue({
      src: {
        immport: {
          sourceInfo: {
            identifier: 'immport',
            name: 'ImmPort',
            collectionType: 'Dataset Repository',
          },
          stats: { immport: 1234 },
          version: '20240115',
        },
        // Missing stats/version — enrichment fields fall back safely.
        repoA: metadata.src.repoA,
      },
    } as any);
    setCatalogs({ data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const data = result.current.data || [];

    const immport = data.find(source => source.identifier === 'immport');
    expect(immport?.numberOfRecords).toBe(1234);
    expect(immport?.isNiaidFunded).toBe(true);
    expect(immport?.dateModified).toBe('2024-01-15T00:00:00');

    const repoA = data.find(source => source.identifier === 'repoA');
    expect(repoA?.numberOfRecords).toBeUndefined();
    expect(repoA?.isNiaidFunded).toBe(false);
    expect(repoA?.dateModified).toBe('');
  });

  it('returns only the metadata sources when there are no resource catalogs', async () => {
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({ data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(2);
  });

  it('reports loading while the resource catalogs are still loading', () => {
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({ isLoading: true, data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('surfaces a resource catalog error', () => {
    const catalogErr = new Error('catalog boom');
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({ error: catalogErr });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.error).toBe(catalogErr);
  });
});
