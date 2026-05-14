import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { Metadata, MetadataSource } from './types';

export type Repository = MetadataSource['sourceInfo'];

export function useRepoData(options: any = {}) {
  return useQuery<Metadata | undefined, Error, Repository[]>({
    queryKey: ['metadata'],
    queryFn: async () => await fetchMetadata(),
    select: (data: Metadata | undefined) => {
      const sources = data?.src || [];
      const repositories = Object.values(sources)
        .filter(
          source =>
            source?.sourceInfo &&
            !Array.isArray(source.sourceInfo) &&
            source.sourceInfo.identifier,
        )
        .map(({ sourceInfo }) => {
          const { identifier, name, collectionType } = sourceInfo || {};
          const type = (
            Array.isArray(collectionType)
              ? collectionType
              : collectionType
              ? [collectionType]
              : []
          ).sort((a, b) => a.localeCompare(b));

          return {
            ...sourceInfo,
            type: type as string[],
            _id: identifier || '',
            name: name || identifier || '',
          };
        });

      return repositories as Repository[];
    },
    ...options,
  });
}
