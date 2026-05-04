import React from 'react';
import {
  CustomizeColumnsPopover as GenericCustomizeColumnsPopover,
  ColumnConfig,
} from '../../results-table/components/CustomizeColumnsPopover';
import { DATA_COLLECTION_REQUIRED_COLUMN_IDS } from '../../results-table/constants';

export const CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY =
  'search-visible-data-collection-columns';

export const CUSTOM_COLUMN_ORDER_STORAGE_KEY =
  'search-data-collection-column-order';

export const DEFAULT_VISIBLE_COLUMN_IDS = [
  'name',
  'source',
  'about',
  'conditionsOfAccess',
  'date',
  'description',
  'healthCondition',
  'infectiousAgent',
  'species',
  'topicCategory',
  'isBasedOn',
  'collectionSize',
];

export { DATA_COLLECTION_REQUIRED_COLUMN_IDS as REQUIRED_COLUMN_IDS };

export type { ColumnConfig };

interface CustomizeColumnsPopoverProps {
  columnsList: ColumnConfig[];
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
}

/**
 * Data-collection-table-specific wrapper around the generic
 * CustomizeColumnsPopover. Pre-fill all data-collection-specific
 * configuration (storage keys, defaults, required columns).
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
    requiredIds={DATA_COLLECTION_REQUIRED_COLUMN_IDS}
    onVisibleColumnsChange={onVisibleColumnsChange}
    onColumnOrderChange={onColumnOrderChange}
  />
);
