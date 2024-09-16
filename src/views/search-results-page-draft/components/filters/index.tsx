import React, { useCallback, useMemo } from 'react';
import { Params } from 'src/utils/api';
import { useFilterQueries } from './hooks/useFilterQueries';
import { FILTER_CONFIGS } from './config';
import { useRouter } from 'next/router';
import { queryFilterObject2String, updateRoute } from '../../helpers';
import { FiltersSection } from './components/section';
import { FiltersList } from './components/list';
import { FiltersContainer } from './components/container';
import { FiltersDateSlider } from './components/date-slider';
import { SelectedFilterType } from './types';

// Interface for Filters component props
interface FiltersProps {
  colorScheme?: string;
  queryParams: Params;
  selectedFilters: SelectedFilterType;
  removeAllFilters?: () => void;
}

// Filters component
export const Filters: React.FC<FiltersProps> = ({
  colorScheme = 'primary',
  queryParams,
  removeAllFilters,
  selectedFilters,
}) => {
  const router = useRouter();

  // Omits date filter from filter config since date is handled differently i.e. as a histogram
  const config = useMemo(
    () => FILTER_CONFIGS.filter(facet => facet.property !== 'date'),
    [],
  );

  // Use custom hook to get filter query results
  const { results, error, isLoading, isUpdating } = useFilterQueries({
    initialParams: {
      q: queryParams.q,
    },
    updateParams: queryParams,
    config,
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

  return (
    <FiltersContainer
      title='Search Filters'
      error={error}
      filtersList={FILTER_CONFIGS}
      selectedFilters={selectedFilters}
      removeAllFilters={removeAllFilters}
    >
      {FILTER_CONFIGS.map(config => {
        const { _id, name, property } = config;
        const selected = selectedFilters?.[property]?.map(filter => {
          if (typeof filter === 'object') {
            return Object.keys(filter)[0];
          } else {
            return filter;
          }
        });

        if (property === 'date') {
          return (
            <FiltersSection
              key={config.name}
              name={config.name}
              description={config.description}
            >
              <FiltersDateSlider
                colorScheme={colorScheme}
                handleSelectedFilter={values =>
                  handleSelectedFilters(values, property)
                }
                resetFilter={() => handleSelectedFilters([], property)}
                selectedDates={selected || []}
                queryParams={queryParams}
              />
            </FiltersSection>
          );
        }
        return (
          <FiltersSection
            key={config.name}
            name={config.name}
            description={config.description}
          >
            <FiltersList
              config={config}
              colorScheme={colorScheme}
              searchPlaceholder={`Search ${name.toLowerCase()} filters`}
              terms={results?.[_id]?.['data'] || []}
              selectedFilters={selected || []}
              handleSelectedFilters={values =>
                handleSelectedFilters(values, property)
              }
              isLoading={
                results?.[_id]?.['isLoading'] ||
                results?.[_id]?.['isPlaceholderData'] ||
                results?.[_id]?.['isPending']
              }
              isUpdating={isUpdating}
            />
          </FiltersSection>
        );
      })}
    </FiltersContainer>
  );
};
