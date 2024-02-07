import REPOSITORIES from 'configs/repositories.json';
import { useQuery, UseQueryOptions } from 'react-query';
import { fetchMetadata } from './helpers';
import { Metadata } from 'src/utils/api/types';

export interface Repository {
  identifier: string;
  label: string;
  type: 'generalist' | 'iid';
  url?: string;
  abstract?: string;
  icon?: string;
}

export function useRepoData(
  options: UseQueryOptions<Metadata, Error, Repository[]> = {},
) {
  return useQuery<Metadata, Error, Repository[]>({
    ...options,
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    select: (data: Metadata) => {
      const sources = data?.src || [];
      const repositories = Object.values(sources).map(({ sourceInfo }) => {
        const { identifier, abstract, description, name, url } =
          sourceInfo || {};

        const repo = REPOSITORIES.repositories.find(
          ({ id }) => id === identifier,
        );
        return {
          identifier,
          url,
          abstract: abstract || '',
          description,
          label: name || '',
          type: (repo?.type || 'generalist') as Repository['type'],
          icon: repo?.icon || '',
        };
      });

      return repositories as Repository[];
    },
  });
}
