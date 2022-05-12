import React, {useEffect, useState} from 'react';
import {SearchInput} from 'nde-design-system';
import {useRouter} from 'next/router';
import {PageContent} from '../page-container';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.currentTarget.value);
  };

  // update value when changed
  useEffect(() => {
    setSearchTerm(prev => {
      if (value) {
        return value;
      } else if (router.query.q) {
        return Array.isArray(router.query.q)
          ? router.query.q.join(' ')
          : router.query.q;
      } else {
        return prev;
      }
    });
  }, [value, router]);

  return (
    <PageContent
      bg='#fff'
      minH='unset'
      borderBottom='1px solid'
      borderColor='gray.100'
    >
      <SearchInput
        colorScheme='primary'
        w='100%'
        value={searchTerm}
        handleChange={handleChange}
        handleSubmit={e => {
          e.preventDefault();
          router.push({
            pathname: `/search`,
            query: {q: searchTerm.trim(), from: 1},
          });
        }}
        placeholder='Search for datasets or tools'
        ariaLabel={ariaLabel || 'Search for datasets or tools'}
        {...props}
      />
    </PageContent>
  );
};
