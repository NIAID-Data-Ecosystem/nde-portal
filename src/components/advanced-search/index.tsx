import React, { useState } from 'react';
import {
  Flex,
  Select,
  Skeleton,
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
import { AddWithUnion, OpenModal, options } from './components/buttons';
import { uniqueId } from 'lodash';
import {
  DragItem,
  SortableWithCombine,
} from './components/SortableWithCombine';
import { convertObject2QueryString } from './utils';

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
  const [unionType, setUnionType] = useState<typeof options[number] | ''>('');
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
        <SortableWithCombine items={items} setItems={setItems} handle />
        {/* <QueryBuilderDragArea itemsList={items} updateItems={setItems} /> */}
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
            renderSubmitButton={props => {
              return (
                <AddWithUnion
                  unionType={unionType}
                  setUnionType={setUnionType}
                  {...props}
                ></AddWithUnion>
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
      </AdvancedSearchModal>
    </>
  );
};
