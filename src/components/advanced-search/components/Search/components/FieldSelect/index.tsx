import React, { useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
} from 'nde-design-system';
import { fetchFields, FetchFieldsResponse } from 'src/utils/api';
import { useDisclosure, useOutsideClick } from '@chakra-ui/react';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { FaChevronDown } from 'react-icons/fa';
import { getPropertyInConfig } from 'src/utils/metadata-schema';
import { OptionItem, OptionsList } from './components/Options';
import MetadataConfig from 'configs/resource-metadata.json';
import { getMetadataNameByProperty } from 'src/components/advanced-search/utils';

interface FieldSelectProps {
  isDisabled: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FieldSelect: React.FC<FieldSelectProps> = ({
  size = 'md',
  isDisabled,
}) => {
  const { searchInputType, setSearchField, setSearchInputType } =
    useAdvancedSearchContext();
  const [inputValue, setInputValue] = useState('');
  const { isOpen, onToggle, onClose, onOpen } = useDisclosure();

  // Retrieve fields for select dropdown.

  const { isLoading, data: fields } = useQuery<
    FetchFieldsResponse[] | undefined,
    Error,
    | {
        description: string;
        name: string;
        property: string;
        type?: string;
      }[]
    | undefined
  >(
    ['metadata-fields'],
    () => {
      return fetchFields();
    },

    {
      refetchOnWindowFocus: false,
      enabled: !isDisabled, // Run query if not disabled
      select(data) {
        // remove fields that are not searchable (i.e. objects)
        return data
          ?.filter(field => {
            if (
              field.type === 'object' ||
              (field.property.includes('@') && field.property !== '@type')
            ) {
              return false;
            }
            return true;
          })
          .map(field => {
            const fieldInformation = getPropertyInConfig(
              field.property,
              MetadataConfig,
            );
            const name =
              fieldInformation?.title ||
              getMetadataNameByProperty(field.property);
            let description =
              fieldInformation?.abstract || fieldInformation?.description || '';
            if (typeof description === 'object') {
              description = Object.values(description).join(' or ');
            }
            return {
              name,
              description,
              property: field.property,
            };
          });
      },
    },
  );

  // Filter the options based on user input
  const options = useMemo(
    () =>
      fields?.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [fields, inputValue],
  );

  // Handles when the user clicks outside the select dropdown.
  const ref = useRef(null);
  useOutsideClick({
    ref: ref,
    handler: () => {
      // if the input value doesn't match one of the options we use the default state to prevent user from choosing a non existing field.
      if (
        !options?.length ||
        !options?.find(option => option.name === inputValue)
      ) {
        resetState();
      }
      onClose();
    },
  });

  const resetState = () => {
    setInputValue('');
    setSearchField('');
    setSearchInputType('text');
  };

  // // Based on the user's selection we want to update the input to reflect the type of input (ex. date type of input for date field selection)
  // const handleSearchType = (type: string) => {
  //   let inputType: 'number' | 'boolean' | 'text' | 'date' | 'enum' = 'text';
  //   if (type === 'keyword' || type === 'text') {
  //     inputType = 'text';
  //   } else if (
  //     type === 'unsigned_long' ||
  //     type === 'double' ||
  //     type === 'integer' ||
  //     type === 'float'
  //   ) {
  //     inputType = 'number';
  //   } else if (type === 'date') {
  //     inputType = 'date';
  //   } else if (type === 'boolean') {
  //     inputType = 'enum';
  //   } else {
  //     inputType = 'text';
  //   }

  //   if (inputType !== searchInputType) {
  //     setSearchInputType(inputType);
  //   }
  // };

  return (
    <Skeleton
      minW='300px'
      w={{ base: '100%', md: 'unset' }}
      ml={0}
      isLoaded={!isLoading}
    >
      <Box ref={ref} position='relative' mr={1}>
        {options ? (
          <>
            <InputGroup size={size}>
              <Input
                placeholder='All Fields'
                value={inputValue}
                onChange={e => setInputValue(e.currentTarget.value)}
                onClick={onOpen} // open dropdown options when clicking in input box.
              />
              <InputRightElement p={1} w='unset'>
                <IconButton
                  onClick={() => {
                    if (!isOpen) {
                      setInputValue('');
                    }
                    // toggle open dropdown options.
                    onToggle();
                  }}
                  variant='ghost'
                  colorScheme='primary'
                  size={size}
                  aria-label='Show field options'
                  icon={<FaChevronDown />}
                />
              </InputRightElement>
            </InputGroup>

            {isOpen && (
              <OptionsList>
                {options.map(option => {
                  return (
                    <OptionItem
                      key={option.property}
                      name={option.name}
                      description={option.description}
                      onClick={() => {
                        setSearchField(option.property);
                        setInputValue(option.name);
                        // option.type && handleSearchType(option.type);
                        onClose();
                      }}
                    />
                  );
                })}
              </OptionsList>
            )}
          </>
        ) : (
          <></>
        )}
      </Box>
    </Skeleton>
  );
};
