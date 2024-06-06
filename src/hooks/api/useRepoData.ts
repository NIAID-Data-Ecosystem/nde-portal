import REPOSITORIES from 'configs/repositories.json';
import { useQuery } from 'react-query';
import { fetchMetadata } from './helpers';
import { Metadata } from './types';
import { FormattedResource } from 'src/utils/api/types';

export interface Repository {
  _id: string;
  abstract?: string;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  type: 'Repository';
  icon?: string;
  name: string;
  domain:
    | 'generalist'
    | 'iid'
    | 'basic science'
    | 'biomedical'
    | 'other'
    | 'metadata';
  url?: string | null;
}

export function useRepoData(options: any = {}) {
  return useQuery<Metadata | undefined, Error, Repository[]>({
    ...options,
    queryKey: ['metadata'],
    queryFn: fetchMetadata,
    select: (data: Metadata | undefined) => {
      const sources = data?.src || [];
      const repositories = Object.values(sources).map(({ sourceInfo }) => {
        // [NOTE]: This is a temporary fix to handle the case where sourceInfo is an array (i.e. VeuPathCatalogs), pending further discussions with NIAID .
        if (Array.isArray(sourceInfo)) {
          return {};
        }
        const { identifier, abstract, conditionsOfAccess, name, url } =
          sourceInfo || {};

        const repo = REPOSITORIES.repositories.find(
          ({ id }) => id === identifier,
        );
        return {
          _id: identifier,
          abstract: abstract || '',
          type: 'Repository' as Repository['type'],
          icon: repo?.icon || '',
          name: name || '',
          domain: (repo?.type.toLowerCase() ||
            'generalist') as Repository['domain'],
          url,
          conditionsOfAccess: conditionsOfAccess || '',
        };
      });

      return repositories;
    },
  });
}
