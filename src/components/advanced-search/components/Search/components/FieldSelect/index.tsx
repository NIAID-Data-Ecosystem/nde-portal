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
import { formatPropertyInfo } from './utils';
import { OptionItem, OptionsList } from './components/Options';

interface FieldSelectProps {
  isDisabled: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FieldSelect: React.FC<FieldSelectProps> = ({
  size = 'md',
  isDisabled,
}) => {
  const { setSearchField } = useAdvancedSearchContext();
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
        type: string;
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
          .map(option => {
            return { ...option, ...formatPropertyInfo(option.property) };
          });
      },
    },
  );

  const options = useMemo(
    () =>
      fields?.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase()),
      ),
    [fields, inputValue],
  );

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
  };
  return (
    <Skeleton
      minW='150px'
      w={{ base: '100%', md: 'unset' }}
      ml={0}
      isLoaded={!isLoading}
    >
      <Box ref={ref}>
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
