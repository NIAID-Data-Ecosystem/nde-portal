import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { debounce } from 'lodash';
import { fetchSearchResults } from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { encodeString } from 'src/utils/querystring-helpers';

// Handles query formatting for predictive search
export const usePredictiveSearch = (term = '', field = '') => {
  const [results, setResults] = useState<FormattedResource[]>([]);
  const [searchTerm, setSearchTerm] = useState(term);
  const [searchField, setSearchField] = useState(field);

  // Run query every time search term changes.
  const { isLoading, error, isFetching } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    ['advanced-search', { term: searchTerm, facet: searchField }],
    () => {
      const queryString = encodeString(searchTerm);

      // add wild card to each term in querystring for fielded searches (ES automatically does this for non fielded queries).
      return fetchSearchResults({
        q: searchField
          ? `${searchField}:${queryString
              .split(' ')
              .map(str => `${str}*`)
              .join(' ')}`
          : `${queryString}`,
        size: 20,
        // return flattened version of data.
        dotfield: true,
        fields: ['name', '@type', searchField].join(','),
        sort: '_score',
      });
    },

    // Don't refresh everytime window is touched, only run query if there's is a search term
    {
      refetchOnWindowFocus: false,
      enabled: searchTerm.length > 0,
      onSuccess: data => {
        // if results exist set state.
        if (data?.results) {
          setResults(data?.results);
        }
      },
    },
  );

  // reset results if no search term is provided.
  useEffect(() => {
    if (!searchTerm) setResults([]);
  }, [searchTerm]);

  /*
  [Update query with a delay]
  Wrapping debounce in useRef since its an expensive call, only run if fn changes.
  */
  const debouncedUpdate = useRef(
    debounce((term: string) => setSearchTerm(term), 200),
  );

  const updateSearchTerm = (value: string) => {
    debouncedUpdate.current(value);
  };

  return {
    isLoading: isLoading || isFetching,
    error,
    results,
    searchTerm,
    searchField,
    updateSearchTerm,
    setSearchTerm,
    setSearchField,
  };
};
