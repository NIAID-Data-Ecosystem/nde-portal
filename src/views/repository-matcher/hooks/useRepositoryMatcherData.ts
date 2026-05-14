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
    return combined.map(item => {
      const row = {
        _id: item._id || '',
        _raw: item,
      } as RepositoryMatcherRow;
      for (const col of REPOSITORY_MATCHER_COLUMNS) {
        row[col.id] = col.transform(item);
      }
      return row;
    });
  }, [resourceCatalogs, repositories, isLoading]);

  return {
    data,
    isLoading,
    error: resourceCatalogsError || repositoriesError,
  };
};
