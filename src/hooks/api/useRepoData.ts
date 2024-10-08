import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { Metadata } from './types';
import { Domain, FormattedResource } from 'src/utils/api/types';

export interface Repository {
  _id: string;
  abstract?: string;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  type: 'Repository';
  icon?: string;
  name: string;
  domain?: Domain;
  url?: string | null;
}

export function useRepoData(options: any = {}) {
  return useQuery<Metadata | undefined, Error, Repository[]>({
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    select: (data: Metadata | undefined) => {
      const sources = data?.src || [];
      const repositories = Object.values(sources).map(({ sourceInfo }) => {
        // [NOTE]: This is a temporary fix to handle the case where sourceInfo is an array (i.e. VeuPathCatalogs), pending further discussions with NIAID .
        if (!sourceInfo || Array.isArray(sourceInfo)) {
          return {};
        }
        const { identifier, abstract, conditionsOfAccess, name, url, genre } =
          sourceInfo || {};
        return {
          _id: identifier,
          abstract: abstract || '',
          type: 'Repository' as Repository['type'],
          name: name || '',
          domain: genre,
          url,
          conditionsOfAccess: conditionsOfAccess || '',
        };
      });

      return repositories;
    },
    ...options,
  });
}
