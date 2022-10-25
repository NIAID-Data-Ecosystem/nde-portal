import React from 'react';
import {
  SearchWithPredictiveText,
  usePredictiveSearch,
} from 'src/components/search-with-predictive-text';

interface SearchInputProps {}

export const SearchInput: React.FC<SearchInputProps> = ({}) => {
  // Search term entered in search bar
  const {
    isLoading: loadingSuggestions,
    results,
    searchField,
    searchTerm,
    setSearchTerm,
  } = usePredictiveSearch();

  return (
    <>
      {/* Input field with suggestions matching the search term. */}
      {/* <SearchWithPredictiveText
              ariaLabel='Search for datasets or tools'
              placeholder='Search for datasets or tools'
              size='md'
              handleSubmit={(stringValue, __, data) => {
                if (data && data.id) {
                  router.push({
                    pathname: `/resources`,
                    query: { id: `${data.id}` },
                  });
                } else {
                  router.push({
                    pathname: `/search`,
                    query: { q: `${stringValue.trim()}` },
                  });
                }
              }}
            /> */}
    </>
  );
};
