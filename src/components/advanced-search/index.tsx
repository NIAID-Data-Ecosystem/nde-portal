import React, { useState } from 'react';
import {
  Box,
  Flex,
  Select,
  Skeleton,
  TextProps,
  useDisclosure,
} from 'nde-design-system';
import { AdvancedSearchButton } from './components/Button';
import { AdvancedSearchModal } from './components/Modal';
import { SearchWithPredictiveText } from '../search-with-predictive-text';
import {
  fetchFields,
  FetchFieldsResponse,
  fetchSearchResults,
} from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { useQuery } from 'react-query';
import { encodeString } from 'src/utils/querystring-helpers';
import { ModalProps } from '@chakra-ui/react';

interface AdvancedSearchProps {
  buttonProps?: TextProps;
  modalProps?: ModalProps;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  buttonProps,
  modalProps,
}) => {
  const [results, setResults] = useState<FormattedResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('');

  // Handles the opening of the modal.
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Run query every time search term changes.
  const { isLoading: searchIsLoading, error: searchError } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    ['advanced-search', { term: searchTerm, facet: searchField }],
    () => {
      const queryString = encodeString(searchTerm);

      return fetchSearchResults({
        q: searchField ? `${searchField}:${queryString}` : `${queryString}`,
        size: 10,
        // return flattened version of data.
        dotfield: true,
        fields: ['name', '@type', searchField].join(','),
      });
    },

    // Don't refresh everytime window is touched, only run query if there's is a search term
    {
      refetchOnWindowFocus: false,
      enabled: searchTerm.length > 0,
      onSuccess: data => {
        // if results exist set state.
        if (data?.results) {
          setResults(data?.results);
        }
      },
    },
  );

  // Retrieve fields for select dropdown.
  const {
    isLoading,
    data: fields,
    error,
  } = useQuery<FetchFieldsResponse[] | undefined, Error>(
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
          <SearchWithPredictiveText
            queryFn={(term: string) => setSearchTerm(term)}
            results={results}
            selectedField={searchField}
          />
        </Flex>
      </AdvancedSearchModal>
    </>
  );
};
