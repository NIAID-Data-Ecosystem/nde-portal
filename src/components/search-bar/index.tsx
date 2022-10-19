import React from 'react';
import { useRouter } from 'next/router';
import { PageContent } from '../page-container';
import { usePredictiveSearch } from '../advanced-search/usePredictiveSearch';
import { SearchWithPredictiveText } from '../search-with-predictive-text';

export const SearchBar = ({
  value,
  ariaLabel,
  ...props
}: {
  ariaLabel?: string;
  value?: string;
}) => {
  const router = useRouter();
  // Search term entered in search bar
  const {
    isLoading: loadingSuggestions,
    results,
    searchField,
    searchTerm,
    setSearchTerm,
  } = usePredictiveSearch();

  return (
    <PageContent
      bg='#fff'
      minH='unset'
      borderBottom='1px solid'
      borderColor='gray.100'
    >
      <SearchWithPredictiveText
        queryFn={(term: string) => setSearchTerm(term)}
        results={results}
        selectedField={searchField}
        ariaLabel='Search for datasets or tools'
        placeholder='Search for datasets or tools'
        searchTerm={searchTerm}
        isLoading={loadingSuggestions}
        size='md'
        handleSubmit={val => {
          router.push({
            pathname: `/search`,
            query: { q: `"${val.trim()}"`, from: 1 },
          });
        }}
      />
    </PageContent>
  );
};
