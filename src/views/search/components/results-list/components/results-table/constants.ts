/**
 * Column IDs that are always visible and cannot be toggled off in the
 * Customize Columns popover, for the Search tables still on the legacy
 * `ResultsTable`. (Tables on the shared DataTable mark such columns
 * `hideable: false` instead; see ./tables.)
 */

export const SAMPLE_REQUIRED_COLUMN_IDS = ['identifier'] as const;

export const DATA_COLLECTION_REQUIRED_COLUMN_IDS = ['name', 'source'] as const;
