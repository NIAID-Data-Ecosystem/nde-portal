import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { Metadata } from './types';

export function useMetadata(options?: UseQueryOptions<Metadata, Error>) {
  return useQuery<Metadata, Error>({
    ...options,
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    refetchOnWindowFocus: false,
  });
}
