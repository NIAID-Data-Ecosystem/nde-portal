import {
  Button,
  ButtonProps,
  Checkbox,
  CheckboxGroup,
  CheckboxRootProps,
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
import {
  DEFAULT_INPUT_SIZE,
  INPUT_HEIGHTS,
} from 'src/theme/recipes/input.recipe';

/*
Callers size the whole menu with a single input size so it lines up with the
search bar beside it, but the `checkbox` recipe's scale stops at `lg`. Map into
it here rather than widening the recipe: the checkbox is a menu item, not an
input, so it has no `2xs`/`xl`/`2xl` height to match.
*/
const CHECKBOX_SIZES: Record<
  keyof typeof INPUT_HEIGHTS,
  'xs' | 'sm' | 'md' | 'lg'
> = {
  '2xs': 'xs',
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
  '2xl': 'lg',
};

const isInputSize = (size: unknown): size is keyof typeof INPUT_HEIGHTS =>
  typeof size === 'string' && size in INPUT_HEIGHTS;

// `size` is a ConditionalValue, so responsive objects fall back to the default.
const getCheckboxSize = (size: InputProps['size']): CheckboxRootProps['size'] =>
  CHECKBOX_SIZES[isInputSize(size) ? size : DEFAULT_INPUT_SIZE];

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
  id,
  label,
  options,
  description,
  handleChange,
  selectedOptions,
  size = 'sm',
  buttonProps,
  showSelectAll,
  colorPalette = 'gray',
  ...rest
}: CheckboxMenuProps<T>) => {
  /*
  `gray.50` is #FDFDFD — all but white, so a highlight on the default palette
  reads as no highlight at all. Every other palette's `50` is a visible tint, so
  only gray steps down to `100`.
  */
  const highlightBg =
    colorPalette === 'gray' ? 'colorPalette.100' : 'colorPalette.50';

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
      <Menu.Root closeOnSelect={false} ids={{ content: id }}>
        <Menu.Trigger asChild>
          <Button
            colorPalette={colorPalette}
            size={size}
            variant='outline'
            justifyContent='space-between'
            {...buttonProps}
          >
            {buttonProps?.children || label}
            <Icon px={0.5}>
              <FaChevronDown />
            </Icon>
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <ScrollArea.Root
            overflow='visible'
            ids={{ viewport: id }}
            maxHeight='500px'
            maxWidth='300px'
            variant='always'
          >
            <ScrollArea.Viewport asChild>
              <Menu.Content>
                <Menu.Arrow />
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel>
                    {label}
                    {description && (
                      <Text
                        fontSize='sm'
                        fontStyle='italic'
                        fontWeight='normal'
                        lineHeight='moderate'
                        mt={1.5}
                      >
                        {description}
                      </Text>
                    )}
                  </Menu.ItemGroupLabel>
                  <Menu.Separator />

                  {showSelectAll && (
                    <Menu.Item
                      justifyContent='flex-end'
                      value='select-all-toggle'
                      _highlighted={{ bg: 'transparent' }}
                    >
                      <Button
                        size='2xs'
                        variant='ghost'
                        underline
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
                    </Menu.Item>
                  )}
                  <CheckboxGroup
                    colorPalette={colorPalette}
                    value={selectedOptions.map(item => item.value)}
                    gap={0.5}
                  >
                    {options.map(option => (
                      <Menu.Item
                        asChild
                        key={option.value}
                        value={option.value}
                        _highlighted={{ bg: highlightBg }}
                      >
                        <Checkbox.Root
                          size={getCheckboxSize(size)}
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
                <ScrollArea.Scrollbar>
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
