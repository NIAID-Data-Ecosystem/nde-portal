import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PageContent } from '../page-container';
import { SearchWithPredictiveText } from '../search-with-predictive-text';
import { SearchInput } from 'nde-design-system';

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
  const [searchTerm, setSearchTerm] = useState<string>(value || '');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  // update value when changed
  useEffect(() => setSearchTerm(value || ''), [value]);
  return (
    <PageContent
      bg='#fff'
      minH='unset'
      borderBottom='1px solid'
      borderColor='gray.100'
    >
      <SearchInput
        ariaLabel='Search for datasets or tools'
        placeholder='Search for datasets or tools'
        size='md'
        colorScheme='primary'
        w='100%'
        value={searchTerm}
        handleChange={handleChange}
        handleSubmit={e => {
          e.preventDefault();
          router.push({
            pathname: `/search`,
            query: { q: `${searchTerm.trim()}` },
          });
        }}
        {...props}
      />
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
    </PageContent>
  );
};
