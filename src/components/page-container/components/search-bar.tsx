import React, {useEffect, useState} from 'react';
import {PageContent} from './content';
import {SearchInput} from 'nde-design-system';
import {useRouter} from 'next/router';

export const SearchBar = ({
  value,
  ariaLabel,
  ...props
}: {
  ariaLabel: string;
  value: string;
}) => {
  const router = useRouter();
  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState<string>(value || '');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.currentTarget.value);
  };

  // update value when changed
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <PageContent bg='white' minH='unset'>
      <SearchInput
        ariaLabel={ariaLabel}
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
        {...props}
      />
    </PageContent>
  );
};
