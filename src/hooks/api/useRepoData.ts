import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { Metadata } from './types';
import {
  Domain,
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import axios from 'axios';
import { APIResourceType } from 'src/utils/formatting/formatResourceType';

export interface Repository {
  _id: string;
  abstract?: string;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  // [TO DO]: Update APIResourceType to be a union of all possible types
  type: APIResourceType | 'ComputationalTool';
  icon?: string;
  name: string;
  domain?: Domain;
  url?: string | null;
}

export const fetchCompTools = async () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }
  try {
    const { data } = (await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?`,
      {
        params: {
          q: '@type:"ComputationalTool"',
          facets: 'includedInDataCatalog.name',
          facet_size: 1000,
          size: 0,
        },
      },
    )) as { data: FetchSearchResultsResponse };

    return data;
  } catch (err) {
    throw err;
  }
};

export function useRepoData(options: any = {}) {
  return useQuery<Metadata | undefined, Error, Repository[]>({
    queryKey: [
      'metadata',
      '@type:"ComputationalTool"',
      'includedInDataCatalog.name',
    ],
    queryFn: async () => {
      const computationalTools = await fetchCompTools().then(res =>
        res.facets['includedInDataCatalog.name'].terms.map(({ term }) => term),
      );

      return {
        data: await fetchMetadata(),
        computationalTools,
      };
    },
    select: ({
      data,
      computationalTools,
    }: {
      data: Metadata | undefined;
      computationalTools: string[];
    }) => {
      const sources = data?.src || [];
      const repositories = Object.values(sources).map(({ sourceInfo }) => {
        // [NOTE]: This is a temporary fix to handle the case where sourceInfo is an array (i.e. VeuPathCatalogs), pending further discussions with NIAID .
        if (!sourceInfo || Array.isArray(sourceInfo)) {
          return {};
        }

        const {
          identifier,
          abstract,
          conditionsOfAccess,
          name,
          type,
          url,
          genre,
        } = sourceInfo || {};

        const isComputationalTool =
          computationalTools.includes(identifier) ||
          type === 'Computational Tool Repository';

        return {
          _id: identifier,
          abstract: abstract || '',
          type: isComputationalTool ? 'ComputationalTool' : 'Dataset',
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
