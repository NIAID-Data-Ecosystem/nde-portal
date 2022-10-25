import React, { useState } from 'react';
import {
  Flex,
  Select,
  Skeleton,
  TextProps,
  useDisclosure,
} from 'nde-design-system';
import { useQuery } from 'react-query';
import { ModalProps } from '@chakra-ui/react';
import { AdvancedSearchButton } from './components/Button';
import { AdvancedSearchModal } from './components/Modal';
import { fetchFields, FetchFieldsResponse } from 'src/utils/api';
import {
  SearchWithPredictiveText,
  usePredictiveSearch,
} from 'src/components/search-with-predictive-text';
import { QueryBuilderDragArea } from './components/QueryBuilderDragArea';
import { DragItem } from './components/DraggableItem';

interface AdvancedSearchProps {
  buttonProps?: TextProps;
  modalProps?: ModalProps;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  buttonProps,
  modalProps,
}) => {
  const { searchField, setSearchField } = usePredictiveSearch();

  // Handles the opening of the modal.
  // [TO DO]: remove isOpen:true after dev mode.
  const { isOpen, onOpen, onClose } = useDisclosure({ isOpen: true });
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

  return (
    <>
      <AdvancedSearchButton
        onClick={onOpen}
        {...buttonProps}
      ></AdvancedSearchButton>
      <AdvancedSearchModal isOpen={isOpen} onClose={onClose} {...modalProps}>
        <QueryBuilderDragArea itemsList={items} updateItems={setItems} />
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
           [] Add view raw query.
        */}

          <SearchWithPredictiveText
            ariaLabel='Search for datasets or tools'
            placeholder='Search for datasets or tools'
            size='md'
            field={searchField}
            // renderSubmitButton={}
            handleSubmit={(value, __, data) => {
              setItems(prev => {
                const newItems = [...prev];
                const id = value.split(' ').join('-');
                newItems.push({
                  id: `$${id}-${data?.id || items.length}`, // unique identifier
                  value,
                  field: searchField,
                });
                return newItems;
              });
            }}
          />
        </Flex>
      </AdvancedSearchModal>
    </>
  );
};
