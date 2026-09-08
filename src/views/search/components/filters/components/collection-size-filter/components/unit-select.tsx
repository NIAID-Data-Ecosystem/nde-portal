import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Flex,
  ListItem,
  Text,
  useDisclosure,
  VisuallyHidden,
} from '@chakra-ui/react';
import { OptionsList, SelectWithInput } from 'src/components/select';
import { formatNumber } from 'src/utils/helpers';
import { ALL_UNITS_KEY } from 'src/views/search/config/collection-size';
import { UnitOption } from '../utils';

const SELECT_ID = 'collection-size-unit-select';
const LISTBOX_ID = `${SELECT_ID}-listbox`;
const optionId = (index: number) => `${SELECT_ID}-option-${index}`;

interface UnitSelectProps {
  colorScheme: string;
  options: UnitOption[];
  selectedKey: string;
  isDisabled?: boolean;
  onChange: (option: UnitOption) => void;
}

/**
 * Single-select combobox for the collection size unit.
 *
 * The vocabulary is uncontrolled and runs to ~140 grouped units, so the input
 * doubles as a type-ahead over the option labels rather than listing them all
 * for scrolling.
 */
export const UnitSelect: React.FC<UnitSelectProps> = ({
  colorScheme,
  options,
  selectedKey,
  isDisabled,
  onChange,
}) => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  // `query` is only meaningful while searching; otherwise the input shows the
  // current selection.
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find(option => option.key === selectedKey) ?? options[0],
    [options, selectedKey],
  );

  const filteredOptions = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!isSearching || !search) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(search),
    );
  }, [isSearching, options, query]);

  // Highlight follows the current selection whenever the list is reopened or
  // re-filtered, so Enter without arrowing never picks an unrelated unit.
  useEffect(() => {
    const selectedIndex = filteredOptions.findIndex(
      option => option.key === selectedKey,
    );
    setHighlightedIndex(selectedIndex === -1 ? 0 : selectedIndex);
  }, [filteredOptions, selectedKey]);

  const stopSearching = useCallback(() => {
    setIsSearching(false);
    setQuery('');
  }, []);

  const handleClose = useCallback(() => {
    stopSearching();
    onClose();
  }, [onClose, stopSearching]);

  const selectOption = useCallback(
    (option: UnitOption) => {
      onChange(option);
      stopSearching();
      onClose();
    },
    [onChange, onClose, stopSearching],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isDisabled) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!isOpen) {
          onOpen();
          return;
        }
        if (filteredOptions.length === 0) return;
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setHighlightedIndex(prev => {
          const next = prev + step;
          if (next < 0) return filteredOptions.length - 1;
          if (next > filteredOptions.length - 1) return 0;
          return next;
        });
        return;
      }

      if (event.key === 'Enter') {
        if (!isOpen) return;
        event.preventDefault();
        const option = filteredOptions[highlightedIndex];
        if (option) {
          selectOption(option);
        }
        return;
      }

      if (event.key === 'Escape') {
        if (!isOpen) return;
        event.preventDefault();
        handleClose();
      }
    },
    [
      filteredOptions,
      handleClose,
      highlightedIndex,
      isDisabled,
      isOpen,
      onOpen,
      selectOption,
    ],
  );

  return (
    <SelectWithInput
      id={SELECT_ID}
      ariaLabel='Select a collection size unit'
      size='sm'
      colorScheme={colorScheme}
      isDisabled={isDisabled}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={handleClose}
      onToggle={onToggle}
      handleOnClickOutside={stopSearching}
      value={isSearching ? query : selectedOption?.label ?? ''}
      placeholder='Search units'
      autoComplete='off'
      role='combobox'
      aria-expanded={isOpen}
      aria-controls={LISTBOX_ID}
      aria-autocomplete='list'
      aria-activedescendant={
        isOpen && filteredOptions.length > 0
          ? optionId(highlightedIndex)
          : undefined
      }
      onChange={event => {
        setIsSearching(true);
        setQuery(event.target.value);
        if (!isOpen) {
          onOpen();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <OptionsList
        id={LISTBOX_ID}
        role='listbox'
        position='static'
        mt={1}
        maxH='240px'
        border='1px solid'
        borderColor='gray.200'
      >
        {filteredOptions.length === 0 ? (
          <ListItem px={3} py={2}>
            <Text fontSize='sm' fontStyle='italic' color='gray.800'>
              No matching units.
            </Text>
          </ListItem>
        ) : (
          filteredOptions.map((option, index) => (
            <ListItem
              key={option.key || ALL_UNITS_KEY}
              id={optionId(index)}
              role='option'
              aria-selected={option.key === selectedOption?.key}
              px={3}
              py={2}
              cursor='pointer'
              bg={index === highlightedIndex ? 'gray.100' : 'transparent'}
              _hover={{ bg: 'gray.100' }}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectOption(option)}
            >
              <Flex justifyContent='space-between' alignItems='baseline'>
                <Text fontSize='sm' fontWeight='medium' lineHeight='short'>
                  {option.label}
                </Text>
                {option.key !== ALL_UNITS_KEY && (
                  <Text fontSize='xs' color='gray.800' ml={2}>
                    {formatNumber(option.count)}
                  </Text>
                )}
              </Flex>
            </ListItem>
          ))
        )}
      </OptionsList>
    </SelectWithInput>
  );
};
