import { renderHook } from '@testing-library/react';
import {
  defaultSearchValue,
  useRepositoryMatcherData,
} from '../useRepositoryMatcherData';
import { useSourcesList } from 'src/hooks/api/useSourcesList';

// The hook now delegates fetching/merging to `useSourcesList` (which merges
// resource catalogs into the metadata sources, de-duplicates them, and filters
// out feature-flagged repository types). Its own job is to filter by
// `creativeWorkStatus` and build the per-column table rows + search blob.
jest.mock('src/hooks/api/useSourcesList');

const mockUseSourcesList = useSourcesList as jest.Mock;

const setSources = ({
  sources = [] as any[],
  isLoading = false,
  error = null as Error | null,
}: {
  sources?: any[];
  isLoading?: boolean;
  error?: Error | null;
} = {}) => {
  mockUseSourcesList.mockReturnValue({ data: sources, isLoading, error });
};

describe('defaultSearchValue', () => {
  it('returns null for nullish values', () => {
    expect(defaultSearchValue(null)).toBeNull();
    expect(defaultSearchValue(undefined)).toBeNull();
  });

  it('passes strings through and stringifies numbers', () => {
    expect(defaultSearchValue('hello')).toBe('hello');
    expect(defaultSearchValue(42)).toBe('42');
  });

  it('maps arrays of strings/numbers to string arrays', () => {
    expect(defaultSearchValue(['a', 1, 'b'])).toEqual(['a', '1', 'b']);
  });

  it('returns null for objects and mixed arrays', () => {
    expect(defaultSearchValue({ name: 'x' })).toBeNull();
    expect(defaultSearchValue([{ a: 1 }])).toBeNull();
  });
});

describe('useRepositoryMatcherData', () => {
  afterEach(() => jest.clearAllMocks());

  it('reports loading and returns no rows while sources load', () => {
    setSources({ isLoading: true });
    const { result } = renderHook(() => useRepositoryMatcherData());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('builds rows from sources accepting data, with transformed columns and a search blob', () => {
    setSources({
      sources: [
        {
          _id: 'c1',
          name: 'Catalog One',
          type: ['Resource Catalog'],
          creativeWorkStatus: 'Accepting Data',
          genre: 'IID',
        },
        // excluded: not accepting data.
        {
          _id: 'retired',
          name: 'Retired Repo',
          type: ['Dataset Repository'],
          creativeWorkStatus: 'Retired',
        },
        {
          _id: 'r1',
          name: 'Repo One',
          type: ['Dataset Repository'],
          creativeWorkStatus: 'Accepting Data',
          conditionsOfAccess: 'Open',
        },
      ],
    });

    const { result } = renderHook(() => useRepositoryMatcherData());
    const { data } = result.current;

    // Only the two "Accepting Data" sources become rows, in source order.
    expect(data.map(r => r._id)).toEqual(['c1', 'r1']);
    // Per-column transformed values are present and the search blob is built.
    expect((data[0].name as { label: string }).label).toBe('Catalog One');
    expect(data[0]._search).toContain('catalog one');
    expect(data[0]._search).toContain('iid');
  });

  it('falls back to an empty id for items without an _id', () => {
    setSources({
      sources: [
        {
          name: 'No Id Repo',
          type: ['Dataset Repository'],
          creativeWorkStatus: 'Accepting Data',
        },
      ],
    });
    const { result } = renderHook(() => useRepositoryMatcherData());
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0]._id).toBe('');
  });

  it('handles undefined source data', () => {
    mockUseSourcesList.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRepositoryMatcherData());
    expect(result.current.data).toEqual([]);
  });

  it('surfaces the sources error', () => {
    const err = new Error('boom');
    setSources({ error: err });
    const { result } = renderHook(() => useRepositoryMatcherData());
    expect(result.current.error).toBe(err);
  });
});
