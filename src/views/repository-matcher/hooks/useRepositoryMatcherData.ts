import { useMemo } from 'react';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { useResourceCatalogs } from 'src/hooks/api/useResourceCatalogs';
import {
  REPOSITORY_MATCHER_COLUMNS,
  RepositoryMatcherItem,
} from 'src/views/repository-matcher/table-config';

export type RepositoryMatcherRow = {
  _id: string;
  _raw: RepositoryMatcherItem;
} & Record<string, unknown>;

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
    combined.forEach((item, idx) => {
      const id = item._id || `__no-id-${idx}`;
      if (seen.has(id)) return;
      seen.add(id);
      const row = {
        _id: item._id || '',
        // _raw: item,
      } as RepositoryMatcherRow;
      for (const col of REPOSITORY_MATCHER_COLUMNS) {
        row[col.id] = col.transform(item);
      }
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
