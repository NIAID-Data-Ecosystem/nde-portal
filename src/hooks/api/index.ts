import axios from 'axios';
import REPOSITORIES from 'configs/repositories.json';
import { useQuery, UseQueryOptions } from 'react-query';
import { Metadata, Repository } from './types';

const fetchMetadata = async () => {
  if (!`${process.env.NEXT_PUBLIC_API_URL}/metadata`) {
    throw new Error('API url undefined');
  }

  try {
    const { data } = (await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/metadata`,
    )) as { data: Metadata };

    return data;
  } catch (err) {
    throw err;
  }
};

export function useMetadata(options: UseQueryOptions<Metadata, Error> = {}) {
  return useQuery<Metadata, Error>({
    ...options,
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
  });
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
        const { identifier, url } = sourceInfo || {};

        const data = {
          identifier,
          url,
        };

        const repo = REPOSITORIES.repositories.find(
          ({ id }) => id === identifier,
        );
        return {
          ...data,
          label: repo?.label || '',
          type: (repo?.type || 'generalist') as Repository['type'],
          icon: repo?.icon || '',
          abstract: repo?.abstract || '',
        };
      });

      return repositories as Repository[];
    },
  });
}
