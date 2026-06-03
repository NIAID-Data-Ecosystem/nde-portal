import { useQuery } from '@tanstack/react-query';
import { fetchSearchResults } from 'src/utils/api';
import {
  Domain,
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';

interface UseResourceCatalogsProps {
  fields?: string[];
  options?: any;
}

export function useResourceCatalogs({
  options = {},
  fields = [],
}: UseResourceCatalogsProps | undefined = {}) {
  return useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    FormattedResource[]
  >({
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
    select: (data: FetchSearchResultsResponse | undefined) => {
      const catalogs = data?.results || [];
      return catalogs.map(catalog => ({
        ...catalog,
        identifier: catalog._id || catalog.identifier || '',
        type: ['Resource Catalog'],
      }));
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
}
