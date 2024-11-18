import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { Metadata } from './types';
import {
  Domain,
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import axios from 'axios';

export interface Repository {
  _id: string;
  abstract?: string;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  types: (
    | 'Computational Tool Repository'
    | 'Dataset Repository'
    | 'Resource Catalog'
  )[];
  icon?: string;
  name: string;
  domain?: Domain;
  url?: string | null;
}

const fetchSourcesByType = async (params: {
  q: string;
  facets: string;
  facet_size: number;
  size: number;
}) => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }
  try {
    const { data } = (await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?`,
      {
        params,
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
      '@type:"Dataset"',
      'includedInDataCatalog.name',
    ],
    queryFn: async () => {
      const computationalTools = await fetchSourcesByType({
        q: '@type:"ComputationalTool"',
        facets: 'includedInDataCatalog.name',
        facet_size: 1000,
        size: 0,
      }).then(res =>
        res.facets['includedInDataCatalog.name'].terms.map(({ term }) => term),
      );

      const datasets = await fetchSourcesByType({
        q: '@type:"Dataset"',
        facets: 'includedInDataCatalog.name',
        facet_size: 1000,
        size: 0,
      }).then(res =>
        res.facets['includedInDataCatalog.name'].terms.map(({ term }) => term),
      );

      return {
        data: await fetchMetadata(),
        computationalTools,
        datasets,
      };
    },
    select: ({
      computationalTools,
      data,
      datasets,
    }: {
      computationalTools: string[];
      data: Metadata | undefined;
      datasets: string[];
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
        const types = [
          ...(datasets.includes(identifier) ? ['Dataset Repository'] : []),
          ...(computationalTools.includes(identifier) ||
          type === 'Computational Tool Repository'
            ? ['Computational Tool Repository']
            : []),
        ].sort((a, b) => a.localeCompare(b));

        return {
          _id: identifier,
          abstract: abstract || '',
          types: types,
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
