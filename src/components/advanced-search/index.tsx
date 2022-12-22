import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  Text,
  TextProps,
  useDisclosure,
} from 'nde-design-system';
import { useRouter } from 'next/router';
import { ModalProps } from '@chakra-ui/react';
import { AdvancedSearchModal } from './components/Modal';
import { OpenModal } from './components/buttons';
import { uniqueId } from 'lodash';
import {
  buildTree,
  DragItem,
  SortableWithCombine,
} from './components/SortableWithCombine';
import { convertObject2QueryString } from './utils';
import { FaArrowsAltV, FaSearch, FaUndoAlt } from 'react-icons/fa';
import {
  AdvancedSearchFormContext,
  FieldSelect,
  SearchInput,
  SearchOption,
} from './components/Search';
import { SearchOptions } from './components/Search/components/SearchOptions';
import { ResultsCount } from './components/ResultsCount';
import { encodeString } from 'src/utils/querystring-helpers';

interface AdvancedSearchProps {
  buttonProps?: TextProps;
  modalProps?: ModalProps;
}

export const SEARCH_OPTIONS: SearchOption[] = [
  {
    name: 'Field exists',
    value: '_exists_',
    description: 'Matches where selected field contains any value.',
  },
  {
    name: "Field doesn't exist",
    value: '-_exists_',
    description: 'Matches where selected field is left blank.',
  },
  {
    name: '',
    value: '',
    description: '',
    options: [
      {
        name: 'Contains',
        value: 'default',
        type: 'text',
        description:
          'Field contains value that starts or ends with given term. Note that when given multiple terms, terms wil be searched for separately and not grouped together.',
        example: `oronaviru · contains results that contain the string fragment 'oronaviru' such as 'coronavirus'.
        immune dis · contains results that contain the string fragment 'immune' and 'dis' - though not always sequentially.
        `,
        transformValue: (value: string, field?: string) => {
          const searchTerms = value.trim().split(' ');
          if (!value) {
            return '';
          }
          const querystring = `${searchTerms
            .map(str => (str ? `*${str}*` : ''))
            .join(' AND ')}`;
          // if (!field && searchTerms.length === 1) {
          //   return querystring;
          // }
          return encodeString(querystring);
        },
      },
      // {
      //   name: 'Contains',
      //   value: 'default',
      //   description: 'Contains all these words in any order.',
      //   example: `mycobacterium tuberculosis · contains both
      //   'mycobacterium' and 'tuberculosis'`,
      //   transformValue: (value: string, field?: string) => {
      //     const searchTerms = value.trim().split(' ');
      //     if (!value) {
      //       return '';
      //     }
      //     const querystring = `${searchTerms.join(' AND ')}`;
      //     // if (!field && searchTerms.length === 1) {
      //     //   // [NOTE]: consider wrapping this in quotes as the default behaviour of the API is to append a wildcard to the querystring : querystring*
      //     // }
      //     return encodeString(querystring);
      //     // return `${querystring}`;
      //   },
      // },
      {
        name: 'Exact Match',
        value: 'exact',
        description: 'Contains the exact term or phrase.',
        type: 'text',
        example: `west siberian virus · contains the exact phrase 'west siberian virus'`,
        transformValue: (value: string) => `"${value}"`,
      },
      {
        name: 'Starts with',
        value: 'starts',
        description: 'Field contains value that starts with given term.',
        type: 'text',
        example: `covid · contains results beginning with 'covid' such as 'covid-19`,
        transformValue: (value: string, field?: string) => {
          const searchTerms = value.trim().split(' ');
          if (!value) {
            return '';
          }
          const querystring = `${searchTerms
            .map(str => (str ? `${str}*` : ''))
            .join(' AND ')}`;
          // if (!field && searchTerms.length === 1) {
          //   return querystring;
          // }
          return encodeString(querystring);
        },
      },
      {
        name: 'Ends with',
        value: 'ends',
        type: 'text',
        description: 'Field contains value that ends with given term.',
        example: `osis · contains results ending with 'osis' such as 'tuberculosis'`,
        transformValue: (value: string, field?: string) => {
          const searchTerms = value.trim().split(' ');
          if (!value) {
            return '';
          }
          const querystring = `${searchTerms
            .map(str => (str ? `*${str}` : ''))
            .join(' AND ')}`;
          // if (!field && searchTerms.length === 1) {
          //   return querystring;
          // }
          return encodeString(querystring);
        },
      },
    ],
  },
];
export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  buttonProps,
  modalProps,
}) => {
  const router = useRouter();
  const [resetForm, setResetForm] = useState(false);

  // Handles the opening of the modal.
  const { isOpen, onOpen, onClose } = useDisclosure({ isOpen: true });
  const { isOpen: showRawQuery, onToggle: toggleShowRawQuery } = useDisclosure({
    defaultIsOpen: false,
  });
  const [items, setItems] = useState<DragItem[]>([]);

  useEffect(() => {
    if (items.length > 0 && resetForm === true) {
      setResetForm(false);
    }
  }, [items, resetForm]);

  return (
    <>
      <OpenModal onClick={onOpen} {...buttonProps}></OpenModal>
      <AdvancedSearchModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={e => {
          const querystring = convertObject2QueryString(items);
          router.push({
            pathname: `/search`,
            query: { q: `${querystring}`, advancedSearch: true },
          });
        }}
        {...modalProps}
      >
        {/* Search For Query Term */}
        <Box m={2}>
          <Heading size='sm' fontWeight='medium'>
            Add terms to the query builder.
          </Heading>
          <Flex
            flexDirection={{ base: 'column', md: 'row' }}
            alignItems={{ base: 'flex-start', md: 'flex-end' }}
            flexWrap='wrap'
          >
            {isOpen && (
              <AdvancedSearchFormContext
                term=''
                field=''
                searchOptions={SEARCH_OPTIONS}
              >
                <Flex w='100%' justifyContent='flex-end'>
                  <SearchOptions />
                </Flex>
                <Flex w='100%' alignItems='flex-end'>
                  <FieldSelect
                    isDisabled={!isOpen}
                    isFormReset={resetForm}
                    setResetForm={setResetForm}
                  ></FieldSelect>
                  <SearchInput
                    size='md'
                    colorScheme='primary'
                    items={items}
                    isFormReset={resetForm}
                    setResetForm={setResetForm}
                    onSubmit={({
                      term,
                      field,
                      union,
                      querystring,
                      searchType,
                    }) => {
                      setItems(prev => {
                        if (!term) return prev;
                        const newItems = [...prev];
                        const id = `${uniqueId(
                          `${term.slice(0, 20).split(' ').join('-')}-${
                            items.length
                          }-`,
                        )}`;

                        newItems.push({
                          id, // unique identifier
                          value: {
                            field,
                            term,
                            union,
                            querystring,
                            searchType,
                          },
                          children: [],
                          index: items.length,
                        });

                        return newItems;
                      });
                    }}
                  />
                </Flex>
              </AdvancedSearchFormContext>
            )}
          </Flex>

          <Heading size='sm' fontWeight='medium' mt={2}>
            Or choose from the sample queries below.
          </Heading>
          <Button
            leftIcon={<FaSearch />}
            onClick={() =>
              setItems(
                // [TO DO]: create transform string to query object function.
                buildTree([
                  {
                    id: 'West Siberian virus'.split(' ').join('-'),
                    children: [],
                    value: { term: 'West Siberian virus' },
                    parentId: null,
                    index: 0,
                    depth: 0,
                  },
                  {
                    id: 'Tickborne-encephalitis-OR-Tick-borne-encephalitis-AND-Siberian-subtype',
                    children: [],
                    value: {
                      term: 'Tickborne-encephalitis-OR-Tick-borne-encephalitis-AND-Siberian-subtype',
                      union: 'OR',
                    },
                    parentId: null,
                    index: 1,
                    depth: 0,
                  },
                  {
                    id: 'Tickborne-encephalitis-OR-Tick-borne-encephalitis',
                    children: [],
                    value: {
                      term: 'Tickborne-encephalitis-OR-Tick-borne-encephalitis',
                    },
                    parentId:
                      'Tickborne-encephalitis-OR-Tick-borne-encephalitis-AND-Siberian-subtype',
                    index: 0,
                    depth: 1,
                  },
                  {
                    id: 'Tickborne-encephalitis',
                    children: [],
                    value: { term: 'Tickborne encephalitis' },
                    parentId:
                      'Tickborne-encephalitis-OR-Tick-borne-encephalitis',
                    index: 0,
                    depth: 2,
                  },
                  {
                    id: 'Tick-borne-encephalitis',
                    children: [],
                    value: {
                      term: 'Tick-borne encephalitis',
                      union: 'OR',
                    },
                    parentId:
                      'Tickborne-encephalitis-OR-Tick-borne-encephalitis',
                    index: 1,
                    depth: 2,
                  },
                  {
                    id: 'Siberian-subtype',
                    children: [],
                    value: {
                      term: 'Siberian subtype',
                      union: 'AND',
                    },
                    parentId:
                      'Tickborne-encephalitis-OR-Tick-borne-encephalitis-AND-Siberian-subtype',
                    index: 1,
                    depth: 1,
                  },
                ]),
              )
            }
            colorScheme='gray'
            color='text.body'
            size='sm'
          >
            Tickborne encephalitis, West Siberian subtype
          </Button>
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
              variant='ghost'
              isDisabled={!items.length}
              onClick={() => {
                setItems([]);
                setResetForm(true);
              }}
              ml={4}
            >
              Reset query
            </Button>
          </Flex>
          <Text color={items.length ? 'text.body' : 'gray.600'} fontSize='sm'>
            Re-order query terms by click and drag. Group items together by
            dragging an element over another.
          </Text>
          <ResultsCount queryString={convertObject2QueryString(items)} />

          <SortableWithCombine
            items={items}
            setItems={setItems}
            handle
            removable
          />

          <Box w='100%'>
            <Collapse in={showRawQuery}>
              {/* [TO DO]: add syntax highlighting on hover */}
              <Box m={2}>
                <Text fontSize='sm' fontStyle='italic'>
                  {convertObject2QueryString(items)}
                </Text>
              </Box>
            </Collapse>

            <Button
              isDisabled={items.length === 0}
              rightIcon={<FaArrowsAltV />}
              onClick={toggleShowRawQuery}
              colorScheme='gray'
              color='text.body'
              size='sm'
              mt={2}
            >
              view string query
            </Button>
          </Box>
        </Box>
      </AdvancedSearchModal>
    </>
  );
};
