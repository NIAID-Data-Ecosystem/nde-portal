import React from 'react';
import { FaClockRotateLeft } from 'react-icons/fa6';
import {
  Button,
  Divider,
  Flex,
  Icon,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  DropdownInput,
  DropdownInputProps,
  useDropdownContext,
} from '../../input-with-dropdown';

export const SearchInput = (inputProps: DropdownInputProps) => {
  const { isOpen, setIsOpen } = useDropdownContext();
  return (
    <DropdownInput
      {...inputProps}
      onClose={() => {
        setIsOpen(false);
      }}
      renderSubmitButton={() => {
        return (
          <>
            <Button
              colorScheme={inputProps.colorScheme}
              aria-label={inputProps.ariaLabel}
              size={inputProps.size}
              type='submit'
              display={{ base: 'none', md: 'flex' }}
            >
              Search
            </Button>
            <Divider orientation='vertical' borderColor='gray.200' m={1} />

            <Tooltip label='Toggle search history.'>
              <IconButton
                variant='ghost'
                size={inputProps.size}
                aria-label='Toggle search history.'
                icon={
                  <Flex px={2}>
                    <Icon as={FaClockRotateLeft} />
                  </Flex>
                }
                onClick={() => setIsOpen(!isOpen)}
              />
            </Tooltip>
          </>
        );
      }}
    />
  );
};
