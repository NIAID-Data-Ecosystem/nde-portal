// @ts-nocheck
import React from 'react';
import {
  Accordion,
  Heading,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
} from 'nde-design-system';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { SelectedFilterType } from 'src/components/filters/types';
import {
  useFacetsData,
  FiltersList,
  queryFilterObject2String,
} from 'src/components/filters';
import { encodeString } from 'src/utils/querystring-helpers';

interface FiltersProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
  // HandlerFn for updating filters
  handleSelectedFilters: (
    updatedFilters: SelectedFilterType,
    queryString?: string,
  ) => void;
}

// List of needed filters/naming convention.
export const filtersConfig: {
  [key: string]: {
    name: string;
  };
} = {
  'includedInDataCatalog.name': { name: 'Source' },
  'funding.funder.name': { name: 'Funding' },
  'infectiousAgent.name': { name: 'Pathogen' },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
  },
};

export const Filters: React.FC<FiltersProps> = ({
  queryString,
  filters,
  handleSelectedFilters,
}) => {
  const FACET_SIZE = 1000;
  const facets = Object.keys(filtersConfig);
  const filter_string = queryFilterObject2String(filters);

  const queryParams = {
    q: encodeString(queryString),
    extra_filter: filter_string || '', // extra filter updates aggregate fields
    facet_size: FACET_SIZE,
  };

  const [{ data, error, isLoading }] = useFacetsData({
    queryParams,
    facets,
  });

  return error ? (
    <Flex p={4} bg='status.error'>
      <Heading size='sm' color='white' fontWeight='semibold'>
        Something went wrong, unable to load filters. <br />
        Try reloading the page.
      </Heading>
    </Flex>
  ) : (
    <Accordion
      allowMultiple
      w='100%'
      bg='#fff'
      d={{ base: 'block', xl: 'flex' }}
    >
      {facets.map(prop => {
        const { name, glyph, property } = filtersConfig[prop];

        return (
          <AccordionItem
            key={prop}
            borderRightWidth='2px'
            borderColor='page.alt'
            borderTopWidth='2px'
            flex={1}
            bg='page.alt'
          >
            {({ isExpanded }) => (
              <>
                <h2>
                  <AccordionButton
                    borderLeft='4px solid'
                    borderBottom='1px solid'
                    borderBottomColor='page.alt'
                    borderLeftColor='gray.200'
                    py={4}
                    bg='white'
                    transition='all 0.2s linear'
                    _expanded={{
                      borderLeftColor: 'accent.bg',
                      transition: 'all 0.2s linear',
                    }}
                  >
                    {/* Filter Name */}
                    <Flex flex={1}>
                      <Heading size='sm' fontWeight='semibold'>
                        {filtersConfig[prop].name}
                      </Heading>
                      <Heading
                        size='sm'
                        fontWeight='semibold'
                        ml={1}
                        color={
                          filters[prop].length > 0 ? 'inherit' : 'gray.400'
                        }
                      >
                        ({filters[prop].length})
                      </Heading>
                    </Flex>
                    {isExpanded ? (
                      <FaMinus fontSize='12px' />
                    ) : (
                      <FaPlus fontSize='12px' />
                    )}
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  px={2}
                  py={4}
                  bg='#fff'
                  borderLeft='4px solid'
                  borderLeftColor='accent.bg'
                >
                  <FiltersList
                    key={prop}
                    searchPlaceholder={`Search ${name.toLowerCase()} filters`}
                    terms={data[prop]}
                    selectedFilters={filters[prop].map(filter => {
                      if (typeof filter === 'object') {
                        return Object.keys(filter)[0];
                      } else {
                        return filter;
                      }
                    })}
                    handleSelectedFilters={values => {
                      const updatedValues = values.map(value => {
                        // return object with inverted facet + key for exists values
                        if (value === '-_exists_') {
                          return { [value]: [prop] };
                        }
                        return value;
                      });

                      handleSelectedFilters({ [prop]: updatedValues });
                    }}
                    isLoading={isLoading}
                  />
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
