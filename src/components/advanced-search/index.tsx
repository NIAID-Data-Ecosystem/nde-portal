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
import { convertObject2QueryString } from './utils/query-helpers';
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaUndoAlt,
} from 'react-icons/fa';
import { AdvancedSearchFormContext, Search } from './components/Search';
import { ResultsCount } from './components/ResultsCount';
import SampleQueries from 'configs/sample-queries.json';
import { EditableQueryText } from './components/EditableQueryText';
import { ErrorMessages } from './components/ErrorMessages';
import { SEARCH_TYPES_CONFIG } from './components/Search/search-types-config';
import { QueryStringError } from './utils/validation-checks';

interface AdvancedSearchProps {
  buttonProps?: ButtonProps;
  modalProps?: ModalProps;
}

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
              <AdvancedSearchFormContext
                searchTypeOptions={SEARCH_TYPES_CONFIG}
              >
                <Search
                  items={items}
                  setItems={updateItems}
                  resetForm={resetForm}
                  setResetForm={setResetForm}
                />
              </AdvancedSearchFormContext>
            )}
          </Flex>

          <Heading size='sm' fontWeight='medium' mb={2}>
            Or choose from the sample queries below.
          </Heading>
          {sample_queries.map(query => {
            return (
              <Button
                key={query.name}
                mx={1}
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
            <ResultsCount queryString={convertObject2QueryString(items)} />
          </Text>

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
