import React from 'react';
import {
  Flex,
  Select,
  Skeleton,
  TextProps,
  useDisclosure,
} from 'nde-design-system';
import { AdvancedSearchButton } from './components/Button';
import { AdvancedSearchModal } from './components/Modal';
import { SearchWithPredictiveText } from '../search-with-predictive-text';
import { fetchFields, FetchFieldsResponse } from 'src/utils/api';
import { useQuery } from 'react-query';
import { ModalProps } from '@chakra-ui/react';
import { usePredictiveSearch } from './usePredictiveSearch';

interface AdvancedSearchProps {
  buttonProps?: TextProps;
  modalProps?: ModalProps;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  buttonProps,
  modalProps,
}) => {
  const { results, searchField, setSearchTerm, setSearchField } =
    usePredictiveSearch();

  // Handles the opening of the modal.
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  return (
    <>
      <AdvancedSearchButton
        onClick={onOpen}
        {...buttonProps}
      ></AdvancedSearchButton>
      <AdvancedSearchModal isOpen={isOpen} onClose={onClose} {...modalProps}>
        <Flex
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems={{ base: 'flex-start', md: 'center' }}
        >
          {/* Select a field to search query term or leave as a general query */}
          <Skeleton
            minW='150px'
            w={{ base: '100%', md: 'unset' }}
            m={2}
            ml={0}
            isLoaded={!isLoading}
          >
            <Select
              size='sm'
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
          {/* <SearchWithPredictiveText
            queryFn={(term: string) => setSearchTerm(term)}
            results={results}
            selectedField={searchField}
          /> */}
        </Flex>
      </AdvancedSearchModal>
    </>
  );
};
