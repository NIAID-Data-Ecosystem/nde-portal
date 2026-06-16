import React, { useMemo } from 'react';
import { SelectAndSortPopover } from 'src/components/select-and-order-popover';
import { FilterConfig } from '../../types';

const CUSTOM_VISIBLE_FILTERS_STORAGE_KEY = 'search-visible-filters';

interface CustomizeFiltersPopoverProps {
  filtersList: FilterConfig[];
  onVisibleFiltersChange?: (visibleFilterIds: string[]) => void;
}

/**
 * Search-filters wrapper around the generic SelectAndSortPopover. Maps
 * `FilterConfig.category` to `groupKey` so filters render under their
 * category headings.
 */
export const CustomizeFiltersPopover = ({
  filtersList,
  onVisibleFiltersChange,
}: CustomizeFiltersPopoverProps) => {
  const items = useMemo(
    () =>
      filtersList.map(f => ({
        id: f.id,
        title: f.name,
        groupKey: f.category,
      })),
    [filtersList],
  );

  return (
    <SelectAndSortPopover
      items={items}
      storageKeyVisible={CUSTOM_VISIBLE_FILTERS_STORAGE_KEY}
      onVisibleChange={onVisibleFiltersChange}
      showCount={false}
      maxListHeight='16rem'
      copy={{
        button: 'Customize Search Filters',
        header: 'Customize Filters',
        description: 'Select which filters to display.',
        searchPlaceholder: 'Search filters',
        noItemsFound: 'No filters found',
      }}
      triggerProps={{ colorScheme: 'gray', flex: 1 }}
    />
  );
};
