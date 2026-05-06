import { Column } from 'src/components/table';
import { FormattedResource } from 'src/utils/api/types';

/**
 * Extend the generic Table Column with a stable `id` for localStorage
 * persistence and an optional API sort field.
 *
 * All per-table column definition arrays (ALL_SAMPLE_COLUMNS,
 * ALL_DATA_COLLECTION_COLUMNS, …) should use this interface so that the
 * generic ResultsTable component can operate on them uniformly.
 */
export interface BaseColumn extends Column {
  /** Stable identifier used for localStorage persistence. */
  id: string;
  /**
   * The API sort field to use when this column's sort toggle is clicked.
   * `null` means the column is not server-sortable.
   */
  apiSortField: string | null;
}

export interface ResultsTableProps<TColumn extends BaseColumn> {
  /** Full master list of columns for this table type. */
  columns: TColumn[];
  /** Raw API results to display. */
  results: FormattedResource[];
  /** Whether data is still loading. */
  isLoading: boolean;
  /**
   * Transform a FormattedResource into the flat row object that getCells
   * receives. Keep identifier resolution and catalog URL logic per-table.
   */
  toRow: (resource: FormattedResource) => Record<string, unknown>;
  /**
   * Per-table cell renderer passed straight through to the generic Table
   * component.
   */
  getCells: (props: {
    column: Column;
    data: Record<string, unknown>;
    isLoading?: boolean;
  }) => React.ReactNode;
  /** Accessible label for the table element. */
  ariaLabel: string;
  /** Accessible caption for the table element. */
  caption: string;
  /**
   * Column IDs that must always be visible (never toggled off).
   * Used as the fallback when visibleColumnIds resolves to an empty array.
   */
  requiredColumnIds: string[];
  /**
   * IDs of columns that should currently be visible.
   * When undefined, all columns are shown.
   */
  visibleColumnIds?: string[];
  /**
   * Full ordered list of all column IDs (visible + hidden).
   * Visible columns are rendered in this order.
   * When undefined, the master column list order is used.
   */
  columnOrder?: string[];
  /**
   * The currently active API sort string (e.g. `"name.raw"` or `"-date"`).
   * A leading `-` indicates descending order.
   */
  currentSort?: string;
  /**
   * Called when the user clicks a sortable column header arrow.
   * Receive the API sort field and the desired direction.
   */
  onSortChange?: (apiField: string, ascending: boolean) => void;
}
