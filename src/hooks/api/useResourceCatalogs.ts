import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';

export interface ResourceCatalog {
  _id: string;
  abstract?: string;
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  dataType: 'ResourceCatalog';
  name: FormattedResource['name'];
  portalURL: string;
  type: FormattedResource['collectionType'];
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
    'name',
    'url',
  ],
}: UseResourceCatalogsProps | undefined = {}) {
  return useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    ResourceCatalog[]
  >(
    [
      'resource-catalogs',
      {
        queryString: '@type:"ResourceCatalog"',
        fields,
      },
    ],
    () => {
      return fetchSearchResults({
        q: '@type:"ResourceCatalog"',
        fields,
        size: 100,
      });
    },
    {
      ...options,
      refetchOnWindowFocus: false,
      select: data => {
        const catalogs = data?.results || [];
        return catalogs.map(catalog => ({
          _id: catalog._id,
          abstract: catalog.abstract,
          conditionsOfAccess: catalog.conditionsOfAccess,
          dataType: catalog['@type'],
          name: catalog.name,
          portalURL: `/resources?id=${catalog._id}`,
          type: 'IID',
          url: catalog.url,
        }));
      },
    },
  );
}