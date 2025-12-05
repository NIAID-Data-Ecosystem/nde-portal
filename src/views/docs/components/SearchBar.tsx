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
  Heading,
  Highlight,
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
  InputWithDropdown,
  useDropdownContext,
} from 'src/components/input-with-dropdown';
import { DropdownContent } from 'src/components/input-with-dropdown/components/DropdownContent';
import { SearchHistoryItem } from 'src/components/search-bar/components/search-history-item';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { debounce, uniq } from 'lodash';
import { FaMagnifyingGlass, FaClockRotateLeft } from 'react-icons/fa6';
import { remark } from 'remark';
import { useLocalStorage } from 'usehooks-ts';
import { DocumentationProps } from './MainContent';

export const searchDocumentation = async (searchTerm: string) => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const docs = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/docs?populate[fields][0]=name&populate[fields][1]=slug&populate[fields][2]=publishedAt&populate[fields][3]=updatedAt&populate[fields][4]=subtitle&populate[fields][5]=description&sort[publishedAt]=desc&sort[updatedAt]=desc&paginate[page]=1&paginate[pageSize]=5&status=${
        isProd ? 'published' : 'draft'
      }&_q=${searchTerm}`,
    );
    return docs.data.data;
  } catch (err: any) {
    throw err.response;
  }
};

function searchInMDX(
  mdxString: string,
  targetWord: string,
  targetLength = 200,
) {
  let nearestHeading = null;
  let snippet = null;

  // Parse the MDX content into mdast
  const tree = remark().parse(mdxString);
  // Helper function to extract text from a node
  function extractText(node: any) {
    if (node.type === 'text' || node.type === 'inlineCode') {
      return node.value;
    } else if (node.children) {
      return node.children.map(extractText).join('');
    }
    return '';
  }

  // Traverse the mdast tree. Stop when the target word is found.
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];

    // Store the nearest preceding heading
    if (node.type === 'heading') {
      let rawHeading = extractText(node);
      nearestHeading = rawHeading
        .toLowerCase() // convert to lowercase
        .replace(/[^a-zA-Z\s]/g, '') // remove non-alpha characters
        .trim() // trim any extra whitespace from start and end
        .replace(/\s+/g, '-'); // replace sequences of whitespace with dash
    }

    // Check if the node contains the target word
    const text = extractText(node);
    const index = text.toLowerCase().indexOf(targetWord.toLowerCase());

    if (index !== -1) {
      let startIndex;
      if (index < targetLength) {
        startIndex = 0;
      } else {
        startIndex = index;
      }

      snippet = text.substr(startIndex, targetLength);
      break;
    }
  }

  return {
    heading: nearestHeading,
    snippet: snippet,
  };
}

interface SearchResult {
  id: DocumentationProps['id'];
  name: DocumentationProps['name'];
  slug: string;
  description: DocumentationProps['description'];
}

interface SearchResultItemProps {
  index: number;
  result: SearchResult;
  searchTerm: string;
  colorScheme: string;
  onClick: () => void;
}

const SearchResultItem = React.memo(
  ({
    index,
    result,
    searchTerm,
    colorScheme,
    onClick,
  }: SearchResultItemProps) => {
    const { cursor, getListItemProps } = useDropdownContext();
    const isSelected = useMemo(() => cursor === index, [index, cursor]);

    return (
      <ListItem
        px={2}
        mx={2}
        my={1}
        borderRadius='base'
        cursor='pointer'
        {...getListItemProps({
          index,
          value: result.slug,
          isSelected,
          onClick,
        })}
      >
        <Heading
          as='h4'
          size='sm'
          lineHeight='short'
          color='text.body'
          wordBreak='break-word'
          textAlign='left'
        >
          {result.name && (
            <Highlight
              query={searchTerm.split(' ')}
              styles={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: `${colorScheme}.400`,
                bg: 'transparent',
              }}
            >
              {result.name}
            </Highlight>
          )}
        </Heading>
        {result.description && (
          <Text color='gray.600' fontSize='sm'>
            <Highlight
              query={searchTerm.split(' ')}
              styles={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: `${colorScheme}.400`,
                bg: 'transparent',
              }}
            >
              {result.description}
            </Highlight>
          </Text>
        )}
      </ListItem>
    );
  },
);

interface SearchBarProps {
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  searchHistory: string[];
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
  currentCursorMax: number;
  setCurrentCursorMax: React.Dispatch<React.SetStateAction<number>>;
}

const SearchBar = ({
  ariaLabel,
  placeholder,
  colorScheme = 'primary',
  size = 'md',
  searchHistory,
  setSearchHistory,
  currentCursorMax,
  setCurrentCursorMax,
}: SearchBarProps) => {
  const router = useRouter();
  const { isOpen, setIsOpen, setInputValue } = useDropdownContext();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // debounce search
  const debouncedUpdate = useRef(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 400),
  );

  const updateSearchTerm = useCallback((value: string) => {
    debouncedUpdate.current(value);
  }, []);

  // Run query every time search term changes.
  const { isLoading, data: queryResults } = useQuery<
    DocumentationProps[],
    Error,
    SearchResult[]
  >({
    queryKey: ['docs-search', { term: searchTerm }],
    queryFn: () => searchDocumentation(searchTerm),
    select: data => {
      if (searchTerm.length === 0) {
        return [];
      }
      return data.map(datum => {
        const slug = Array.isArray(datum.slug) ? datum.slug[0] : datum.slug;
        if (datum.description) {
          const { heading, snippet } = searchInMDX(
            datum.description,
            searchTerm,
          );
          return {
            id: datum.id,
            name: datum.name,
            slug: heading ? slug + '#' + heading : slug,
            description: snippet,
          };
        }
        return {
          id: datum.id,
          name: datum.name,
          slug,
          description: '',
        };
      });
    },
    refetchOnWindowFocus: false,
    enabled: searchTerm.length > 0,
  });

  // Update results when query results change.
  useEffect(() => {
    if (queryResults) {
      setResults(queryResults);
      setCurrentCursorMax(queryResults.length);
    }
  }, [queryResults, setCurrentCursorMax]);

  const historyList = useMemo(
    () => [...searchHistory].reverse(),
    [searchHistory],
  );

  useEffect(() => {
    if (searchTerm.length > 0) {
      setShowHistory(false);
      setIsOpen(true);
      setCurrentCursorMax(results.length);
    } else if (!showHistory) {
      setIsOpen(false);
    }
  }, [searchTerm, results.length, showHistory, setIsOpen, setCurrentCursorMax]);

  const addToHistory = useCallback(
    (term: string) => {
      setSearchHistory(prev => {
        const newSearchHistory = uniq(
          [...prev, term].filter(
            recentSearch => recentSearch.trim().length > 0,
          ),
        );

        if (newSearchHistory.length > 5) {
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
      router.push(`/knowledge-center/${historyValue}`);
      setIsOpen(false);
      setShowHistory(false);
      setInputValue('');
      updateSearchTerm('');
      return;
    }

    if (!showHistory && idx >= 0 && idx < results.length) {
      const result = results[idx];
      addToHistory(searchTerm);
      router.push(`/knowledge-center/${result.slug}`);
      setIsOpen(false);
      setInputValue('');
      updateSearchTerm('');
      return;
    }

    const trimmedValue = value.trim();
    if (trimmedValue) {
      addToHistory(trimmedValue);
      router.push(`/knowledge-center/${trimmedValue}`);
      setIsOpen(false);
      setInputValue('');
      updateSearchTerm('');
    }
  };

  const handleResultClick = (slug: string) => {
    addToHistory(searchTerm);
    router.push(`/knowledge-center/${slug}`);
    setIsOpen(false);
    setInputValue('');
    updateSearchTerm('');
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
    setIsOpen(newShowHistory);
    if (newShowHistory) {
      setCurrentCursorMax(historyList.length);
      updateSearchTerm('');
      setInputValue('');
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
        renderSubmitButton={() => {
          return (
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
          );
        }}
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
                searchTerm={''}
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

interface SearchBarWithDropdownProps {
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
}

export const DocsSearchBar = (props: SearchBarWithDropdownProps) => {
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>(
    'docs-searches',
    [],
  );
  const [mounted, setMounted] = useState(false);
  const [currentCursorMax, setCurrentCursorMax] = useState(0);

  useEffect(() => {
    setMounted(true);
    setCurrentCursorMax(searchHistory.length);
  }, [searchHistory.length]);

  if (!mounted) {
    return null;
  }

  return (
    <Flex w='100%' justifyContent='center' px={4}>
      <Box w='100%' maxW='800px'>
        <InputWithDropdown
          inputValue=''
          cursorMax={currentCursorMax}
          colorScheme={props.colorScheme}
        >
          <SearchBar
            searchHistory={searchHistory}
            setSearchHistory={setSearchHistory}
            currentCursorMax={currentCursorMax}
            setCurrentCursorMax={setCurrentCursorMax}
            {...props}
          />
        </InputWithDropdown>
      </Box>
    </Flex>
  );
};
