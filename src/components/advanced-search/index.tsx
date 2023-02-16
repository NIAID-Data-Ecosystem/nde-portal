import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Collapse,
  Flex,
  Heading,
  Text,
  useDisclosure,
} from 'nde-design-system';
import { useRouter } from 'next/router';
import { ModalProps } from '@chakra-ui/react';
import { AdvancedSearchModal } from './components/Modal';
import { OpenModal } from './components/buttons';
import { uniqueId } from 'lodash';
import {
  buildTree,
  TreeItem,
  FlattenedItem,
  SortableWithCombine,
} from './components/SortableWithCombine';
import { convertObject2QueryString, wildcardQueryString } from './utils';
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaUndoAlt,
} from 'react-icons/fa';
import {
  AdvancedSearchFormContext,
  FieldSelect,
  Search,
  SearchInput,
  SearchOption,
} from './components/Search';
import { SearchOptions } from './components/Search/components/SearchOptions';
import { ResultsCount } from './components/ResultsCount';
import SampleQueries from 'configs/sample-queries.json';
import { EditableQueryText } from './components/EditableQueryText';
import { Disclaimer } from './components/Search/components/Disclaimer';
import { ErrorMessages } from './components/ErrorMessages';
import { QueryStringError } from './components/EditableQueryText/utils';

interface AdvancedSearchProps {
  buttonProps?: ButtonProps;
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
  const sample_queries = SampleQueries as {
    name: string;
    items: FlattenedItem[];
  }[];
  const router = useRouter();
  const [resetForm, setResetForm] = useState(false);

  // Handles the opening of the modal.
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: showRawQuery, onToggle: toggleShowRawQuery } = useDisclosure({
    defaultIsOpen: true,
  });
  const [items, setItems] = useState<TreeItem[]>([]);

  // Errors with either the query string or the query string's output.
  const [errors, setErrors] = useState<QueryStringError[]>([]);

  useEffect(() => {
    if (items.length > 0 && resetForm === true) {
      setResetForm(false);
    }
  }, [items, resetForm]);

  const updateItems = useCallback(items => setItems(items), []);

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
              <Search
                items={items}
                setItems={updateItems}
                resetForm={resetForm}
                setResetForm={setResetForm}
              />
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
            setItems={updateItems}
            removable
            collapsible
          />

          <ErrorMessages errors={errors} setErrors={setErrors} />

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
            >
              view string query
            </Button>
          </Box>
        </Box>
      </AdvancedSearchModal>
    </>
  );
};
