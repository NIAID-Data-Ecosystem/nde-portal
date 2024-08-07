import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { fetchSearchResults } from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

export interface usePredictiveSearchResponse {
  isLoading: boolean;
  error: Error | null;
  results: Partial<FormattedResource>[];
  searchTerm: string;
  searchField: string;
  updateSearchTerm: (value: string) => void;
  setSearchField: (value: string) => void;
}
// Handles query formatting for predictive search
export const usePredictiveSearch = (
  term = '',
  field = '',
  encode = true,
  validate = (arg: string) => true,
) => {
  const [results, setResults] = useState<Partial<FormattedResource>[]>([]);
  const [searchTerm, setSearchTerm] = useState(term);
  const [searchField, setSearchField] = useState(field);
  const queryClient = useQueryClient();

  const selectedFieldDetails = useMemo(
    () => SCHEMA_DEFINITIONS[searchField as keyof typeof SCHEMA_DEFINITIONS],
    [searchField],
  );
  // Run query every time search trm changes.
  const {
    isLoading,
    error,
    isFetching,
    data: queryResults,
  } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    | {
        [x: string]: string;
      }[]
    | FormattedResource[]
    | undefined
  >({
    queryKey: [
      'predictive-search-results',
      { term: searchTerm, facet: searchField },
    ],
    queryFn: ({ signal }) => {
      const queryString = encode
        ? encodeString(searchTerm).replace(/(?=[()])/g, '\\')
        : searchTerm;

      // if its a keyword search we use the aggregation field.
      if (selectedFieldDetails?.type === 'keyword') {
        return fetchSearchResults(
          {
            size: 0,
            q: searchField
              ? `(${searchField}:(${queryString}))`
              : `${queryString}`,
            // return flattened version of data.
            dotfield: true,
            sort: '_score',
            facets: searchField,
          },
          signal, // used to detect if request has been cancelled.
        );
      } else {
        return fetchSearchResults(
          {
            size: 20,
            q: searchField
              ? `(${searchField}:(${queryString}))`
              : `${queryString}`,
            // return flattened version of data.
            dotfield: true,
            fields: ['name', '@type', searchField],
            sort: '_score',
          },
          signal, // used to detect if request has been cancelled.
        );
      }
    },

    enabled:
      validate &&
      validate(searchTerm) &&
      searchTerm.length > 0 &&
      !!searchField,
    select: data => {
      if (selectedFieldDetails?.type === 'keyword') {
        if (data?.facets && data?.facets[searchField]) {
          const results = data?.facets[searchField].terms.map(facet => {
            return { [searchField]: facet.term };
          });
          return results;
        }
      } else {
        // if results exist set state.
        if (data?.results) {
          return data?.results;
        }
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Set results if query is successful.
  useEffect(() => {
    if (queryResults) {
      setResults(queryResults);
    }
  }, [queryResults]);

  useEffect(() => {
    setSearchField(field);
  }, [field]);

  // reset results if no search term is provided.
  useEffect(() => {
    if (!searchTerm) setResults([]);
  }, [searchTerm]);

  /*
  [Update query with a delay]
  Wrapping debounce in useRef since its an expensive call, only run if fn changes.
  */

  const debouncedUpdate = useRef(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 400),
  );

  const updateSearchTerm = useCallback((value: string) => {
    debouncedUpdate.current(value);
  }, []);

  // Cancels query if user changes search term before previous query is complete.
  const cancelRequest = () => {
    const keys = ['advanced-search', { term: searchTerm, facet: searchField }];
    queryClient.cancelQueries({ queryKey: keys, fetchStatus: 'fetching' });
  };

  return {
    isLoading: isLoading || isFetching,
    error,
    results,
    searchTerm,
    setSearchTerm,
    searchField,
    updateSearchTerm,
    setSearchField,
    cancelRequest,
    onReset: () => setSearchTerm(''),
  };
};
