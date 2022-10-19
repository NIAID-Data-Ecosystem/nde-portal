import React, { useEffect, useMemo, useRef, useState } from 'react';
import { debounce, groupBy, uniqBy } from 'lodash';
import {
  Box,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
  Spinner,
  Text,
  UnorderedList,
  VisuallyHidden,
} from 'nde-design-system';
import { FaSearch } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { List, ListItem } from './components/list';

interface SearchWithPredictiveTextProps {
  queryFn: (term: string) => void; // query function that returns results given a string value
  handleSubmit: (inputValue: string, field: string) => void; // triggered when suggestion item from list is clicked / press enters.
  results: FormattedResource[];
  selectedField: string;
  ariaLabel: string; // input label for accessibility
  placeholder?: string;
  searchTerm: string;
  isLoading?: boolean;
  size?: InputProps['size'];
  colorScheme?: InputProps['colorScheme'];
}

const SIZE_CONFIG: any = {
  xs: {
    width: 5,
    h: 1.75,
  },
  sm: {
    width: 5.5,
    h: 2,
  },
  md: {
    width: 5.5,
    h: 2.5,
  },
  lg: {
    width: 6.5,
    h: 3,
  },
};

export const SearchWithPredictiveText: React.FC<
  SearchWithPredictiveTextProps
> = ({
  queryFn,
  handleSubmit,
  results,
  placeholder,
  selectedField,
  searchTerm,
  ariaLabel,
  isLoading: queryLoading,
  size = 'sm',
  colorScheme = 'primary',
}) => {
  const fieldName = selectedField || 'name';
  const [isOpen, setIsOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [inputValue, setInputValue] = useState(searchTerm);

  // List of suggestions to search query.
  const uniqueSuggestions = useMemo(
    () =>
      uniqBy(
        results.map(result => {
          let value;
          // if value is array, extract value that matches search result
          if (Array.isArray(result[fieldName])) {
            value = result[fieldName]
              .filter((r: string) => {
                let name = r.toLowerCase();
                let search = inputValue.toLowerCase();
                return name.includes(search);
              })
              .join(',');
          } else {
            value = result[fieldName];
          }
          return { ...result, [fieldName]: value };
        }),
        // filter out duplicate values
        v => v[fieldName],
      ),
    [fieldName, inputValue, results],
  );

  // Group suggestions by type.
  const suggestionsGroupedByType = useMemo(
    () => Object.entries(groupBy(uniqueSuggestions, d => d.type)),
    [uniqueSuggestions],
  );
  // Flat list of suggestions sorted by type.
  const suggestions = useMemo(
    () => suggestionsGroupedByType.map(d => d[1]).flat(),
    [suggestionsGroupedByType],
  );

  // Handles loading spinner
  const [isLoading, setIsLoading] = useState(queryLoading);
  useEffect(() => {
    setIsLoading(queryLoading);
  }, [queryLoading]);

  // Wrapping debounce in useRef since its an expensive call, only run if fn changes.
  const debouncedQuery = useRef(debounce(v => queryFn(v), 500));
  const timerRef: { current: NodeJS.Timeout | null } = useRef(null);

  // run query after timed interval.
  const getSuggestions = (value: string) => {
    timerRef.current = setTimeout(() => {
      debouncedQuery.current(value);
    }, 200);
  };

  useEffect(() => {
    // Clear the interval when the component unmounts
    return () => clearTimeout(timerRef.current || undefined);
  }, []);

  /* Update the suggested list scroll position so that currently selected element is always in view.*/
  useEffect(() => {
    const el = document.getElementById(`li-${cursor}`);
    if (el) {
      el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [cursor]);
  return (
    <Box width='100%'>
      <Flex
        as='form'
        onSubmit={e => {
          e.preventDefault();
          setIsOpen(false);
          handleSubmit(inputValue, fieldName);
        }}
      >
        {/* Label for accessibility */}
        <VisuallyHidden>
          <label htmlFor={ariaLabel}>{ariaLabel}</label>
        </VisuallyHidden>

        {/* Search input */}
        <InputGroup size={size}>
          <InputLeftElement
            pointerEvents='none'
            // eslint-disable-next-line react/no-children-prop
            children={
              isLoading ? (
                <Spinner
                  color='primary.500'
                  emptyColor='gray.200'
                  label='loading'
                  size='sm'
                />
              ) : (
                <Icon as={FaSearch} color='gray.300' />
              )
            }
          />

          <Input
            colorScheme={colorScheme}
            pr={`${SIZE_CONFIG[size]['width']}rem`}
            type='search'
            placeholder={placeholder || 'Search'}
            value={inputValue}
            onChange={e => {
              e.currentTarget.value && setIsLoading(true);
              setIsOpen(true);
              setInputValue(e.currentTarget.value);
              getSuggestions(e.currentTarget.value);
            }}
            tabIndex={0}
            bg='white'
            onKeyDown={e => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                let idx = cursor;
                if (e.key === 'ArrowDown' && idx <= suggestions.length - 1) {
                  idx = idx === suggestions.length - 1 ? -1 : idx + 1;
                }
                if (e.key === 'ArrowUp' && idx >= -1) {
                  idx = idx === -1 ? suggestions.length - 1 : idx - 1;
                }

                // if the user presses the down arrow we update the current selection [cursor]
                if (idx !== cursor) {
                  setCursor(idx);
                  if (idx >= 0 && suggestions[idx][fieldName]) {
                    setInputValue(suggestions[idx][fieldName]);
                  } else {
                    setInputValue(searchTerm);
                  }
                }
                // Move cursor to end of input
                let input = e.currentTarget;
                if (input) {
                  setTimeout(function () {
                    input.selectionStart = input.selectionEnd = 10000;
                  }, 0);
                }
              }
            }}
          />
          <InputRightElement p={1} w={`${SIZE_CONFIG[size]['width']}rem`}>
            <Button
              size={size === 'sm' ? 'xs' : size}
              w='100%'
              colorScheme={colorScheme}
              aria-label={ariaLabel}
              type='submit'
              d='flex'
              // set padding top and bottom for safari, do not remove.
              py={0}
            >
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
      </Flex>
      {/* Dropdown prediction values */}
      <Box position='relative'>
        <Box
          position='absolute'
          w='100%'
          zIndex={5}
          boxShadow='lg'
          bg='white'
          borderRadius='base'
          overflow='hidden'
          left={0}
        >
          <List isOpen={isOpen && inputValue.length > 0 && results.length > 0}>
            {/* Group results by type (dataset/computational tool) */}
            {suggestionsGroupedByType.map(([type, items]) => {
              return (
                <UnorderedList
                  key={type}
                  id={`${type}-list`}
                  display='flex'
                  flexWrap='wrap'
                  my={1}
                >
                  {/* column displaying the type of result. */}
                  {fieldName === 'name' && (
                    <Flex
                      flex={1}
                      justifyContent={['center', 'flex-end']}
                      bg={
                        type.toLowerCase() === 'dataset'
                          ? 'status.info_lt'
                          : 'blackAlpha.50'
                      }
                      mx={2}
                      my={1}
                      borderRadius='base'
                      minW={150}
                      maxW={{ base: 'unset', md: 180 }}
                    >
                      <Text
                        fontSize='xs'
                        color='text.body'
                        p={2}
                        textAlign='right'
                      >
                        {type}
                      </Text>
                    </Flex>
                  )}

                  {/* column displaying the fielded result */}
                  <Box flex={3} minW={150} mx={2}>
                    {suggestions.map((result, idx) => {
                      if (result.type !== type || !result[fieldName]) {
                        return <React.Fragment key={idx}></React.Fragment>;
                      }
                      return (
                        <ListItem
                          id={`li-${idx}`}
                          key={result._id}
                          selectedField={fieldName}
                          value={result[fieldName]}
                          isSelected={idx === cursor}
                          onMouseOver={() => setCursor(idx)}
                          searchTerm={searchTerm}
                          onClick={e => {
                            e.preventDefault();
                            setIsOpen(false);
                            setInputValue(result[fieldName]);
                            handleSubmit(result[fieldName], fieldName);
                          }}
                        />
                      );
                    })}
                  </Box>
                </UnorderedList>
              );
            })}
          </List>
        </Box>
      </Box>
    </Box>
  );
};
