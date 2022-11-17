import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import {
  Box,
  Button,
  ButtonGroup,
  ButtonGroupProps,
  ButtonProps,
  Icon,
  IconButton,
  IconButtonProps,
  ListItem,
  UnorderedList,
} from 'nde-design-system';
import { ListItemProps } from '@chakra-ui/react';

export interface DropdownButton extends ButtonGroupProps {
  ariaLabel: string;
  type: ButtonProps['type'];
  selectedOption: string;
  setSelectedOption: (arg: DropdownButton['selectedOption']) => void;
  options: {
    name: string;
    value: string;
    props: Omit<ListItemProps, 'textUnderlineOffset'>;
  }[];
  iconButtonProps?: IconButtonProps;
}

export const DropdownButton: React.FC<DropdownButton> = ({
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
        isAttached
        variant='solid'
        size={size}
        colorScheme={colorScheme}
        isDisabled={isDisabled}
        height={height}
        {...props}
      >
        <Button aria-label={ariaLabel} type={type} height={height}>
          {selectedOption || placeholder}
        </Button>
        <IconButton
          height={height}
          aria-label={ariaLabel}
          alignItems='center'
          icon={<Icon as={FaChevronDown} />}
          onClick={() => setOptionsOpen(!optionsOpen)}
          onMouseEnter={() => setOptionsOpen(true)}
          bg={`${colorScheme}.400`}
          _hover={{
            bg: `${colorScheme}.600`,
          }}
          _focus={{ boxShadow: 'none' }}
          {...props.iconButtonProps}
        />
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
            <UnorderedList ml={0}>
              {options.map(option => {
                return (
                  <ListItem
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
                  </ListItem>
                );
              })}
            </UnorderedList>
          </Box>
        </Box>
      )}
    </Box>
  );
};
