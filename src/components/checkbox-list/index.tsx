import {
  Button,
  CheckboxGroup,
  Checkbox,
  Flex,
  Stack,
  Popover,
  Text,
  FlexProps,
  PopoverProps,
  ButtonProps,
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
  size?: PopoverProps['size'];
  showSelectAll?: boolean;
}

export const CheckboxList = <T extends Option>({
  label,
  options,
  description,
  handleChange,
  selectedOptions,
  size = 'md',
  buttonProps,
  showSelectAll,
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
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button
            colorPalette='gray'
            flex={1}
            fontWeight='medium'
            fontSize='inherit'
            lineHeight='shorter'
            size={size}
            px={4}
            variant='outline'
            justifyContent='space-between'
            {...buttonProps}
          >
            {buttonProps?.children || label}
            <FaCaretDown />
          </Button>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.CloseTrigger />
            <Popover.Title>
              <Text fontWeight='semibold' lineHeight='normal' my={1}>
                {label}
              </Text>
              {description && (
                <Text
                  color='gray.700'
                  fontSize='sm'
                  fontStyle='italic'
                  fontWeight='normal'
                  lineHeight='short'
                  mt={1.5}
                >
                  {description}
                </Text>
              )}
            </Popover.Title>
            <Popover.Body>
              {showSelectAll && (
                <Flex justifyContent='flex-end'>
                  <Button
                    size='xs'
                    variant='plain'
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
                <CheckboxGroup
                  colorPalette='blue'
                  value={selectedOptions.map(item => item.value)}
                >
                  <Stack gap={1} direction='column'>
                    {options.map(option => (
                      <Checkbox.Root
                        key={option.value}
                        value={option.value}
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
                        px={1}
                        lineHeight='tall'
                        alignItems='flex-start'
                        _hover={{ bg: 'niaid.50' }}
                        css={{
                          '& >.chakra-checkbox__control': {
                            mt: 1, // to keep checkbox in line with top of text for options with multiple lines
                          },
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label>
                          <Text fontSize='sm'>{option.name}</Text>
                        </Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </ScrollContainer>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </Flex>
  );
};
