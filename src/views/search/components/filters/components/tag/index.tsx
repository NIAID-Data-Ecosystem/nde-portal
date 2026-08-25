import { Box, Button, HStack, Tag } from '@chakra-ui/react';
import { isEqual } from 'lodash';
import React, { useMemo } from 'react';
import {
  APPLY_DEFAULT_DATE_PARAM,
  defaultQuery,
} from 'src/views/search/config/defaultQuery';
import { usePaginationContext } from 'src/views/search/context/pagination-context';

import { SearchResultsHeading } from '../../../search-results-header';
import {
  FilterConfig,
  SelectedFilterType,
  SelectedFilterValueType,
} from '../../types';
import { queryFilterObject2String } from '../../utils/query-string';
import { generateTags } from './utils';

interface FilterTagsProps {
  filtersConfig: FilterConfig[];
  selectedFilters: SelectedFilterType;
  handleRouteUpdate: (update: Record<string, any>) => void;
  removeAllFilters: () => void;
}

export interface TagInfo {
  key: string;
  filterKey: string;
  name: string;
  value: string | SelectedFilterValueType | SelectedFilterValueType[];
  displayValue: string;
}

/**
 * Renders visual filter tags based on selected filters.
 * Users can remove individual tags or clear all filters at once.
 */

const tagStyles = {
  colorPalette: 'secondary' as const,
  size: 'sm' as const,
  variant: 'solid' as const,
};
export const FilterTags: React.FC<FilterTagsProps> = React.memo(
  ({ filtersConfig, selectedFilters, handleRouteUpdate, removeAllFilters }) => {
    const { resetPagination } = usePaginationContext();

    // Convert filter config list to map for quick access
    const configMap = useMemo(() => {
      return Object.fromEntries(filtersConfig.map(cfg => [cfg.property, cfg]));
    }, [filtersConfig]);

    // Generate list of tags to render from selected filters
    const tags = useMemo(
      () => generateTags(selectedFilters, configMap),
      [selectedFilters, configMap],
    );

    // Removes a single filter value from selectedFilters and updates the route.
    const removeSelectedFilter = (
      filterKey: string,
      filterValue: SelectedFilterValueType | SelectedFilterValueType[],
    ) => {
      let updatedFilters: SelectedFilterType;

      // If filterValue is an array of 2 dates, clear all
      if (
        filterKey === 'date' &&
        Array.isArray(filterValue) &&
        filterValue.length === 2 &&
        typeof filterValue[0] === 'string' &&
        typeof filterValue[1] === 'string'
      ) {
        // Remove the entire date range, including any _exists_ filters related to date because they are not relevant if the user is clearing the date filter and will only limit the results in an unintended way if left in the filters.
        updatedFilters = {
          ...selectedFilters,
          [filterKey]: [],
        };
      } else {
        // For other filters, remove the specific value(s)
        updatedFilters = {
          ...selectedFilters,
          [filterKey]: selectedFilters[filterKey].filter(v => {
            if (Array.isArray(filterValue)) return !filterValue.includes(v);
            return !isEqual(v, filterValue);
          }),
        };
      }

      resetPagination();
      handleRouteUpdate({
        from: defaultQuery.from,
        filters: queryFilterObject2String(updatedFilters),
        // Removing a date value: opt out of the default range only when the date
        // filter is now empty; drop the param when other date values remain (the
        // value itself already suppresses the default).
        ...(filterKey === 'date'
          ? {
              [APPLY_DEFAULT_DATE_PARAM]:
                (updatedFilters.date?.length ?? 0) > 0 ? undefined : 'false',
            }
          : {}),
      });
    };

    // Don't render anything if no filters are selected
    if (!tags.length) return null;

    return (
      <Box>
        <SearchResultsHeading as='h2'>Filtered by: </SearchResultsHeading>
        <HStack flexWrap='wrap' gap={1.5} py={1}>
          {/* Clear all filters button */}
          <Button
            size='xs'
            onClick={() => {
              resetPagination();
              removeAllFilters();
            }}
            colorPalette='secondary'
            variant='outline'
            lineHeight='unset'
            fontWeight='medium'
          >
            Clear All
          </Button>

          {/* Render each tag with close button */}
          {tags.map(({ key, name, value, displayValue, filterKey }) => (
            <Tag.Root key={key} {...tagStyles}>
              <Tag.Label>{`${name}: ${displayValue}`}</Tag.Label>
              <Tag.EndElement>
                <Tag.CloseTrigger
                  onClick={() => removeSelectedFilter(filterKey, value)}
                />
              </Tag.EndElement>
            </Tag.Root>
          ))}
        </HStack>
      </Box>
    );
  },
);
