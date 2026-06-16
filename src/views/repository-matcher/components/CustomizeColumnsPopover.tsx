import React, { useMemo } from 'react';
import { SelectAndSortPopover } from 'src/components/select-and-order-popover';
import { REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';

export const CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY =
  'repository-matcher-visible-columns';
export const CUSTOM_COLUMN_ORDER_STORAGE_KEY =
  'repository-matcher-column-order';

interface CustomizeColumnsPopoverProps {
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
}

/**
 * Repository-matcher wrapper around the generic SelectAndSortPopover. Pulls
 * column list, defaults, and required IDs straight from
 * REPOSITORY_MATCHER_COLUMNS so adding a column in table-config.tsx is the
 * only edit required to make it appear here.
 */
export const CustomizeColumnsPopover = ({
  onVisibleColumnsChange,
  onColumnOrderChange,
}: CustomizeColumnsPopoverProps) => {
  const items = useMemo(
    () =>
      REPOSITORY_MATCHER_COLUMNS.map(col => ({
        id: col.id,
        title: col.label,
      })),
    [],
  );

  const defaultVisibleIds = useMemo(
    () =>
      REPOSITORY_MATCHER_COLUMNS.filter(
        col => col.columns?.isDefault !== false,
      ).map(col => col.id),
    [],
  );

  const requiredIds = useMemo(
    () =>
      REPOSITORY_MATCHER_COLUMNS.filter(col => col.required).map(col => col.id),
    [],
  );

  return (
    <SelectAndSortPopover
      items={items}
      storageKeyVisible={CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY}
      storageKeyOrder={CUSTOM_COLUMN_ORDER_STORAGE_KEY}
      defaultVisibleIds={defaultVisibleIds}
      requiredIds={requiredIds}
      onVisibleChange={onVisibleColumnsChange}
      copy={{
        button: 'Customize Columns',
        header: 'Customize Columns',
        description: 'Select and reorder table columns to display.',
        searchPlaceholder: 'Search columns',
        noItemsFound: 'No columns found',
      }}
    />
  );
};
