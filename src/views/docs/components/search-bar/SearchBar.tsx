import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  ListItem,
  Text,
  Tooltip,
  UnorderedList,
} from '@chakra-ui/react';
import {
  DropdownInput,
  useDropdownContext,
} from 'src/components/input-with-dropdown';
import { DropdownContent } from 'src/components/input-with-dropdown/components/DropdownContent';
import { SearchHistoryItem } from 'src/components/search-bar/components/search-history-item';
import { debounce, uniq } from 'lodash';
import { FaMagnifyingGlass, FaClockRotateLeft } from 'react-icons/fa6';
import { SearchResultItem } from './SearchResultItem';
import { useDocumentationSearch } from '../../hooks/useDocumentationSearch';
import type { SearchBarProps, SearchResult } from '../../types';
import {
  DEFAULT_SIZE,
  SEARCH_DEBOUNCE_MS,
  MAX_SEARCH_HISTORY_ITEMS,
} from '../../constants';

export const SearchBar = ({
  ariaLabel,
  placeholder,
  colorScheme = 'primary',
  size = DEFAULT_SIZE,
  searchHistory,
  setSearchHistory,
  setCurrentCursorMax,
}: SearchBarProps) => {
  const router = useRouter();
  const { isOpen, setIsOpen, setInputValue } = useDropdownContext();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Debounce search
  const debouncedUpdate = useRef(
    debounce((term: string) => {
      setSearchTerm(term);
    }, SEARCH_DEBOUNCE_MS),
  );

  const updateSearchTerm = useCallback((value: string) => {
    debouncedUpdate.current(value);
  }, []);

  // Run query every time search term changes
  const { isLoading, data: queryResults } = useDocumentationSearch(searchTerm);

  // Update results when query results change
  useEffect(() => {
    if (queryResults) {
      setResults(queryResults);
      setCurrentCursorMax(queryResults.length);
    } else if (searchTerm.length === 0) {
      // Clear results when search term is empty
      setResults([]);
      setCurrentCursorMax(0);
    }
  }, [queryResults, searchTerm.length, setCurrentCursorMax]);

  const historyList = useMemo(
    () => [...searchHistory].reverse(),
    [searchHistory],
  );

  useEffect(() => {
    if (searchTerm.length > 0) {
      // If user is searching, show results and hide history
      setShowHistory(false);
      setIsOpen(true);
      setCurrentCursorMax(results.length);
    } else if (searchTerm.length === 0 && !showHistory && !isOpen) {
      // If no search term, history not shown, and dropdown closed, keep it closed
      setIsOpen(false);
    } else if (showHistory) {
      // If history is shown, update cursor max
      setCurrentCursorMax(historyList.length);
    } else if (isOpen && searchTerm.length === 0 && !showHistory) {
      // If dropdown is open with empty search (from clicking submit), keep it open
      setCurrentCursorMax(0);
    }
  }, [
    searchTerm,
    results.length,
    showHistory,
    historyList.length,
    isOpen,
    setIsOpen,
    setCurrentCursorMax,
  ]);

  const addToHistory = useCallback(
    (term: string) => {
      setSearchHistory(prev => {
        const newSearchHistory = uniq(
          [...prev, term].filter(
            recentSearch => recentSearch.trim().length > 0,
          ),
        );

        if (newSearchHistory.length > MAX_SEARCH_HISTORY_ITEMS) {
          newSearchHistory.shift();
        }

        return newSearchHistory;
      });
    },
    [setSearchHistory],
  );

  const handleSubmit = (value: string, idx: number) => {
    if (showHistory && idx >= 0 && idx < historyList.length) {
      const historyValue = historyList[idx];
      addToHistory(historyValue);
      setIsOpen(false);
      setShowHistory(false);
      setInputValue('');
      updateSearchTerm('');
      setSearchTerm('');
      setResults([]);
      router.push(`/knowledge-center/${historyValue}`);
      return;
    }

    if (!showHistory && idx >= 0 && idx < results.length) {
      const result = results[idx];
      addToHistory(searchTerm);
      setIsOpen(false);
      setInputValue('');
      updateSearchTerm('');
      setSearchTerm('');
      setResults([]);
      router.push(`/knowledge-center/${result.slug}`);
      return;
    }

    const trimmedValue = value.trim();
    if (trimmedValue) {
      addToHistory(trimmedValue);
      setIsOpen(false);
      setInputValue('');
      updateSearchTerm('');
      setSearchTerm('');
      setResults([]);
      router.push(`/knowledge-center/${trimmedValue}`);
    } else {
      // If empty search, open dropdown to show "Start typing to search..." message
      setIsOpen(true);
      setShowHistory(false);
    }
  };

  const handleResultClick = (slug: string) => {
    addToHistory(searchTerm);
    setIsOpen(false);
    setInputValue('');
    updateSearchTerm('');
    setSearchTerm('');
    setResults([]);
    router.push(`/knowledge-center/${slug}`);
  };

  const handleHistoryClick = useCallback(
    (value: string) => {
      setInputValue(value);
      updateSearchTerm(value);
      setSearchTerm(value);
      setShowHistory(false);
    },
    [setInputValue, updateSearchTerm],
  );

  const toggleHistory = () => {
    const newShowHistory = !showHistory;
    setShowHistory(newShowHistory);

    if (newShowHistory) {
      // Opening history => clear search term immediately (bypass debounce)
      setSearchTerm('');
      setInputValue('');
      setCurrentCursorMax(historyList.length);
      setIsOpen(true);
    } else {
      // Closing history
      setIsOpen(false);
    }
  };

  return (
    <>
      <DropdownInput
        id='docs-search-bar'
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        colorScheme={colorScheme}
        size={size}
        type='text'
        onChange={updateSearchTerm}
        onSubmit={handleSubmit}
        getInputValue={(idx: number): string => {
          if (showHistory && historyList && historyList[idx]) {
            return historyList[idx] || '';
          }
          if (!showHistory && results && results[idx]) {
            return results[idx].name || '';
          }
          return '';
        }}
        onClose={() => {
          updateSearchTerm('');
          setInputValue('');
          setIsOpen(false);
          setShowHistory(false);
        }}
        renderSubmitButton={() => (
          <HStack height='100%'>
            <Button
              colorScheme={colorScheme}
              aria-label={ariaLabel}
              size={size}
              type='submit'
              display={{ base: 'none', md: 'flex' }}
            >
              Search Knowledge Center
            </Button>
            <Flex borderLeft='1px solid' borderLeftColor='gray.200' pl={1}>
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
                  onClick={toggleHistory}
                />
              </Tooltip>
            </Flex>
          </HStack>
        )}
      />

      {isOpen && showHistory && (
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
                {historyList.length
                  ? 'Previous searches'
                  : 'No previous searches.'}
              </Text>
            </ListItem>
            {historyList.map((str, index) => (
              <SearchHistoryItem
                key={`history-${str}-${index}`}
                index={index}
                colorScheme={colorScheme}
                searchTerm=''
                value={str}
                onClick={handleHistoryClick}
              />
            ))}
          </UnorderedList>
        </DropdownContent>
      )}

      {isOpen && !showHistory && (
        <DropdownContent>
          <Box py={6}>
            {!searchTerm && (
              <Flex flexDirection='column' alignItems='center' margin='0 auto'>
                <Icon
                  as={FaMagnifyingGlass}
                  boxSize={5}
                  color='primary.400'
                  mb={4}
                />
                <Text fontWeight='medium' color='gray.600'>
                  Start typing to search…
                </Text>
              </Flex>
            )}
            {searchTerm && (!results || !results.length) && !isLoading && (
              <Text fontWeight='medium' color='gray.600' textAlign='center'>
                No search results for &quot;{searchTerm}&quot;.
              </Text>
            )}

            <UnorderedList ml={0} w='100%'>
              {results?.map((result, index) => (
                <SearchResultItem
                  key={`result-${result.id}-${index}`}
                  index={index}
                  result={result}
                  searchTerm={searchTerm}
                  colorScheme={colorScheme}
                  onClick={() => handleResultClick(result.slug)}
                />
              ))}
            </UnorderedList>
          </Box>
        </DropdownContent>
      )}
    </>
  );
};
