import REPOSITORIES from 'configs/repositories.json';
import { useQuery, UseQueryOptions } from 'react-query';
import { Metadata, Repository } from './types';
import { fetchMetadata } from './helpers';

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
