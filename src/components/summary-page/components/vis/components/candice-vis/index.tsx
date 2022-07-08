import React from 'react';
import { Box, Button } from 'nde-design-system';
import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { SelectedFilterType } from '../../../hooks';
import { Network } from './network';
import { Error } from 'src/components/error';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { useRouter } from 'next/router';
import FacetedData from './facets.json';
import { formatAPIResource } from 'src/utils/api/helpers';

interface CandiceNetworkProps {
  // Stringified query.
  //   queryString: string;
  //   // Filters object
  //   filters: SelectedFilterType;
  //   // fn for updating filter selection
  //   updateFilters: (updatedFilters: SelectedFilterType) => void;
}

export const CandiceNetwork: React.FC<CandiceNetworkProps> = (
  {
    //   queryString,
    //   filters,
    //   updateFilters,
  },
) => {
  // Check if component has mounted and router has needed info.
  const hasMounted = useHasMounted();
  const router = useRouter();

  /****
   * Fetch Data
   */

  // All the facets that you need. Potentially add select options in the future so users can view different groups together.
  //   const facets = [
  //     'includedInDataCatalog.name',
  //     'infectiousAgent.name',
  //     '@type',
  //     'dateModified',
  //     'infectiousDisease.name',
  //     'measurementTechnique.name',
  //     'date',
  //     'funding.funder.name',
  //   ];

  //   const queryFn = (queryString: string) => {
  //     if (typeof queryString !== 'string' && !queryString) {
  //       return;
  //     }
  //     // const filter_string = filters ? queryFilterObject2String(filters) : null;

  //     return fetchSearchResults({
  //       q: queryString,
  //       facet_size: 1000,
  //       facets: facets.join(','),
  //       size: 1000,
  //     });
  //   };

  //   // Get data. Possible to extract out in the future.
  //   const {
  //     data: APIdata,
  //     isLoading,
  //     error,
  //   } = useQuery<FetchSearchResultsResponse | undefined, Error>(
  //     [
  //       'search-results',
  //       {
  //         q: queryString,
  //         facets,
  //       },
  //     ],
  //     () => queryFn(queryString),
  //     {
  //       refetchOnWindowFocus: false,
  //     },
  //   );
  //   const data = APIdata?.results || [];
  //   const data_facets = APIdata?.facets || {};
  const error = false;

  const group_one = 'infectiousAgent.name';
  const group_two = 'measurementTechnique.name';
  // https://api.data.niaid.nih.gov/v1/query?&q=(funding.identifier:(%22U01AI124255%22+OR+%22AI124255%22+OR+%22U01AI124275%22+OR+%22AI124275%22+OR+%22U01AI124290%22+OR+%22AI124290%22+OR+%22U01AI124302%22+OR+%22AI124302%22+OR+%22U01AI124316%22+OR+%22AI124316%22+OR+%22U19AI135972%22+OR+%22AI135972%22+OR+%22U19AI135976%22+OR+%22AI135976%22+OR+%22U19AI135990%22+OR+%22AI135990%22+OR+%22U19AI135995%22+OR+%22AI135995%22+OR+%22U19AI135964%22+OR+%22AI135964%22+OR+%22U01+AI124319%22+OR+%22U01AI111598%22+OR+%22U19+AI106761%22+OR+%22U19AI106754%22+OR+%22U19AI106772%22+OR+%22HHSN272201200031C%22))&aggs=infectiousAgent.name(measurementTechnique.name)&facet_size=100&size=10
  // https://api.data.niaid.nih.gov/v1/query?&q=(funding.identifier:(%22U01AI124255%22+OR+%22AI124255%22+OR+%22U01AI124275%22+OR+%22AI124275%22+OR+%22U01AI124290%22+OR+%22AI124290%22+OR+%22U01AI124302%22+OR+%22AI124302%22+OR+%22U01AI124316%22+OR+%22AI124316%22+OR+%22U19AI135972%22+OR+%22AI135972%22+OR+%22U19AI135976%22+OR+%22AI135976%22+OR+%22U19AI135990%22+OR+%22AI135990%22+OR+%22U19AI135995%22+OR+%22AI135995%22+OR+%22U19AI135964%22+OR+%22AI135964%22+OR+%22U01+AI124319%22+OR+%22U01AI111598%22+OR+%22U19+AI106761%22+OR+%22U19AI106754%22+OR+%22U19AI106772%22+OR+%22HHSN272201200031C%22))&aggs=measurementTechnique.name(infectiousAgent.name)&facet_size=100&size=10
  const data = FacetedData.facets[group_one].terms;
  const groupCount = (c: number) => {
    if (c <= 10) {
      return 10;
      return '<10';
    } else if (c <= 50) {
      return 50;
      return '10-50';
    } else if (c <= 100) {
      return 100;
      return '50-100';
    } else {
      return 500;
      return '>100';
    }
  };
  const formatted_data = data.map(facet => {
    const group_one_data = {
      count: facet.count, //number of datasets for group term.
      name: facet.term,
      type: group_one,
      valueGroup: groupCount(facet.count),
    };
    const group_two_data = facet[group_two].terms.map(d => ({
      ...d,
      name: d.term,
      type: group_two,
      valueGroup: groupCount(d.count),
    }));

    return { name: facet.term, children: [group_one_data, ...group_two_data] };
  });

  console.log('F', formatted_data);

  if (!data || data === undefined) {
    return <></>;
  }
  return (
    <>
      {error ? (
        <Error
          message="It's possible that the server is experiencing some issues."
          bg='red.100'
          color='status.error'
          minH='unset'
        >
          {/* reload page */}
          <Button
            flex={1}
            onClick={() => router.reload()}
            variant='solid'
            colorScheme='negative'
          >
            Retry
          </Button>
        </Error>
      ) : (
        <Box>
          <Network
            data={formatted_data}
            // facets={data_facets}
            // filters={filters}
            // updateFilters={updateFilters}
          />
        </Box>
      )}
    </>
  );
};
