import React, { useEffect, useRef, useState } from 'react';
import { debounce, groupBy, uniqBy } from 'lodash';
import {
  Box,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FaSearch } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { List, ListItem } from './components/list';

interface SearchWithPredictiveTextProps {
  queryFn: (term: string) => void; // query function that returns results given a string value
  results: FormattedResource[];
  selectedField: string;
}

export const SearchWithPredictiveText: React.FC<
  SearchWithPredictiveTextProps
> = ({ queryFn, results, selectedField }) => {
  const fieldName = selectedField || 'name';
  const [cursor, setCursor] = useState(0);
  const [inputValue, setInputValue] = useState('');
  // Wrapping debounce in useRef since its an expensive call, only run if fn changes.
  const debouncedQuery = useRef(debounce(v => queryFn(v), 200));

  useEffect(() => {
    // Debounce the query call.
    debouncedQuery.current(inputValue);
  }, [inputValue]);

  // List of suggestions to search query.
  const suggestions = uniqBy(
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
  );

  // Group suggestions by type.
  const suggestionsGroupedByType = Object.entries(
    groupBy(suggestions, d => d.type),
  );
  return (
    <Box width='100%'>
      {/* Search input */}
      <InputGroup>
        <InputLeftElement
          pointerEvents='none'
          // eslint-disable-next-line react/no-children-prop
          children={<Icon as={FaSearch} color='gray.300' />}
        />

        <Input
          type='search'
          placeholder='Search'
          value={inputValue}
          onChange={e => setInputValue(e.currentTarget.value)}
          tabIndex={0}
        />
      </InputGroup>

      {/* Dropdown prediction values */}
      <Box position='relative'>
        <Box
          position='absolute'
          w='100%'
          zIndex={1000}
          bg='white'
          borderRadius='base'
          overflow='hidden'
          left={0}
        >
          <List isOpen={inputValue.length > 0 && results.length > 0}>
            {/* Group results by type (dataset/computational tool) */}
            {suggestionsGroupedByType.map(([type, items]) => {
              return (
                <UnorderedList key={type} display='flex' flexWrap='wrap' my={1}>
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
                    {items.map((result, i) => {
                      if (!result[fieldName]) {
                        return <React.Fragment key={i}></React.Fragment>;
                      }
                      const idx = suggestions.findIndex(
                        d => d[fieldName] === result[fieldName],
                      );

                      return (
                        <ListItem
                          key={result._id}
                          selectedField={fieldName}
                          value={result[fieldName]}
                          isSelected={idx === cursor}
                          onMouseOver={() => setCursor(idx)}
                          searchTerm={inputValue}
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
