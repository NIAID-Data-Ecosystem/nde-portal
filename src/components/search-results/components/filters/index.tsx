import React, {useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  SearchInput,
  UnorderedList,
  ListItem,
  Text,
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
  'includedInDataCatalog.name': 'Source',
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
          borderLeft='4px solid'
          borderColor='gray.200'
          py={4}
          transition='all 0.2s linear'
          _expanded={{
            borderColor: 'accent.bg',
            py: 2,
            transition: 'all 0.2s linear',
          }}
        >
          {/* Filter Name */}
          <Box flex='1' textAlign='left'>
            <Heading size='sm' fontWeight='semibold'>
              {filterNameConfig[name]}
            </Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={2} borderLeft='4px solid' borderColor='accent.bg'>
        {/* Search through the filters */}
        {items.length > 0 && (
          <SearchInput
            ariaLabel={`Search filter ${filterNameConfig[name]} terms`}
            maxW='unset'
            my={2}
            size='md'
            placeholder='Enter a keyword or phrase'
            value={searchTerm}
            handleChange={handleSearchChange}
            colorScheme='primary'
          />
        )}
        <Box
          ref={ref}
          w='100%'
          maxH='250px'
          overflowY='auto'
          style={{scrollBehavior: 'smooth'}}
        >
          {/* Filters that can be applied on current search */}
          <UnorderedList direction='column' ml={0} my={2}>
            <CheckboxGroup
              defaultValue={selectedFilters}
              value={selectedFilters}
              onChange={filterValues => {
                handleSelectedFilters({[name]: filterValues});
              }}
            >
              {items.length === 0 && (
                <Text color='niaid.placeholder'>
                  No filters available for this metric.
                </Text>
              )}
              {items.map((t, i) => {
                return (
                  <ListItem key={t.term} p={2} py={1}>
                    <Checkbox value={t.term} spacing={2} size='lg'>
                      <Flex ml={1} fontSize='xs' lineHeight={1.5}>
                        <Text fontWeight='light'>
                          {t.term}
                          <Text as='span' fontWeight='semibold' ml={1}>
                            ({t.count})
                          </Text>
                        </Text>
                      </Flex>
                    </Checkbox>
                  </ListItem>
                );
              })}
            </CheckboxGroup>
          </UnorderedList>
        </Box>
        {hasMore && (
          <ListItem justifyContent='center' borderColor='gray.200'>
            <Button
              variant='link'
              color='link.color'
              isDisabled={!hasMore}
              size='sm'
              onClick={() => setNumItems(numItems + 5)}
            >
              (show more...)
            </Button>
          </ListItem>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};
