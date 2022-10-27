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
  ListItem,
  UnorderedList,
} from 'nde-design-system';

export const options = ['AND', 'OR', 'NOT'] as const;

export interface AddWithUnionProps extends ButtonGroupProps {
  ariaLabel: string;
  type: ButtonProps['type'];
  unionType: typeof options[number] | '';
  setUnionType: (arg: AddWithUnionProps['unionType']) => void;
}

export const AddWithUnion: React.FC<AddWithUnionProps> = ({
  ariaLabel,
  size,
  colorScheme = 'primary',
  isDisabled,
  type,
  unionType,
  setUnionType,
  height,
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
          {unionType || 'Add'}
        </Button>
        <IconButton
          height={height}
          aria-label={ariaLabel}
          alignItems='center'
          icon={<Icon as={FaChevronDown} />}
          onClick={() => setOptionsOpen(!optionsOpen)}
          onMouseEnter={() => setOptionsOpen(true)}
          padding={0}
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
          >
            <UnorderedList ml={0}>
              {options.map(option => {
                return (
                  <ListItem
                    key={option}
                    px={4}
                    py={1}
                    bg={`${colorScheme}.600`}
                    cursor='pointer'
                    color='white'
                    whiteSpace='nowrap'
                    _hover={{ bg: `${colorScheme}.400` }}
                    onClick={() => setUnionType(option)}
                  >
                    Add with {option}
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
