import React from 'react';
import {
  CustomizeColumnsPopover as GenericCustomizeColumnsPopover,
  ColumnConfig,
} from '../../results-table/components/CustomizeColumnsPopover';
import { COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS } from '../../results-table/constants';

export const CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY =
  'search-visible-computational-tool-columns';

export const CUSTOM_COLUMN_ORDER_STORAGE_KEY =
  'search-computational-tool-column-order';

export const DEFAULT_VISIBLE_COLUMN_IDS = [
  'name',
  'source',
  'date',
  'author',
  'conditionsOfAccess',
  'description',
  'applicationCategory',
  'programmingLanguage',
  'operatingSystem',
  'input',
  'featureList',
  'output',
  'softwareHelp',
  'funder',
  'license',
  'softwareVersion',
  'topicCategory',
];

export { COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS as REQUIRED_COLUMN_IDS };

export type { ColumnConfig };

interface CustomizeColumnsPopoverProps {
  columnsList: ColumnConfig[];
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
  onColumnOrderChange?: (orderedColumnIds: string[]) => void;
}

/**
 * Computational-tool-table-specific wrapper around the generic
 * CustomizeColumnsPopover. Pre-fills all tool-specific configuration
 * (storage keys, defaults, required columns).
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
    requiredIds={COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS}
    onVisibleColumnsChange={onVisibleColumnsChange}
    onColumnOrderChange={onColumnOrderChange}
  />
);
