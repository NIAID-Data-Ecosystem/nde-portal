import { renderHook } from '@testing-library/react';
import {
  defaultSearchValue,
  useRepositoryMatcherData,
} from '../useRepositoryMatcherData';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { useResourceCatalogs } from 'src/hooks/api/useResourceCatalogs';

jest.mock('src/hooks/api/useRepoData');
jest.mock('src/hooks/api/useResourceCatalogs');

const mockUseRepoData = useRepoData as jest.Mock;
const mockUseResourceCatalogs = useResourceCatalogs as jest.Mock;

const setHooks = ({
  catalogs = [],
  repos = [],
  resourceCatalogsIsLoading = false,
  repositoriesIsLoading = false,
  resourceCatalogsError = null,
  repositoriesError = null,
}: {
  catalogs?: any[];
  repos?: any[];
  resourceCatalogsIsLoading?: boolean;
  repositoriesIsLoading?: boolean;
  resourceCatalogsError?: Error | null;
  repositoriesError?: Error | null;
}) => {
  mockUseResourceCatalogs.mockReturnValue({
    data: catalogs,
    isLoading: resourceCatalogsIsLoading,
    error: resourceCatalogsError,
  });
  mockUseRepoData.mockReturnValue({
    data: repos,
    isLoading: repositoriesIsLoading,
    error: repositoriesError,
  });
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

  it('reports loading when either source is loading and returns no rows', () => {
    setHooks({ repositoriesIsLoading: true });
    const { result } = renderHook(() => useRepositoryMatcherData());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('combines catalogs + repositories, filtering and de-duplicating by _id', () => {
    setHooks({
      catalogs: [
        {
          _id: 'c1',
          name: 'Catalog One',
          type: ['Resource Catalog'],
          creativeWorkStatus: 'Accepting Data',
          genre: 'IID',
        },
        {
          _id: 'dup',
          name: 'Catalog Dup',
          type: ['Resource Catalog'],
          creativeWorkStatus: 'Accepting Data',
        },
      ],
      repos: [
        {
          _id: 'r1',
          name: 'Repo One',
          type: ['Dataset Repository'],
          creativeWorkStatus: 'Accepting Data',
          conditionsOfAccess: 'Open',
        },
        // duplicate id — first occurrence (the catalog) wins.
        {
          _id: 'dup',
          name: 'Repo Dup',
          type: ['Dataset Repository'],
          creativeWorkStatus: 'Accepting Data',
        },
        // excluded: not accepting data.
        {
          _id: 'retired',
          name: 'Retired Repo',
          type: ['Dataset Repository'],
          creativeWorkStatus: 'Retired',
        },
        // excluded: Data Repository type.
        {
          _id: 'data-repo',
          name: 'Data Repo',
          type: ['Data Repository'],
          creativeWorkStatus: 'Accepting Data',
        },
        // excluded: Sample Repository type.
        {
          _id: 'sample-repo',
          name: 'Sample Repo',
          type: ['Sample Repository'],
          creativeWorkStatus: 'Accepting Data',
        },
      ],
    });

    const { result } = renderHook(() => useRepositoryMatcherData());
    const { data } = result.current;

    expect(data.map(r => r._id)).toEqual(['c1', 'dup', 'r1']);
    // Catalog wins the dedupe, so its name is kept.
    expect((data[1].name as { label: string }).label).toBe('Catalog Dup');
    // Per-column transformed values are present and the search blob is built.
    expect((data[0].name as { label: string }).label).toBe('Catalog One');
    expect(data[0]._search).toContain('catalog one');
    expect(data[0]._search).toContain('iid');
  });

  it('falls back to a synthetic id for items without an _id', () => {
    setHooks({
      repos: [
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

  it('handles undefined data arrays from both sources', () => {
    // Set the mocks directly so the `|| []` fallbacks see real `undefined`
    // (setHooks' default params would coerce undefined back to []).
    mockUseResourceCatalogs.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    mockUseRepoData.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useRepositoryMatcherData());
    expect(result.current.data).toEqual([]);
  });

  it('surfaces the resource catalog error first, then the repository error', () => {
    const catalogErr = new Error('catalog boom');
    setHooks({ resourceCatalogsError: catalogErr });
    const { result } = renderHook(() => useRepositoryMatcherData());
    expect(result.current.error).toBe(catalogErr);

    const repoErr = new Error('repo boom');
    setHooks({ repositoriesError: repoErr });
    const { result: result2 } = renderHook(() => useRepositoryMatcherData());
    expect(result2.current.error).toBe(repoErr);
  });
});
