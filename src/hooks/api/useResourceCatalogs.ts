import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import {
  Domain,
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import {
  formatConditionsOfAccess,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';

export interface ResourceCatalog {
  _id: string;
  abstract?: string;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  type: (
    | 'Computational Tool Repository'
    | 'Dataset Repository'
    | 'Resource Catalog'
  )[];
  name: FormattedResource['name'];
  domain?: Domain;
  url?: FormattedResource['url'];
}

interface UseResourceCatalogsProps {
  fields?: string[];
  options?: any;
}

export function useResourceCatalogs({
  options = {},
  fields = [
    '@type',
    'abstract',
    'collectionType',
    'conditionsOfAccess',
    'genre',
    'name',
    'url',
  ],
}: UseResourceCatalogsProps | undefined = {}) {
  return useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    ResourceCatalog[]
  >({
    ...options,
    queryKey: [
      'resource-catalogs',
      {
        queryString: '@type:"ResourceCatalog"',
        fields,
      },
    ],
    queryFn: () => {
      return fetchSearchResults({
        q: '@type:"ResourceCatalog"',
        fields,
        size: 100,
      });
    },
    select: data => {
      const catalogs = data?.results || [];
      return catalogs.map(catalog => ({
        _id: catalog._id,
        abstract: catalog.abstract,
        conditionsOfAccess: transformConditionsOfAccessLabel(
          formatConditionsOfAccess(catalog.conditionsOfAccess),
        ),
        type: ['Resource Catalog'],
        name: catalog.name,
        domain: catalog.genre,
        url: catalog.url,
      }));
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
