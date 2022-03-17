import React, {useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Heading,
  SearchBar,
  UnorderedList,
  ListItem,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from 'nde-design-system';
import {Checkbox, CheckboxGroup} from '@chakra-ui/react';
import {FacetTerm} from 'src/utils/api/types';
import {filterFilterList} from '../../helpers';

interface FilterProps {
  name: string;
  terms: FacetTerm[];
  selectedFilters: (string | number)[];
  handleSelectedFilters: (arg: any) => void;
}

const filterNameConfig = {
  'curatedBy.name': 'Source',
  keywords: 'Keywords',
  measurementTechnique: 'Measurement Technique',
  variableMeasured: 'Variable Measured',
} as {[key: string]: string};

// [TO DO]: Extract to hook.
export const Filter: React.FC<FilterProps> = ({
  name,
  terms,
  selectedFilters,
  handleSelectedFilters,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Number of filter values to show in list.
  const [numItems, setNumItems] = useState(5);

  // Term to filter the filters with.
  const [searchTerm, setSearchTerm] = useState('');

  // Filters the terms list based on search box.
  const {items, hasMore} = filterFilterList(terms, searchTerm, numItems);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  useEffect(() => {
    // when show more is clicked, scroll to bottom of list.
    if (ref && ref.current) {
      ref.current.scrollTop =
        ref.current.scrollHeight - ref.current.clientHeight;
    }
  }, [numItems]);

  return (
    <AccordionItem>
      <h2>
        <AccordionButton
          ml={0.25}
          borderLeft={'5px solid'}
          borderColor={'accent.bg'}
          _expanded={{bg: '#75c3ac2e'}}
        >
          {/* Filter Name */}
          <Box flex='1' textAlign='left'>
            <Heading size={'xs'} fontWeight={'medium'}>
              {filterNameConfig[name]}
            </Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel>
        {items.length > 0 && (
          <SearchBar
            maxW={'unset'}
            my={2}
            placeholder={'Search filter'}
            value={searchTerm}
            handleChange={handleSearchChange}
            handleClick={() => {
              // required prop but nothing to input.
            }}
          />
        )}
        <Box
          ref={ref}
          w={'100%'}
          maxH={'250px'}
          overflowY={'auto'}
          style={{scrollBehavior: 'smooth'}}
        >
          {/* Filters that can be applied on current search */}
          <UnorderedList direction={'column'} ml={0}>
            <CheckboxGroup
              defaultValue={selectedFilters}
              onChange={filterValues => {
                handleSelectedFilters({[name]: filterValues});
              }}
            >
              {items.map((t, i) => {
                return (
                  <ListItem
                    key={t.term}
                    p={2}
                    py={1}
                    bg={i % 2 ? 'white' : 'blackAlpha.50'}
                  >
                    <Checkbox value={t.term} spacing={2}>
                      <Text>
                        <strong> {t.term}</strong> ({t.count})
                      </Text>
                    </Checkbox>
                  </ListItem>
                );
              })}
            </CheckboxGroup>
          </UnorderedList>
        </Box>
        {items.length === 0 ? (
          <Text color={'niaid.placeholder'}>Nothing to see here</Text>
        ) : hasMore ? (
          <Button
            variant={'link'}
            color={'link.color'}
            isDisabled={!hasMore}
            onClick={() => setNumItems(numItems + 5)}
          >
            (Show more...)
          </Button>
        ) : (
          <></>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};
