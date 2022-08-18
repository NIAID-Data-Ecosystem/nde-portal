// @ts-nocheck
import React from 'react';
import { useQuery } from 'react-query';
import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  Accordion,
  Heading,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Flex,
} from 'nde-design-system';
import LoadingSpinner from 'src/components/loading';
import { fetchSearchResults } from 'src/utils/api';
import { Filter, queryFilterObject2String } from 'src/components/filter';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { SelectedFilterType } from '../hooks';
import { encodeString } from 'src/utils/querystring-helpers';

interface FiltersProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
  // Default stringified filters.
  facets: string;
  // HandlerFn for updating filters
  handleSelectedFilters: (updatedFilters: SelectedFilterType) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  queryString,
  filters,
  facets,
  handleSelectedFilters,
}) => {
  // List of needed filters/naming convention.
  const filtersConfig: {
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
    variableMeasured: { name: 'Variable Measured' },
  };

  const queryFn = (queryString: string, filters?: {}) => {
    if (typeof queryString !== 'string' && !queryString) {
      return;
    }
    const filter_string = filters ? queryFilterObject2String(filters) : null;

    return fetchSearchResults({
      q: filter_string
        ? `${
            queryString === '__all__' ? '' : `${queryString} AND `
          }${filter_string}`
        : `${queryString}`,
      facet_size: 1000,
      facets,
    });
  };

  /*
   Using two queries so that we have display ALL filters displayed based on querystring and update the count only based on selected filters. Can't find a better way to do this for now.
   Query below: retrieves all facets for a given query without considering which filters are selected.
   */
  const { data: allFilters, isLoading } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        q: queryString,
        facets,
      },
    ],
    () => queryFn(queryString),
    {
      refetchOnWindowFocus: false,
    },
  );

  // Query below: retrieves all facets for a given query filtered by the selected filters. Used for count updates.
  const { data: updatedFilters } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results-with-filters',
      {
        q: encodeString(queryString),
        filters,
        facets,
      },
    ],
    () => queryFn(encodeString(queryString), filters),

    // Don't refresh everytime window is touched.
    {
      refetchOnWindowFocus: false,
    },
  );

  /*
   Fn for updating the filter items count when a filter checkbox is toggled. We want to keep the original filter terms and only update the counts.
   */
  const updateFilterCount = (
    items: FacetTerm[],
    facets: { data?: FacetTerm[]; isLoading?: boolean },
  ) => {
    return items.map(({ term, count }) => {
      let updatedCount;
      if (!facets?.isLoading && facets?.data) {
        const updated = facets?.data.find(f => f.term === term);
        updatedCount = updated ? updated?.count || count : 0;
      }

      return {
        count: updatedCount,
        term: term,
      };
    });
  };

  return (
    <Accordion
      allowMultiple
      w='100%'
      bg='#fff'
      d={{ base: 'block', xl: 'flex' }}
    >
      {facets.split(',').map(prop => {
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
                  {isLoading && <LoadingSpinner isLoading={isLoading} />}

                  <Filter
                    name={filtersConfig[prop].name}
                    values={updateFilterCount(
                      allFilters?.facets[prop].terms || [],
                      {
                        isLoading: isLoading,
                        data: updatedFilters?.facets[prop].terms,
                      },
                    )}
                    selectedFilters={filters[prop]}
                    handleSelectedFilters={v =>
                      handleSelectedFilters({ [prop]: v })
                    }
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
