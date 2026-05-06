import { BaseColumn } from './types';

/**
 * Convenience helper that returns a consistent fixed-width prop object for
 * table columns.  Pass the result directly into a column definition's `props`
 * field:
 *
 *   props: withWidth('180px')
 */
export const withWidth = (width: string) => ({
  minW: width,
  maxW: width,
  w: width,
});

/**
 * Derive the controlled-sort props that the generic `Table` component
 * understands from the raw API sort string (e.g. `"-name.raw"`).
 *
 * @param currentSort  The raw sort string from URL / pagination state.
 * @param columns      The master column list for the table being sorted.
 *
 * @returns `{ controlledSortProperty, controlledSortAsc }` where
 * `controlledSortProperty` is the matching column `property` value, or `null`
 * when no column matches the sort field.
 */
export const deriveControlledSortProps = <TColumn extends BaseColumn>(
  currentSort: string,
  columns: TColumn[],
): { controlledSortProperty: string | null; controlledSortAsc: boolean } => {
  const isDesc = currentSort.startsWith('-');
  const apiField = isDesc ? currentSort.slice(1) : currentSort;

  const matchingColumn = columns.find(col => col.apiSortField === apiField);

  return {
    controlledSortProperty: matchingColumn?.property ?? null,
    controlledSortAsc: !isDesc,
  };
};

/**
 * Given a column `property` name, returns the API sort field string that
 * should be sent to the server, or `null` if the column is not
 * server-sortable.
 *
 * @param property  The column `property` value (matches the row data key).
 * @param columns   The master column list for the table being sorted.
 */
export const getApiSortFieldForProperty = <TColumn extends BaseColumn>(
  property: string,
  columns: TColumn[],
): string | null => {
  const col = columns.find(c => c.property === property);
  return col?.apiSortField ?? null;
};
