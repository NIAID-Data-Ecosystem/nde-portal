import {
  FormattedResource,
  Funder,
  Funding,
  IncludedInDataCatalog,
} from 'src/utils/api/types';
import { BaseColumn, CatalogEntry, FunderEntry, FundingIdEntry } from './types';

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

/** Wrap a value that may be a single object, an array, or absent into an array. */
const toArray = <T>(value: T | T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : value ? [value] : [];

/**
 * Normalize `includedInDataCatalog` (which the API returns as either a single
 * object or an array) into a flat, column-ready list. Prefers the archived
 * snapshot URL over the catalog's own URL when one is available.
 */
export const toCatalogEntries = (
  resource: FormattedResource,
): CatalogEntry[] => {
  const catalogs = toArray<IncludedInDataCatalog>(
    resource.includedInDataCatalog,
  );

  return catalogs.map(catalog => {
    const archivedAt = catalog?.archivedAt;
    const url =
      (Array.isArray(archivedAt) ? archivedAt[0] : archivedAt) ??
      catalog?.url ??
      null;
    return { name: catalog?.name ?? '', url };
  });
};

/**
 * Flatten `funding[].funder[]` into a deduped, column-ready list of funders.
 * Duplicate names collapse to the variant carrying an `identifier` so the name
 * can link out.
 */
export const toFunderEntries = (resource: FormattedResource): FunderEntry[] => {
  const funderList: FunderEntry[] = toArray<Funding>(resource.funding)
    .flatMap(funding => toArray<Funder>(funding?.funder))
    .map(funder => ({
      name: funder?.name ?? '',
      identifier: funder?.identifier ?? null,
    }))
    .filter(entry => entry.name);

  const funderByName = new Map<string, FunderEntry>();
  funderList.forEach(entry => {
    const existing = funderByName.get(entry.name);
    if (!existing || (!existing.identifier && entry.identifier)) {
      funderByName.set(entry.name, entry);
    }
  });

  return Array.from(funderByName.values());
};

/** Flatten `funding[]` into a column-ready list of funding identifiers. */
export const toFundingIdEntries = (
  resource: FormattedResource,
): FundingIdEntry[] =>
  toArray<Funding>(resource.funding)
    .map(funding => ({
      identifier: funding?.identifier ?? '',
      url: funding?.url ?? null,
    }))
    .filter(entry => entry.identifier);

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
