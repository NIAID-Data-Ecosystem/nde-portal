import {
  Accordion,
  Box,
  Button,
  Collapsible,
  Flex,
  Heading,
  Icon,
  List,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import SampleQueriesData from 'configs/sample-queries.json';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FaAngleDown,
  FaAngleUp,
  FaArrowRotateLeft,
  FaClockRotateLeft,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa6';
import { QueryStringError } from 'src/components/error/types';
import { formatNumber } from 'src/utils/helpers';
import { useLocalStorage } from 'usehooks-ts';

import { ErrorBanner } from '../error/ErrorBanner';
import { EditableQueryText } from './components/EditableQueryText';
import { validateQueryString } from './components/EditableQueryText/utils';
import { ResultsCount } from './components/ResultsCount';
import { AdvancedSearchFormContext, Search } from './components/Search';
import { SEARCH_TYPES_CONFIG } from './components/Search/search-types-config';
import {
  buildTree,
  FlattenedItem,
  SortableWithCombine,
  TreeItem,
} from './components/SortableWithCombine';
import {
  convertObject2QueryString,
  convertQueryString2Object,
} from './utils/query-helpers';
import { removeDuplicateErrors } from './utils/validation-checks';

export interface AdvancedSearchProps {
  colorPalette?: string;
  sampleQueries?: {
    name: string;
    items: FlattenedItem[];
  }[];
  querystring?: string;
  renderButtonGroup?: (props: any) => JSX.Element;
  onValidSubmit?: () => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  querystring: initialQuerystring,
  onValidSubmit,
  renderButtonGroup,
  colorPalette = 'primary',
  sampleQueries = SampleQueriesData as {
    name: string;
    items: FlattenedItem[];
  }[],
}) => {
  const [count, setCount] = useState(0);
  const router = useRouter();

  const [searchHistory, setSearchHistory] = useLocalStorage<
    { querystring: string; count: number }[]
  >('advanced-searches', []);

  const [isMounted, setIsMounted] = useState(false); // local storage for SSR.

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [resetForm, setResetForm] = useState(false);

  const { open: showRawQuery, onToggle: toggleShowRawQuery } = useDisclosure({
    defaultOpen: true,
  });
  const [items, setItems] = useState<TreeItem[]>([]);

  // Errors with either the query string or the query string's output.
  const [errors, setErrors] = useState<QueryStringError[]>([]);

  useEffect(() => {
    if (items.length > 0 && resetForm === true) {
      setResetForm(false);
      setErrors([]);
    }
  }, [items, resetForm]);

  useEffect(() => {
    if (initialQuerystring) {
      const items = convertQueryString2Object(initialQuerystring);
      setItems(items);
    }
  }, [initialQuerystring]);

  const updateItems = useCallback(
    (items: React.SetStateAction<TreeItem[]>) => setItems(items),
    [],
  );

  const handleErrors = useCallback((queryErrors: QueryStringError[]) => {
    return setErrors(prev => {
      if (queryErrors.length) {
        return removeDuplicateErrors([...queryErrors]);
      }
      return [...prev];
    });
  }, []);

  const handleSubmit = () => {
    // add validation
    const querystring = convertObject2QueryString(items);

    const validation = validateQueryString(querystring);
    if (validation.isValid) {
      router.push({
        pathname: `/search`,
        query: { q: `${querystring}` },
      });
      onValidSubmit && onValidSubmit();

      setSearchHistory(prev => {
        const newSearchHistory = [...prev, { querystring, count }];
        // Only keep the last 5 searches in history.
        newSearchHistory.length > 5 && newSearchHistory.shift();
        return newSearchHistory;
      });
    } else {
      handleErrors(validation.errors);
    }
  };

  return (
    <>
      {/* Search For Query Term */}
      <Box w='100%'>
        <Heading size='sm' fontWeight='medium' color='gray.800'>
          Add terms to the query builder.
        </Heading>
        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'flex-start', md: 'flex-end' }}
          flexWrap='wrap'
        >
          <AdvancedSearchFormContext searchTypeOptions={SEARCH_TYPES_CONFIG}>
            <Search
              items={items}
              setItems={updateItems}
              resetForm={resetForm}
              setResetForm={setResetForm}
            />
          </AdvancedSearchFormContext>
        </Flex>

        <Heading size='sm' fontWeight='medium' mb={2}>
          Or choose from the sample queries below.
        </Heading>
        {sampleQueries.map(query => {
          return (
            <Button
              key={query.name}
              w={['100%', 'unset']}
              my={[2, 2, 0]}
              mx={1}
              colorPalette='gray'
              color='text.body'
              size='sm'
              onClick={() => setItems(buildTree(query.items))}
            >
              <Text truncate>{query.name}</Text>
            </Button>
          );
        })}
      </Box>
      {/* Query Builder Area */}
      <Box m={2} mt={6}>
        <Flex>
          <Heading
            flex={1}
            size='sm'
            fontWeight='medium'
            color={items.length ? 'text.heading' : 'gray.800'}
          >
            Query Builder
          </Heading>
          <Button
            colorPalette='primary'
            size='sm'
            variant='outline'
            disabled={!items.length}
            onClick={() => {
              setItems([]);
              setResetForm(true);
            }}
            ml={4}
          >
            <FaArrowRotateLeft />
            Clear query
          </Button>
        </Flex>
        <Text color={items.length ? 'text.body' : 'gray.800'} fontSize='sm'>
          Re-order query terms by click and drag. Group items together by
          dragging an element over another.
        </Text>
        <ResultsCount
          queryString={convertObject2QueryString(items)}
          setCount={setCount}
        />

        <Box bg='gray.100'>
          <SortableWithCombine
            items={items}
            setItems={updateItems}
            removable
            collapsible
          />
        </Box>

        <Box w='100%'>
          <Collapsible.Root open={showRawQuery}>
            <Collapsible.Content>
              <Box my={2}>
                <EditableQueryText
                  queryObj={items}
                  updateQueryObj={updateItems}
                  errors={errors}
                  setErrors={setErrors}
                />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>

          <Button
            disabled={items.length === 0}
            onClick={toggleShowRawQuery}
            colorPalette='gray'
            color='text.body'
            size='sm'
            mt={2}
          >
            {showRawQuery ? (
              <Icon asChild>
                <FaEyeSlash />
              </Icon>
            ) : (
              <Icon asChild>
                <FaEye />
              </Icon>
            )}
            {showRawQuery ? 'hide' : 'view'}raw query
            {showRawQuery ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </Box>

        <ErrorBanner errors={errors} setErrors={setErrors} />
        <Flex my={4} justifyContent='flex-end'>
          {renderButtonGroup && renderButtonGroup({ colorPalette })}
          {handleSubmit && (
            <Button
              colorPalette={colorPalette}
              onClick={handleSubmit}
              disabled={
                items.length === 0 ||
                errors.filter(({ type }) => type == 'error').length > 0
              }
              size='md'
            >
              Submit
            </Button>
          )}
        </Flex>
        <Accordion.Root my={4} defaultValue={['item-0']} collapsible>
          <Accordion.Item value='item-0'>
            <h2>
              <Accordion.ItemTrigger
                _hover={{ bg: 'transparent' }}
                _focus={{ boxShadow: 'none' }}
              >
                <Text
                  fontSize='sm'
                  fontWeight='semibold'
                  color='text.heading'
                  display='flex'
                  alignItems='center'
                  flex={1}
                >
                  <Icon mx={2} color='info' asChild>
                    <FaClockRotateLeft />
                  </Icon>
                  Search History
                </Text>
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
            </h2>
            <Accordion.ItemContent px={[1, 4]}>
              <Accordion.ItemBody>
                <List.Root as='ul' ml={0}>
                  {isMounted &&
                    searchHistory.length > 0 &&
                    searchHistory.reverse().map((query, index) => {
                      return (
                        <List.Item
                          key={`li-${index}`}
                          onClick={() => {
                            setItems(
                              convertQueryString2Object(query.querystring),
                            );
                          }}
                          _hover={{
                            cursor: 'pointer',
                            '&.hist-querystring': {
                              textDecoration: 'underline',
                            },
                          }}
                          bg='info'
                          borderRadius='semi'
                          my={0.5}
                        >
                          <Flex
                            className='hist-row'
                            bg={index % 2 ? 'whiteAlpha.800' : 'whiteAlpha.900'}
                            flexDirection={{
                              base: 'column',
                              md: 'row-reverse',
                            }}
                            alignItems={{ base: 'flex-start', md: 'center' }}
                            justifyContent={{ base: 'space-between' }}
                            px={2}
                          >
                            <Flex
                              bg='info'
                              m={2}
                              py={1}
                              px={2}
                              alignItems='flex-end'
                              flexDirection='column'
                              borderRadius='semi'
                              alignSelf={{ base: 'flex-end', md: 'center' }}
                            >
                              <Text
                                whiteSpace='normal'
                                fontWeight='semibold'
                                fontSize='md'
                                color='#fff'
                              >
                                {formatNumber(query.count)}
                                <Text
                                  as='span'
                                  fontSize='12px'
                                  color='inherit'
                                  ml={2}
                                >
                                  results
                                </Text>
                              </Text>
                            </Flex>
                            <Box>
                              <Text
                                className='hist-querystring'
                                fontSize='xs'
                                fontWeight='medium'
                                lineClamp={3}
                              >
                                {query.querystring}
                              </Text>
                            </Box>
                          </Flex>
                        </List.Item>
                      );
                    })}
                </List.Root>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Box>
    </>
  );
};
