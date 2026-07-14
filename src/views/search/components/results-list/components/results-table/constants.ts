/**
 * Column IDs that are always visible and cannot be toggled off in the
 * Customize Columns popover.
 *
 * Each entry corresponds to one table type.  When adding a new table, add its
 * required column IDs here and reference this file from both the table index
 * and its CustomizeColumnsPopover wrapper.
 */

export const SAMPLE_REQUIRED_COLUMN_IDS = ['identifier'] as const;

export const DATA_COLLECTION_REQUIRED_COLUMN_IDS = ['name', 'source'] as const;
