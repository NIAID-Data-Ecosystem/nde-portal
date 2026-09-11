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

export const DATASET_REQUIRED_COLUMN_IDS = [] as const;

export const COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS = [] as const;

/**
 * Column IDs restored when the visible-columns set would otherwise be
 * empty (e.g., after "Clear All", or if every column is individually
 * hidden). Unlike the REQUIRED_COLUMN_IDS above, columns listed here stay
 * individually hideable/movable in the Customize Columns popover. They're
 * only reinstated as a fallback so the table never renders with zero
 * columns.
 */
export const DATASET_FALLBACK_COLUMN_IDS = ['name'] as const;

export const COMPUTATIONAL_TOOL_FALLBACK_COLUMN_IDS = ['name'] as const;
