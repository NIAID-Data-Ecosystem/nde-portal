import React, { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa6';
import {
  Box,
  Button,
  ButtonGroup,
  ButtonGroupProps,
  ButtonProps,
  Icon,
  IconButton,
  IconButtonProps,
  ListItemProps,
  List,
} from '@chakra-ui/react';
import { UnionTypes } from 'src/components/advanced-search/types';

export interface DropdownButtonProps extends ButtonGroupProps {
  ariaLabel: string;
  type?: ButtonProps['type'];
  selectedOption: DropdownButtonProps['options'][number]['value'];
  setSelectedOption: (
    arg: DropdownButtonProps['options'][number]['value'],
  ) => void;
  options: {
    name: string;
    value: UnionTypes | '';
    props: ListItemProps;
  }[];
  iconButtonProps?: IconButtonProps;
  placeholder?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  ariaLabel,
  size,
  colorScheme = 'primary',
  isDisabled,
  type,
  selectedOption,
  setSelectedOption,
  placeholder,
  height,
  options,
  ...props
}) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  return (
    <Box onMouseLeave={() => setOptionsOpen(false)} height={height}>
      <ButtonGroup
        attached
        variant='solid'
        size={size}
        colorPalette={colorScheme}
        height={height}
        {...props}
      >
        <Button
          aria-label={ariaLabel}
          type={type}
          height={height}
          _focus={{ boxShadow: 'none' }}
          disabled={isDisabled}
        >
          {selectedOption || placeholder}
        </Button>
        {options.length > 0 && (
          <IconButton
            height={height}
            aria-label={ariaLabel}
            alignItems='center'
            onClick={() => setOptionsOpen(!optionsOpen)}
            onMouseEnter={() => setOptionsOpen(true)}
            bg={`${colorScheme}.400`}
            _hover={{
              bg: `${colorScheme}.600`,
            }}
            _focus={{ boxShadow: 'none' }}
            {...props.iconButtonProps}
          >
            <Icon asChild>
              <FaAngleDown />
            </Icon>
          </IconButton>
        )}
      </ButtonGroup>
      {/* Menu of options */}
      {optionsOpen && (
        <Box position='relative' w='100%'>
          <Box
            position='absolute'
            zIndex='popover'
            top={0}
            right={0}
            borderRadius='semi'
            overflow='hidden'
            boxShadow='base'
            bg='white'
            w='100%'
          >
            <List.Root as='ul' ml={0}>
              {options.map(option => {
                return (
                  <List.Item
                    key={option.value}
                    px={4}
                    py={1}
                    mt={0.5}
                    bg={`${colorScheme}.500`}
                    cursor='pointer'
                    color='white'
                    whiteSpace='nowrap'
                    userSelect='none'
                    _hover={{ bg: `${colorScheme}.400` }}
                    fontWeight='medium'
                    onClick={() => setSelectedOption(option.value)}
                    {...option.props}
                  >
                    {option.name}
                  </List.Item>
                );
              })}
            </List.Root>
          </Box>
        </Box>
      )}
    </Box>
  );
};
