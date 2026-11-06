import { useMemo } from 'react';
import { toSearchValue } from 'src/components/table/data-table/utils/values';
import { useSourcesList } from 'src/hooks/api/useSourcesList';
import { REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';

import { RepositoryMatcherRow } from '../types';

export type { RepositoryMatcherRow } from '../types';

const isUnnamedDefinedTerm = (v: unknown): boolean =>
  typeof v === 'object' &&
  v !== null &&
  (v as Record<string, unknown>)['@type'] === 'DefinedTerm' &&
  !(v as Record<string, unknown>).name;

/** Drops `DefinedTerm` objects without a `name` from array values so they
 * don't render as empty tags or produce blank filter options. Non-array
 * values are returned unchanged. */
export const removeUnnamedDefinedTerms = <T>(value: T): T =>
  Array.isArray(value)
    ? (value.filter(v => !isUnnamedDefinedTerm(v)) as T)
    : value;

export const useRepositoryMatcherData = (fields: string[] = ['@type']) => {
  /****** Source + Resource Catalog Data ******/
  // `useSourcesList` merges standalone resource catalogs into the metadata
  // sources list until the two data sources are consolidated on one endpoint.
  // Pass the requested `fields` through so resource catalogs carry the columns
  // (e.g. `creativeWorkStatus`) the matcher table filters and renders on.
  const {
    isLoading: loading,
    error,
    data: sources,
  } = useSourcesList(
    { refetchOnWindowFocus: false, refetchOnMount: false },
    fields,
  );

  const data = useMemo<RepositoryMatcherRow[]>(() => {
    if (loading) return [];
    const rows: RepositoryMatcherRow[] = [];
    (sources || [])
      .filter(item => {
        // Exclude items that have creativeWorkStatus of 'Retired' or 'Not Accepting Data'. If not specified, include all items.
        const statusIsAcceptingData =
          item?.creativeWorkStatus === 'Accepting Data';

        return statusIsAcceptingData;
      })
      .forEach(item => {
        const row = {
          _id: item._id || '',
          // _raw: item,
        } as RepositoryMatcherRow;
        const searchParts: string[] = [];
        for (const col of REPOSITORY_MATCHER_COLUMNS) {
          const value = removeUnnamedDefinedTerms(col.transform(item));
          row[col.id] = value;
          const searchValue = col.getSearchValue
            ? col.getSearchValue(value)
            : toSearchValue(value);
          if (searchValue == null) continue;
          searchParts.push(
            Array.isArray(searchValue) ? searchValue.join(' ') : searchValue,
          );
        }
        row._search = searchParts.join(' ').toLowerCase();
        rows.push(row);
      });
    return rows;
  }, [sources, loading]);

  return {
    data,
    loading,
    error,
  };
};
