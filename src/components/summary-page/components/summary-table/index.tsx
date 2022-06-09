import React from 'react';
import { PageContent } from 'src/components/page-container';
import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import { queryFilterObject2String } from 'src/components/filter/helpers';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import TableData from './table-data';
import { SelectedFilterType } from '../hooks';

interface SummaryTableProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
}

/*
 [TO DO] :
 - fix pagination, sort + order
 - Merge components with Table data + cleanup
*/

export const SummaryTable: React.FC<SummaryTableProps> = ({
  queryString,
  filters,
}) => {
  const DEFAULT_SIZE = 10;
  const { data, isLoading } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        q: queryString,
        size: DEFAULT_SIZE,
        filters,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }

      const filter_string = queryFilterObject2String(filters);

      return fetchSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `(${queryString})`,
        size: `${DEFAULT_SIZE}`,
        from: `0`,
      });
    },
    { refetchOnWindowFocus: false },
  );

  return (
    <PageContent>
      <TableData isLoading={isLoading} data={data?.results} />
    </PageContent>
  );
};
