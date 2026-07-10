import { useMemo } from 'react';
import { REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';
import { RepositoryMatcherItem } from '../types';
import { useSourcesList } from 'src/hooks/api/useSourcesList';

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
  /****** Repository + Resource Catalog Data ******/
  // `useSourcesList` merges standalone resource catalogs into the metadata
  // sources list until the two data sources are consolidated on one endpoint.
  // Pass the requested `fields` through so resource catalogs carry the columns
  // (e.g. `creativeWorkStatus`) the matcher table filters and renders on.
  const {
    isLoading,
    error,
    data: sources,
  } = useSourcesList(
    { refetchOnWindowFocus: false, refetchOnMount: false },
    fields,
  );

  const data = useMemo<RepositoryMatcherRow[]>(() => {
    if (isLoading) return [];
    const rows: RepositoryMatcherRow[] = [];
    (sources || [])
      .filter(item => {
        // Exclude items that have creativeWorkStatus of 'Retired' or 'Not Accepting Data'. If not specified, include all items.
        // Feature-flagged "Data Repository" / "Sample Repository" types are
        // already filtered out upstream in `useSourcesList`.
        return item?.creativeWorkStatus === 'Accepting Data';
      })
      .forEach(item => {
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
  }, [sources, isLoading]);

  return {
    data,
    isLoading,
    error,
  };
};
