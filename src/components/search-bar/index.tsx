import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { uniq } from 'lodash';
import { useRouter } from 'next/router';
import { Button, Heading, Icon, ListItem } from 'nde-design-system';
import { useLocalStorage } from 'usehooks-ts';
import {
  DropdownContent,
  DropdownInput,
  DropdownList,
  Highlight,
  InputWithDropdown,
  useDropdownContext,
} from '../input-with-dropdown';

interface RecentItemProps {
  colorScheme: string;
  index: number;
  searchTerm: string;
  value: string;
  onClick?: React.MouseEventHandler<HTMLLIElement> | undefined;
}
const RecentItem = ({
  colorScheme,
  index,
  searchTerm,
  value,
  onClick,
}: RecentItemProps) => {
  const { cursor, getListItemProps } = useDropdownContext();

  const isSelected = useMemo(() => cursor === index, [index, cursor]);

  return (
    <ListItem
      display='flex'
      alignItems='center'
      borderRadius='base'
      cursor='pointer'
      px={2}
      py={1}
      m={2}
      my={1}
      {...getListItemProps({
        index,
        value,
        isSelected,
        onClick,
      })}
    >
      <Icon as={FaSearch} mr={2} color='primary.500'></Icon>
      <Heading
        as='h4'
        size='sm'
        lineHeight='short'
        color='text.body'
        wordBreak='break-word'
        fontWeight='normal'
        textAlign='left'
        sx={{
          '* > .search-term': {
            fontWeight: 'bold',
            textDecoration: 'underline',
            color: `${colorScheme}.400`,
            bg: 'transparent',
          },
        }}
      >
        <Highlight tags={searchTerm.split(' ')}>{value}</Highlight>
      </Heading>
    </ListItem>
  );
};

interface SearchBarProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
}

export const SearchBar = ({
  ariaLabel,
  placeholder,
  colorScheme = 'primary',
  size = 'md',
}: SearchBarProps) => {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    'recent-searches',
    [],
  );

  // Search term entered in search bar.
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Update value when changed.
  useEffect(() => {
    const { q } = router.query;

    setSearchTerm(prev => {
      if (q && router.query.advancedSearch !== 'true') {
        return q as string;
      }
      return prev;
    });
  }, [router]);

  const handleSubmit = (term: string) => {
    setRecentSearches(prev => {
      const newRecentSearches = uniq(
        [...prev, term].filter(recentSearch => recentSearch.trim().length > 0),
      );

      if (newRecentSearches.length > 5) {
        newRecentSearches.shift();
      }

      return newRecentSearches;
    });

    router.push({
      pathname: `/search`,
      query: { q: `${term.trim()}` },
    });
  };

  return (
    <InputWithDropdown
      inputValue={searchTerm}
      cursorMax={recentSearches.length}
      colorScheme={colorScheme}
    >
      <DropdownInput
        id='search-bar'
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        size={size}
        type='text'
        onChange={setSearchTerm}
        onSubmit={() => handleSubmit(searchTerm)}
        renderSubmitButton={() => {
          return (
            <Button
              display='flex'
              colorScheme={colorScheme}
              aria-label={ariaLabel}
              size={size}
              onClick={() => handleSubmit(searchTerm)}
            >
              Search
            </Button>
          );
        }}
        getInputValue={(idx: number): string => {
          if (recentSearches && recentSearches[idx]) {
            return recentSearches[idx] || '';
          }
          return '';
        }}
      />
      <DropdownContent>
        <DropdownList my={2}>
          {recentSearches.map((recentSearch, i) => {
            return (
              <RecentItem
                key={i}
                index={i}
                colorScheme={colorScheme}
                searchTerm={searchTerm}
                value={recentSearch}
                onClick={() => handleSubmit(recentSearch)}
              />
            );
          })}
        </DropdownList>
      </DropdownContent>
    </InputWithDropdown>
  );
};
