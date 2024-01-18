import { useQuery, UseQueryOptions } from 'react-query';
import { Metadata } from './types';
import { fetchMetadata } from './helpers';

export function useMetadata(options: UseQueryOptions<Metadata, Error> = {}) {
  return useQuery<Metadata, Error>({
    ...options,
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    refetchOnWindowFocus: false,
  });
}
