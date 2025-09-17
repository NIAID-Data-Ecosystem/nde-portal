import {
  Button,
  ButtonProps,
  Checkbox,
  CheckboxGroup,
  CloseButton,
  Flex,
  FlexProps,
  Icon,
  Popover,
  PopoverRootProps,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FaCaretDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

interface Option {
  name: string;
  value: string;
  [key: string]: any; // Allows other optional fields
}

export interface CheckboxListProps<T extends Option> extends FlexProps {
  buttonProps?: ButtonProps;
  description?: string;
  handleChange: (filters: T[]) => void;
  label: string | React.ReactNode;
  options: T[];
  selectedOptions: T[];
  size?: PopoverRootProps['size'];
  showSelectAll?: boolean;
}

export const CheckboxList = <T extends Option>({
  label,
  options,
  description,
  handleChange,
  selectedOptions,
  size = 'sm',
  buttonProps,
  showSelectAll,
  colorPalette = 'primary',
  ...rest
}: CheckboxListProps<T>) => {
  return (
    <Flex
      flex={{ base: 1, sm: 'unset' }}
      height={{ base: 'unset' }}
      zIndex='popover'
      alignItems='center'
      {...rest}
    >
      <Popover.Root size={size}>
        <Popover.Trigger asChild>
          <Button variant='outline' {...buttonProps}>
            {buttonProps?.children || label}
            <Icon as={FaCaretDown} />
          </Button>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Header border='1px solid' borderColor='gray.100'>
                <Popover.Title display='flex' justifyContent='space-between'>
                  <Text fontWeight='semibold' lineHeight='normal' my={1}>
                    {label}
                  </Text>
                  <Popover.CloseTrigger asChild>
                    <CloseButton size='2xs' colorPalette='gray' />
                  </Popover.CloseTrigger>
                </Popover.Title>
                {description && (
                  <Text
                    color='page.placeholder'
                    fontSize='sm'
                    fontStyle='italic'
                    fontWeight='normal'
                    lineHeight='short'
                    py={1.5}
                  >
                    {description}
                  </Text>
                )}
              </Popover.Header>
              <Popover.Body>
                {showSelectAll && (
                  <Flex justifyContent='flex-end'>
                    <Button
                      size='xs'
                      variant='link'
                      mb={1}
                      colorPalette={colorPalette}
                      onClick={() => {
                        if (selectedOptions.length === options.length) {
                          handleChange([]);
                        } else {
                          handleChange(options);
                        }
                      }}
                    >
                      {selectedOptions.length === options.length
                        ? 'Clear all'
                        : 'Select all'}
                    </Button>
                  </Flex>
                )}
                <ScrollContainer maxHeight='300px'>
                  <CheckboxGroup colorPalette={colorPalette}>
                    <Stack gap={1} direction='column'>
                      {options.map(option => (
                        <Checkbox.Root
                          key={option.value}
                          size={size}
                          p={1}
                          cursor='pointer'
                          checked={selectedOptions.some(
                            f =>
                              f.property === option.property &&
                              f.value === option.value,
                          )}
                          onCheckedChange={() => {
                            const newFilterItem = option;
                            // Check if filter is already selected
                            const index = selectedOptions.findIndex(
                              f =>
                                f.property === newFilterItem.property &&
                                f.value === newFilterItem.value,
                            );
                            if (index === -1) {
                              // Add new filter
                              return handleChange([
                                ...selectedOptions,
                                newFilterItem,
                              ]);
                            } else {
                              // Remove filter if it's already selected
                              return handleChange(
                                selectedOptions.filter((_, i) => i !== index),
                              );
                            }
                          }}
                          _hover={{ bg: 'colorPalette.50' }}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>{option.name}</Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </ScrollContainer>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Flex>
  );
};
