import {
  Button,
  ButtonProps,
  Checkbox,
  CheckboxGroup,
  Flex,
  FlexProps,
  Icon,
  InputProps,
  Menu,
  ScrollArea,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FaChevronDown } from 'react-icons/fa6';

interface Option {
  name: string;
  value: string;
  [key: string]: any; // Allows other optional fields
}

export interface CheckboxMenuProps<T extends Option> extends FlexProps {
  buttonProps?: ButtonProps;
  description?: string;
  handleChange: (filters: T[]) => void;
  label: string | React.ReactNode;
  options: T[];
  selectedOptions: T[];
  size?: InputProps['size'];
  showSelectAll?: boolean;
  colorPalette?: ButtonProps['colorPalette'];
}

export const CheckboxMenu = <T extends Option>({
  label,
  options,
  description,
  handleChange,
  selectedOptions,
  size = 'md',
  buttonProps,
  showSelectAll,
  colorPalette = 'gray',
  ...rest
}: CheckboxMenuProps<T>) => {
  return (
    <Flex
      flex={{ base: 1, sm: 'unset' }}
      height={{ base: 'unset' }}
      zIndex='popover'
      alignItems='center'
      {...rest}
    >
      {/* Every item here is a checkbox, so toggling one must not dismiss the
          menu — the machine closes on select by default. */}
      <Menu.Root closeOnSelect={false}>
        <Menu.Trigger asChild>
          <Button
            colorPalette={colorPalette}
            size={size}
            variant='outline'
            justifyContent='space-between'
            {...buttonProps}
          >
            {buttonProps?.children || label}
            <Icon>
              <FaChevronDown />
            </Icon>
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <ScrollArea.Root
            overflow='visible'
            ids={{ viewport: 'label' }}
            maxWidth='300px'
          >
            <ScrollArea.Viewport asChild>
              <Menu.Content>
                <Menu.Arrow />
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel>
                    {label}
                    {description && (
                      <Text
                        color='fg.muted'
                        fontSize='sm'
                        fontStyle='italic'
                        fontWeight='normal'
                        lineHeight='short'
                        mt={1.5}
                      >
                        {description}
                      </Text>
                    )}
                  </Menu.ItemGroupLabel>
                  <Menu.Separator />

                  {showSelectAll && (
                    <Flex justifyContent='flex-end'>
                      <Button
                        size='xs'
                        variant='link'
                        onClick={() => {
                          if (selectedOptions.length === options.length) {
                            handleChange([]);
                          } else {
                            handleChange(options);
                          }
                        }}
                        colorPalette={colorPalette}
                      >
                        {selectedOptions.length === options.length
                          ? 'Clear all'
                          : 'Select all'}
                      </Button>
                    </Flex>
                  )}
                  <CheckboxGroup
                    colorPalette={colorPalette}
                    value={selectedOptions.map(item => item.value)}
                  >
                    {options.map(option => (
                      <Menu.Item
                        asChild
                        key={option.value}
                        value={option.value}
                        _highlighted={{ bg: 'colorPalette.100' }}
                      >
                        <Checkbox.Root
                          size='md'
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
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Label>{option.name}</Checkbox.Label>
                        </Checkbox.Root>
                      </Menu.Item>
                    ))}
                  </CheckboxGroup>
                </Menu.ItemGroup>
                <ScrollArea.Scrollbar bg='transparent'>
                  <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
              </Menu.Content>
            </ScrollArea.Viewport>
          </ScrollArea.Root>
        </Menu.Positioner>
      </Menu.Root>
    </Flex>
  );
};
