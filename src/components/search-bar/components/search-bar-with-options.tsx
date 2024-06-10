import React, { useCallback, useEffect, useState } from 'react';
import { uniq } from 'lodash';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  DropdownInput,
  DropdownInputProps,
  useDropdownContext,
} from '../../input-with-dropdown';
import { SearchHistoryItem } from './search-history-item';
import { SearchInput } from './search-input';
import { SearchBarWithDropdownProps } from '..';
import { FaClockRotateLeft } from 'react-icons/fa6';
import {
  Button,
  Divider,
  Flex,
  Icon,
  IconButton,
  Tooltip,
  ListItem,
  Text,
  UnorderedList,
  HStack,
} from '@chakra-ui/react';
import { CheckboxList } from 'src/views/home/components/TableWithSearch/filters/checkbox-list';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { queryFilterObject2String } from 'src/components/filters';

const DropdownContent = dynamic(() =>
  import('src/components/input-with-dropdown/components/DropdownContent').then(
    mod => mod.DropdownContent,
  ),
);

interface SearchBarProps extends SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  searchHistory: string[];
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SearchBarWithOptions = ({
  ariaLabel,
  placeholder,
  colorScheme = 'primary',
  size = 'md',
  searchHistory,
  setSearchHistory,
  options,
}: SearchBarProps) => {
  const router = useRouter();
  const { isOpen, setIsOpen } = useDropdownContext();
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
    setSearchHistory(prev => {
      const newSearchHistory = uniq(
        [...prev, term].filter(recentSearch => recentSearch.trim().length > 0),
      );

      if (newSearchHistory.length > 5) {
        newSearchHistory.shift();
      }

      return newSearchHistory;
    });
    router.push({
      pathname: `/search`,
      query: {
        q: `${term.trim()}`,
        filters: queryFilterObject2String({
          '@type': filters.map(f => f.value),
        }),
      },
    });
  };

  /****** Handle Filters ******/
  const [filters, setFilters] = useState<
    { name: string; value: string; property: string }[]
  >([]);

  const updateFilters = useCallback(
    (newFilter: { name: string; value: string; property: string }) => {
      setFilters(prevFilters => {
        // Check if filter is already added
        const index = prevFilters.findIndex(
          f => f.property === newFilter.property && f.value === newFilter.value,
        );
        if (index === -1) {
          // Add new filter
          return [...prevFilters, newFilter];
        } else {
          // Remove filter if it's already there
          return prevFilters.filter((_, i) => i !== index);
        }
      });
    },
    [],
  );
  return (
    <>
      <DropdownInput
        id='search-bar-with-options'
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        type='text'
        size={size}
        onChange={setSearchTerm}
        onSubmit={handleSubmit}
        getInputValue={(idx: number): string => {
          if (searchHistory && searchHistory[idx]) {
            return searchHistory[idx] || '';
          }
          return '';
        }}
        onClose={() => {
          setIsOpen(false);
        }}
        renderSubmitButton={() => {
          return (
            <>
              <HStack>
                {options && (
                  <CheckboxList
                    label='Type'
                    property='@type'
                    description={SCHEMA_DEFINITIONS['type'].abstract['Dataset']}
                    options={options}
                    selectedOptions={
                      filters.filter(item => item.property === '@type') || []
                    }
                    handleChange={updateFilters}
                  ></CheckboxList>
                )}
                <Button
                  colorScheme={colorScheme}
                  aria-label={ariaLabel}
                  size={size}
                  type='submit'
                  display={{ base: 'none', md: 'flex' }}
                >
                  Search
                </Button>
              </HStack>
              <Divider orientation='vertical' borderColor='gray.200' m={1} />

              <Tooltip label='Toggle search history.'>
                <IconButton
                  variant='ghost'
                  size={size}
                  aria-label='Toggle search history.'
                  icon={
                    <Flex px={2}>
                      <Icon as={FaClockRotateLeft} />
                    </Flex>
                  }
                  onClick={() => setIsOpen(!isOpen)}
                />
              </Tooltip>
            </>
          );
        }}
      />

      {isOpen && (
        <DropdownContent>
          <UnorderedList ml={0}>
            <ListItem
              px={2}
              mx={2}
              my={1}
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Text
                fontSize='xs'
                fontStyle='italic'
                color='primary.600'
                fontWeight='medium'
              >
                {searchHistory.length
                  ? 'Previous searches'
                  : 'No previous searches.'}
              </Text>
              {/* <IconButton
                aria-label='Close search history.'
                icon={<Icon as={FaXmark} />}
                variant='ghost'
                size='sm'
                onClick={() => setIsOpen(false)}
              /> */}
            </ListItem>
            {searchHistory.map((str, index) => {
              return (
                <SearchHistoryItem
                  key={str}
                  index={index}
                  colorScheme={colorScheme}
                  searchTerm={searchTerm}
                  value={str}
                  onClick={value => handleSubmit(value)}
                />
              );
            })}
          </UnorderedList>
        </DropdownContent>
      )}
    </>
  );
};
