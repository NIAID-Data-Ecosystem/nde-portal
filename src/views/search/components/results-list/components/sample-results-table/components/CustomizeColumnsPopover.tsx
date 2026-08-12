import React from 'react';
import {
  CustomizeColumnsPopover as GenericCustomizeColumnsPopover,
  ColumnConfig,
} from '../../results-table/components/CustomizeColumnsPopover';
import { SAMPLE_REQUIRED_COLUMN_IDS } from '../../results-table/constants';

export const CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY =
  'search-visible-sample-columns';

export const CUSTOM_COLUMN_ORDER_STORAGE_KEY = 'search-sample-column-order';

export const DEFAULT_VISIBLE_COLUMN_IDS = [
  'identifier',
  'name',
  'date',
  'includedInDataCatalog',
  'description',
  'conditionsOfAccess',
  'sex',
  'species',
  'funder',
  'fundingId',
];

export { SAMPLE_REQUIRED_COLUMN_IDS as REQUIRED_COLUMN_IDS };

export type { ColumnConfig };

interface CustomizeColumnsPopoverProps {
  columnsList: ColumnConfig[];
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
}

/**
 * Sample-table-specific wrapper around the generic CustomizeColumnsPopover.
 * Pre-fill all sample-specific configuration (storage keys, defaults,
 * required columns).
 */
export const CustomizeColumnsPopover = ({
  columnsList,
  onVisibleColumnsChange,
  onColumnOrderChange,
}: CustomizeColumnsPopoverProps) => (
  <GenericCustomizeColumnsPopover
    columnsList={columnsList}
    storageKeyVisible={CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY}
    storageKeyOrder={CUSTOM_COLUMN_ORDER_STORAGE_KEY}
    defaultVisibleIds={DEFAULT_VISIBLE_COLUMN_IDS}
    requiredIds={SAMPLE_REQUIRED_COLUMN_IDS}
    onVisibleColumnsChange={onVisibleColumnsChange}
    onColumnOrderChange={onColumnOrderChange}
  />
);
