import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import { FiltersContainer } from 'src/components/filters/components/filters-container';
import { FiltersList } from 'src/components/filters/components/filters-list';
import {
  queryFilterObject2String,
  updateRoute,
} from 'src/components/filters/helpers';
import {
  FiltersConfigProps,
  SelectedFilterType,
} from 'src/components/filters/types';
import { useRouter } from 'next/router';
// import { FiltersDateSlider } from 'src/components/filters/components/filters-date-slider/';
import { FILTERS_CONFIG } from './helpers';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Button,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { MetadataIcon, MetadataToolTip } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { Params } from 'src/utils/api';
import { FiltersDateSlider } from 'src/components/filters/components/filters-date-slider';

/*
[COMPONENT INFO]:
  Fetches all filters based on initial query string.
  Note: only the counts are updated when the user toggles a filter.
*/

// Default facet size
export const FACET_SIZE = 1000;

/*
Config for the naming/text of a filter.
[NOTE]: Order matters here as the filters will be rendered in the order of the keys.
*/
export const filtersConfig: FiltersConfigProps = {
  date: { name: 'Date ', glyph: 'date', property: 'date', isDefaultOpen: true },
  // '@type': { name: 'Type', isDefaultOpen: true },
  'includedInDataCatalog.name': {
    name: 'Repository',
    glyph: 'info',
    property: 'includedInDataCatalog',
  },
  'healthCondition.name': {
    name: 'Health Condition',
    glyph: 'healthCondition',
    property: 'healthCondition',
  },

  'infectiousAgent.displayName': {
    name: 'Pathogen Species',
    glyph: 'infectiousAgent',
    property: 'infectiousAgent',
  },

  'species.displayName': {
    name: 'Host Species',
    glyph: 'species',
    property: 'species',
  },
  // applicationCategory: {
  //   name: 'Software Category',
  //   glyph: 'applicationCategory',
  //   property: 'applicationCategory',
  // },
  // programmingLanguage: {
  //   name: 'Programming Language',
  //   glyph: 'programmingLanguage',
  //   property: 'programmingLanguage',
  // },
  'funding.funder.name': {
    name: 'Funding',
    glyph: 'funding',
    property: 'funding',
  },
  conditionsOfAccess: {
    name: 'Conditions of Access',
    glyph: 'info',
    property: 'conditionsOfAccess',
  },
  variableMeasured: {
    name: 'Variable Measured',
    glyph: 'variableMeasured',
    property: 'variableMeasured',
  },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
    glyph: 'measurementTechnique',
    property: 'measurementTechnique',
  },
};

interface FiltersProps {
  colorScheme?: string;
  queryParams: Params;
  selectedFilters: SelectedFilterType;
  // fn to remove all selected filters
  removeAllFilters?: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  colorScheme = 'primary',
  queryParams,
  selectedFilters,
  removeAllFilters,
}) => {
  const facets = Object.keys(filtersConfig);
  const router = useRouter();

  const [{ data, error, isLoading }] = useFacetsData({
    queryParams,
    facets: facets.filter(facet => facet !== 'date'),
  });

  const handleUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  const handleSelectedFilters = useCallback(
    (values: string[], facet: string) => {
      const updatedValues = values.map(value => {
        // return object with inverted facet + key for exists values
        if (value === '-_exists_' || value === '_exists_') {
          return { [value]: [facet] };
        }
        return value;
      });

      let updatedFilterString = queryFilterObject2String({
        ...selectedFilters,
        ...{ [facet]: updatedValues },
      });

      handleUpdate({
        from: 1,
        filters: updatedFilterString,
      });
    },
    [selectedFilters, handleUpdate],
  );

  const [openAccordionIndices, setOpenAccordionIndices] = useState<number[]>(
    [],
  );

  useEffect(() => {
    setOpenAccordionIndices(prev => {
      // 1. If filter is selected, default to an open accordion panel.
      let selectedKeys =
        selectedFilters &&
        Object.entries(selectedFilters)
          .filter(([_, v]) => v.length > 0)
          .map(o =>
            Object.keys(FILTERS_CONFIG)
              .filter(key => key !== 'date')
              .indexOf(o[0]),
          );
      // 2. The filter config specifies that this filter should be open by default.
      Object.values(FILTERS_CONFIG)
        .filter(item => item.property !== 'date')
        .forEach((v, i) => {
          if (v.isDefaultOpen && !selectedKeys.includes(i)) {
            selectedKeys.push(i);
          }
        });
      return selectedKeys;
    });
    // Only run on mount.
  }, [selectedFilters]);
  const hasMounted = useHasMounted();
  if (!hasMounted || !router.isReady) {
    return <></>;
  }

  return (
    <FiltersContainer title='Filters'>
      <Flex
        justifyContent='space-between'
        px={{ base: 0, md: 4 }}
        py={{ base: 2, md: 4 }}
        alignItems='center'
      >
        <Heading size='sm' fontWeight='semibold'>
          Filters {`${openAccordionIndices}`}
        </Heading>
        {/* Clear all currently selected filters */}
        <Button
          colorScheme='secondary'
          variant='outline'
          size='sm'
          onClick={removeAllFilters}
          isDisabled={!removeAllFilters}
        >
          Clear All
        </Button>
      </Flex>

      {error ? (
        // Error message.
        <Flex p={4} bg='status.error'>
          <Heading size='sm' color='white' fontWeight='semibold'>
            Something went wrong, unable to load filters. <br />
            Try reloading the page.
          </Heading>
        </Flex>
      ) : (
        <Accordion bg='white' allowMultiple defaultIndex={openAccordionIndices}>
          {facets.map(facet => {
            const { name, glyph, property } = FILTERS_CONFIG[facet];

            if (facet === 'date') {
              return (
                <FiltersDateSlider
                  key={facet}
                  facet={facet}
                  colorScheme={colorScheme}
                  queryParams={queryParams}
                  filters={selectedFilters}
                  selectedData={data?.date || []}
                  handleSelectedFilter={values =>
                    handleSelectedFilters(values, facet)
                  }
                  resetFilter={() => handleSelectedFilters([], facet)}
                />
              );
            }

            return (
              <AccordionItem
                key={facet}
                borderColor='page.alt'
                borderTopWidth='2px'
                className={`${openAccordionIndices}`}
              >
                {({ isExpanded }) => {
                  return (
                    <>
                      <h2
                        className={`${
                          isExpanded ? 'expanded' : 'not-expanded'
                        }`}
                      >
                        {/* Toggle expand panel open. */}
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
                          <Flex
                            flex='1'
                            textAlign='left'
                            justifyContent='space-between'
                            alignItems='center'
                          >
                            <Heading as='span' size='sm' fontWeight='semibold'>
                              {name}
                            </Heading>

                            {/* Icon tooltip with property definition. */}
                            {glyph && (
                              <MetadataToolTip
                                propertyName={property}
                                recordType='Dataset' // [NOTE]: Choosing dataset for general definition.
                                showAbstract
                              >
                                <MetadataIcon
                                  id={`filter-${property}`}
                                  glyph={glyph}
                                  title={property}
                                  fill={getMetadataColor(glyph)}
                                  mx={2}
                                />
                              </MetadataToolTip>
                            )}
                          </Flex>
                          {isExpanded ? (
                            <FaMinus fontSize='12px' />
                          ) : (
                            <FaPlus fontSize='12px' />
                          )}
                        </AccordionButton>
                      </h2>
                      <AccordionPanel
                        p={4}
                        borderLeft='4px solid'
                        borderColor='accent.bg'
                      >
                        {isExpanded && (
                          <FiltersList
                            colorScheme={colorScheme}
                            facet={facet}
                            selectedFilters={selectedFilters}
                            searchPlaceholder={`Search ${name.toLowerCase()} filters`}
                            terms={data[facet]}
                            property={property}
                            handleSelectedFilters={values =>
                              handleSelectedFilters(values, facet)
                            }
                            isLoading={isLoading}
                          />
                        )}
                      </AccordionPanel>
                    </>
                  );
                }}
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </FiltersContainer>
  );
};
