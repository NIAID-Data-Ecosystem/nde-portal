import { useMemo } from 'react';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { useResourceCatalogs } from 'src/hooks/api/useResourceCatalogs';
import { REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';
import { RepositoryMatcherItem } from '../types';
import { SHOW_DATA_COLLECTIONS_TAB } from 'src/utils/feature-flags';

export type RepositoryMatcherRow = {
  _id: string;
  _raw: RepositoryMatcherItem;
  /** Lowercased concatenation of every column's searchable text. Built once
   * at data-load so the search hook can do a single substring check per row
   * instead of re-deriving search values on every keystroke. */
  _search: string;
} & Record<string, unknown>;

export const defaultSearchValue = (
  value: unknown,
): string | string[] | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (
    Array.isArray(value) &&
    value.every(v => typeof v === 'string' || typeof v === 'number')
  ) {
    return value.map(String);
  }
  return null;
};

export const useRepositoryMatcherData = (fields: string[] = ['@type']) => {
  const {
    isLoading: resourceCatalogsIsLoading,
    data: resourceCatalogs,
    error: resourceCatalogsError,
  } = useResourceCatalogs({ fields });

  const {
    isLoading: repositoriesIsLoading,
    data: repositories,
    error: repositoriesError,
  } = useRepoData({ refetchOnWindowFocus: false, refetchOnMount: false });

  const isLoading = resourceCatalogsIsLoading || repositoriesIsLoading;

  const data = useMemo<RepositoryMatcherRow[]>(() => {
    if (isLoading) return [];
    const combined: RepositoryMatcherItem[] = [
      ...(resourceCatalogs || []),
      ...(repositories || []),
    ];
    // Dedupe by _id — the same entity (e.g. VEuPathDB) can appear in both
    // resource catalogs and repositories. First occurrence wins.
    const seen = new Set<string>();
    const rows: RepositoryMatcherRow[] = [];
    combined
      .filter(item => {
        // Exclude items that have creativeWorkStatus of 'Retired' or 'Not Accepting Data'. If not specified, include all items.
        const statusIsAcceptingData =
          item?.creativeWorkStatus === 'Accepting Data';

        // Exclude items with type "Data Repository"
        const isDataCollectionRepo =
          SHOW_DATA_COLLECTIONS_TAB && item['type'].includes('Data Repository');

        return statusIsAcceptingData && !isDataCollectionRepo;
      })
      .forEach((item, idx) => {
        const id = item._id || `__no-id-${idx}`;
        if (seen.has(id)) return;
        seen.add(id);
        const row = {
          _id: item._id || '',
          // _raw: item,
        } as RepositoryMatcherRow;
        const searchParts: string[] = [];
        for (const col of REPOSITORY_MATCHER_COLUMNS) {
          const value = col.transform(item);
          row[col.id] = value;
          const searchValue = col.getSearchValue
            ? col.getSearchValue(value)
            : defaultSearchValue(value);
          if (searchValue == null) continue;
          searchParts.push(
            Array.isArray(searchValue) ? searchValue.join(' ') : searchValue,
          );
        }
        row._search = searchParts.join(' ').toLowerCase();
        rows.push(row);
      });
    return rows;
  }, [resourceCatalogs, repositories, isLoading]);

  return {
    data,
    isLoading,
    error: resourceCatalogsError || repositoriesError,
  };
};
