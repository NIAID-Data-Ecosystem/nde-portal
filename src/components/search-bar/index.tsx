import React from 'react';
import { useRouter } from 'next/router';
import { PageContent } from '../page-container';
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

  return (
    <PageContent
      bg='#fff'
      minH='unset'
      borderBottom='1px solid'
      borderColor='gray.100'
    >
      <SearchWithPredictiveText
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
      />
    </PageContent>
  );
};
