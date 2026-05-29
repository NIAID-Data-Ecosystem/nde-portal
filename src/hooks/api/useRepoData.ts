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
        .map(({ sourceInfo }, idx) => {
          const {
            identifier,
            name,
            collectionType,
            type: sourceInfoType,
          } = sourceInfo || {};
          const sourceType = sourceInfoType || collectionType;

          // use type if available, otherwise fallback to collectionType
          const type = (
            Array.isArray(sourceType)
              ? sourceType
              : sourceType
              ? [sourceType]
              : []
          ).sort((a, b) => a.localeCompare(b));

          return {
            ...sourceInfo,
            type: type as string[],
            _id: `${identifier}-${name}` || '',
            name: name || identifier || '',
          };
        });

      return repositories as Repository[];
    },
    ...options,
  });
}
