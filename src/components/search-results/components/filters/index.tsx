import React, {useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  SearchBar,
  UnorderedList,
  ListItem,
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
    <div>
      <SearchBar
        placeholder={'Search filter'}
        value={searchTerm}
        handleChange={handleSearchChange}
        handleClick={() => {
          // required prop but nothing to input.
        }}
      />
      {/* Filter Name */}
      {name.charAt(0).toUpperCase() + name.slice(1)}
      <Box
        ref={ref}
        w={'100%'}
        maxH={'200px'}
        overflowY={'auto'}
        style={{scrollBehavior: 'smooth'}}
      >
        {/* Filters that can be applied on current search */}
        <UnorderedList direction={'column'}>
          <CheckboxGroup
            defaultValue={selectedFilters}
            onChange={filterValues => {
              handleSelectedFilters({[name]: filterValues});
            }}
          >
            {items.map(t => {
              return (
                <ListItem key={t.term}>
                  <Checkbox value={t.term}>
                    {t.term} ({t.count})
                  </Checkbox>
                </ListItem>
              );
            })}
          </CheckboxGroup>
        </UnorderedList>
      </Box>
      <Button
        variant={'link'}
        isDisabled={!hasMore}
        onClick={() => setNumItems(numItems + 5)}
      >
        Show more...
      </Button>
    </div>
  );
};
