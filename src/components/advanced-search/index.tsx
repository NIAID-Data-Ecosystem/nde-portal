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
  FlattenedItem,
  SortableWithCombine,
} from './components/SortableWithCombine';
import { convertObject2QueryString, wildcardQueryString } from './utils';
import { FaArrowsAltV, FaSearch, FaUndoAlt } from 'react-icons/fa';
import {
  AdvancedSearchFormContext,
  FieldSelect,
  SearchInput,
  SearchOption,
} from './components/Search';
import { SearchOptions } from './components/Search/components/SearchOptions';
import { ResultsCount } from './components/ResultsCount';
import SampleQueries from 'configs/sample-queries.json';
import { Disclaimer } from './components/Search/components/Disclaimer';

const sample_queries = SampleQueries as {
  name: string;
  items: FlattenedItem[];
}[];

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
    name: 'Field Contains',
    value: 'default',
    isDefault: true,
    description: '',
    options: [
      {
        name: 'Exact Match',
        value: 'exact',
        description: 'Contains the exact term or phrase.',
        type: 'text',
        example: `west siberian virus · contains the exact phrase 'west siberian virus'`,
        transformValue: (value: string) => `"${value}"`,
        isDefault: true,
      },
      {
        name: 'Contains',
        value: 'contains',
        type: 'text',
        description:
          'Field contains value that starts or ends with given term. Note that when given multiple terms, terms wil be searched for separately and not grouped together.',
        example: `oronaviru · contains results that contain the string fragment 'oronaviru' such as 'coronavirus'.
        immune dis · contains results that contain the string fragment 'immune' and 'dis' - though not always sequentially.
        `,
        transformValue: (value: string, field?: string) => {
          return wildcardQueryString({ value, field });
        },
        additionalInfo:
          'Querying for records containing phrase fragments can be slow. "Exact" matching yields quicker results.',
      },
      {
        name: 'Starts with',
        value: 'starts',
        description: 'Field contains value that starts with given term.',
        type: 'text',
        example: `covid · contains results beginning with 'covid' such as 'covid-19`,
        transformValue: (value: string, field?: string) => {
          return wildcardQueryString({ value, field, wildcard: 'end' });
        },
      },
      {
        name: 'Ends with',
        value: 'ends',
        type: 'text',
        description: 'Field contains value that ends with given term.',
        example: `osis · contains results ending with 'osis' such as 'tuberculosis'`,
        transformValue: (value: string, field?: string) => {
          return wildcardQueryString({ value, field, wildcard: 'start' });
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
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        isDisabled={items.length === 0}
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
                <Disclaimer />
              </AdvancedSearchFormContext>
            )}
          </Flex>

          <Heading size='sm' fontWeight='medium' mt={2}>
            Or choose from the sample queries below.
          </Heading>
          {sample_queries.map(query => {
            return (
              <Button
                key={query.name}
                mx={1}
                leftIcon={<FaSearch />}
                colorScheme='gray'
                color='text.body'
                size='sm'
                onClick={() => setItems(buildTree(query.items))}
              >
                {query.name}
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
