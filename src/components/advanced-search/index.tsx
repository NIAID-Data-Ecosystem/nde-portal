import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  ButtonProps,
  Collapse,
  Flex,
  Heading,
  Icon,
  ListItem,
  ModalProps,
  Text,
  UnorderedList,
  useDisclosure,
} from 'nde-design-system';
import { useRouter } from 'next/router';
import { AdvancedSearchModal } from './components/Modal';
import { AdvancedSearchOpen } from './components/buttons';
import {
  buildTree,
  TreeItem,
  FlattenedItem,
  SortableWithCombine,
} from './components/SortableWithCombine';
import {
  convertObject2QueryString,
  convertQueryString2Object,
} from './utils/query-helpers';
import {
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaEyeSlash,
  FaHistory,
  FaUndoAlt,
} from 'react-icons/fa';
import { AdvancedSearchFormContext, Search } from './components/Search';
import { ResultsCount } from './components/ResultsCount';
import SampleQueriesData from 'configs/sample-queries.json';
import { EditableQueryText } from './components/EditableQueryText';
import { SEARCH_TYPES_CONFIG } from './components/Search/search-types-config';
import {
  QueryStringError,
  removeDuplicateErrors,
} from './utils/validation-checks';
import { validateQueryString } from './components/EditableQueryText/utils';
import { useLocalStorage } from 'usehooks-ts';
import { formatNumber } from 'src/utils/helpers';
import { ErrorBanner } from '../error/ErrorBanner';

interface AdvancedSearchProps {
  colorScheme?: string;
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
  colorScheme = 'primary',
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

  const { isOpen: showRawQuery, onToggle: toggleShowRawQuery } = useDisclosure({
    defaultIsOpen: true,
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
        query: { q: `${querystring}`, advancedSearch: true },
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
      <Box w='100%' p={2}>
        <Heading size='sm' fontWeight='medium'>
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
              colorScheme='gray'
              color='text.body'
              size='sm'
              onClick={() => setItems(buildTree(query.items))}
            >
              <Text isTruncated>{query.name}</Text>
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
            color={items.length ? 'text.heading' : 'gray.600'}
          >
            Query Builder
          </Heading>
          <Button
            colorScheme='primary'
            size='sm'
            leftIcon={<FaUndoAlt />}
            variant='outline'
            isDisabled={!items.length}
            onClick={() => {
              setItems([]);
              setResetForm(true);
            }}
            ml={4}
          >
            Clear query
          </Button>
        </Flex>
        <Text color={items.length ? 'text.body' : 'gray.600'} fontSize='sm'>
          Re-order query terms by click and drag. Group items together by
          dragging an element over another.
        </Text>
        <ResultsCount
          queryString={convertObject2QueryString(items)}
          handleErrors={handleErrors}
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
          <Collapse in={showRawQuery}>
            <Box my={2}>
              <EditableQueryText
                queryObj={items}
                updateQueryObj={updateItems}
                errors={errors}
                setErrors={setErrors}
              />
            </Box>
          </Collapse>

          <Button
            isDisabled={items.length === 0}
            rightIcon={showRawQuery ? <FaChevronUp /> : <FaChevronDown />}
            onClick={toggleShowRawQuery}
            colorScheme='gray'
            color='text.body'
            size='sm'
            mt={2}
            leftIcon={
              showRawQuery ? <Icon as={FaEyeSlash} /> : <Icon as={FaEye} />
            }
          >
            {showRawQuery ? 'hide' : 'view'} raw query
          </Button>
        </Box>

        <ErrorBanner errors={errors} setErrors={setErrors} />
        <Flex my={4} justifyContent='flex-end'>
          {renderButtonGroup && renderButtonGroup({ colorScheme })}
          {handleSubmit && (
            <Button
              colorScheme={colorScheme}
              onClick={handleSubmit}
              isDisabled={
                items.length === 0 ||
                errors.filter(({ type }) => type == 'error').length > 0
              }
              size='md'
            >
              Submit
            </Button>
          )}
        </Flex>
        <Accordion my={4} defaultIndex={[0]} allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton
                _hover={{ bg: 'transparent' }}
                _focus={{ boxShadow: 'none' }}
              >
                <Text
                  size='sm'
                  fontWeight='semibold'
                  color='text.heading'
                  display='flex'
                  alignItems='center'
                  flex={1}
                >
                  <Icon as={FaHistory} mx={2} color='status.info'></Icon>
                  Search History
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel px={[1, 4]}>
              <UnorderedList ml={0}>
                {isMounted &&
                  searchHistory.length > 0 &&
                  searchHistory.reverse().map((query, index) => {
                    return (
                      <ListItem
                        key={index}
                        onClick={() => {
                          setItems(
                            convertQueryString2Object(query.querystring),
                          );
                        }}
                        _hover={{
                          cursor: 'pointer',
                          ['.hist-querystring']: {
                            textDecoration: 'underline',
                          },
                        }}
                        bg='status.info'
                        borderRadius='semi'
                        my={0.5}
                      >
                        <Flex
                          className='hist-row'
                          bg={index % 2 ? 'whiteAlpha.800' : 'whiteAlpha.900'}
                          flexDirection={{ base: 'column', md: 'row-reverse' }}
                          alignItems={{ base: 'flex-start', md: 'center' }}
                          justifyContent={{ base: 'space-between' }}
                          px={2}
                        >
                          <Flex
                            bg='status.info'
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
                              noOfLines={3}
                            >
                              {query.querystring}
                            </Text>
                          </Box>
                        </Flex>
                      </ListItem>
                    );
                  })}
              </UnorderedList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </>
  );
};

interface AdvancedSearchPropsWithModal extends AdvancedSearchProps {
  buttonProps?: ButtonProps;
  modalProps?: ModalProps;
}

export const AdvancedSearchWithModal: React.FC<
  AdvancedSearchPropsWithModal
> = ({ buttonProps, modalProps, ...props }) => {
  // Handles the opening of the modal.
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <AdvancedSearchOpen onClick={onOpen} {...buttonProps} />

      <AdvancedSearchModal
        isOpen={isOpen}
        handleClose={onClose}
        {...modalProps}
      >
        {isOpen && (
          <AdvancedSearch
            onValidSubmit={onClose}
            renderButtonGroup={(props: any) => (
              <Button
                {...props}
                mr={3}
                onClick={onClose}
                variant='outline'
                size='md'
              >
                Close
              </Button>
            )}
            {...props}
          />
        )}
      </AdvancedSearchModal>
    </>
  );
};
