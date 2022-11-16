import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  Select,
  Skeleton,
  Text,
  TextProps,
  useDisclosure,
} from 'nde-design-system';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { ModalProps } from '@chakra-ui/react';
import { AdvancedSearchModal } from './components/Modal';
import { fetchFields, FetchFieldsResponse } from 'src/utils/api';
import {
  SearchWithPredictiveText,
  usePredictiveSearch,
} from 'src/components/search-with-predictive-text';
import { OpenModal } from './components/buttons';
import { uniqueId } from 'lodash';
import {
  buildTree,
  DragItem,
  SortableWithCombine,
} from './components/SortableWithCombine';
import {
  convertObject2QueryString,
  getUnionTheme,
  unionOptions,
} from './utils';
import { FaArrowsAltV, FaSearch } from 'react-icons/fa';
import { DropdownButton } from '../dropdown-button';

interface AdvancedSearchProps {
  buttonProps?: TextProps;
  modalProps?: ModalProps;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  buttonProps,
  modalProps,
}) => {
  const router = useRouter();
  const { searchField, setSearchField } = usePredictiveSearch();

  // Handles the opening of the modal.
  // [TO DO]: remove {isOpen:true} after dev mode.
  const { isOpen, onOpen, onClose } = useDisclosure({ isOpen: true });
  const { isOpen: showRawQuery, onToggle: toggleShowRawQuery } = useDisclosure({
    defaultIsOpen: false,
  });
  const [items, setItems] = useState<DragItem[]>([]);

  // Retrieve fields for select dropdown.
  const { isLoading, data: fields } = useQuery<
    FetchFieldsResponse[] | undefined,
    Error
  >(
    ['metadata-fields'],
    () => {
      return fetchFields();
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!isOpen, // Run query when modal is open.
    },
  );
  const [unionType, setUnionType] = useState<typeof unionOptions[number] | ''>(
    '',
  );

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
            query: { q: querystring, advancedSearch: true },
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
            alignItems={{ base: 'flex-start', md: 'center' }}
          >
            {/* Select a field to search query term or leave as a general query */}
            <Skeleton
              minW='150px'
              w={{ base: '100%', md: 'unset' }}
              ml={0}
              isLoaded={!isLoading}
            >
              <Select
                size='lg'
                placeholder='All Fields'
                variant='filled'
                value={searchField}
                onChange={e => {
                  const { value } = e.currentTarget;
                  setSearchField(value);
                }}
              >
                {fields?.map(field => {
                  return (
                    <option key={field.property} value={field.property}>
                      {field.property}
                    </option>
                  );
                })}
              </Select>
            </Skeleton>
            {/* Input field with suggestions matching the search term. */}

            {/*
        [TO DO]:
           [] Add union type submit.
        */}

            <SearchWithPredictiveText
              ariaLabel='Search for datasets or tools'
              placeholder='Search for datasets or tools'
              size='md'
              field={searchField}
              renderSubmitButton={props => {
                return (
                  <DropdownButton
                    placeholder='Add'
                    selectedOption={unionType}
                    setSelectedOption={setUnionType}
                    options={unionOptions.map(term => {
                      return {
                        name: `Add with ${term}`,
                        value: term,
                        props: { ...getUnionTheme(term) },
                      };
                    })}
                    {...props}
                    colorScheme={
                      unionType
                        ? getUnionTheme(unionType).colorScheme
                        : 'primary'
                    }
                  />
                );
              }}
              handleSubmit={(term, __, data) => {
                // if no union type is selected, default to "AND"
                const union = unionType || undefined;
                !unionType && setUnionType(union || 'AND');
                setItems(prev => {
                  if (!term) return prev;
                  const newItems = [...prev];
                  const id = `${uniqueId(`${term}-${items.length}-`)}`;

                  newItems.push({
                    id, // unique identifier
                    value: {
                      field: searchField,
                      term,
                      union,
                    },
                    children: [],
                  });

                  return newItems;
                });
              }}
            />
          </Flex>
          <Heading size='sm' fontWeight='medium' mt={2}>
            Or choose from the sample queries below.
          </Heading>
          <Button
            leftIcon={<FaSearch />}
            onClick={() =>
              setItems(
                buildTree([
                  {
                    id: `${uniqueId('West Siberian virus')}`,
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
          <Heading
            size='sm'
            fontWeight='medium'
            color={items.length ? 'text.heading' : 'gray.600'}
          >
            Query Builder
          </Heading>
          <Text color={items.length ? 'text.body' : 'gray.600'} fontSize='sm'>
            Re-order query terms by click and drag. Group items together by
            dragging a element over another.
          </Text>

          <Box bg='gray.100'>
            <SortableWithCombine items={items} setItems={setItems} handle />
            {/* <QueryBuilderDragArea itemsList={items} updateItems={setItems} /> */}
          </Box>

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
          >
            view string query
          </Button>
        </Box>
      </AdvancedSearchModal>
    </>
  );
};
