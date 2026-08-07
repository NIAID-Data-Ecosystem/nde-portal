import { Funder, Funding, IncludedInDataCatalog } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
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

// Row-shaping helpers

export type CatalogEntry = { name: string; url: string | null };
export type FunderEntry = { name: string; identifier: string | null };
export type FundingIdEntry = { identifier: string; url: string | null };
export type LicenseEntry = { title: string; url: string | null };

// Normalize a value the API may return as either a single item or an array.
export const toArray = <T>(value: T | T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : value ? [value] : [];

/**
 * Reduce `includedInDataCatalog` to the first catalog as `{ name, url }`,
 * preferring the archived URL over the catalog's own URL.
 */
export const toCatalogEntry = (
  includedInDataCatalog?: IncludedInDataCatalog | IncludedInDataCatalog[],
): CatalogEntry | null => {
  const catalog = toArray(includedInDataCatalog)[0] ?? null;
  if (!catalog) return null;

  const archivedAt = catalog.archivedAt;
  const url =
    (Array.isArray(archivedAt) ? archivedAt[0] : archivedAt) ??
    catalog.url ??
    null;

  return { name: catalog.name ?? '', url };
};

/**
 * Flatten `funding[].funder[]` into named funders, collapsing duplicates by
 * name and preferring the variant that carries an identifier so the name can
 * link out. Returns null when there is nothing to show.
 */
export const toFunderEntries = (
  funding?: Funding | Funding[] | null,
): FunderEntry[] | null => {
  const entries = toArray(funding)
    .flatMap(entry => toArray(entry?.funder))
    .map((funder: Funder) => ({
      name: funder?.name ?? '',
      identifier: funder?.identifier ?? null,
    }))
    .filter(entry => entry.name);

  const byName = new Map<string, FunderEntry>();
  entries.forEach(entry => {
    const existing = byName.get(entry.name);
    if (!existing || (!existing.identifier && entry.identifier)) {
      byName.set(entry.name, entry);
    }
  });

  const deduped = Array.from(byName.values());
  return deduped.length > 0 ? deduped : null;
};

// Flatten `funding[]` into its identifiers, each linked to its funding URL.
export const toFundingIdEntries = (
  funding?: Funding | Funding[] | null,
): FundingIdEntry[] | null => {
  const entries = toArray(funding)
    .map(entry => ({
      identifier: entry?.identifier ?? '',
      url: entry?.url ?? null,
    }))
    .filter(entry => entry.identifier);

  return entries.length > 0 ? entries : null;
};

// Format a license string the way the cards do, via `formatLicense`.
export const toLicenseEntry = (
  license?: string | null,
): LicenseEntry | null => {
  if (!license) return null;
  const formatted = formatLicense(license);
  if (!formatted.title && !formatted.url) return null;
  return { title: formatted.title, url: formatted.url || null };
};

/**
 * Join term `name` values that arrive as arrays.
 *
 * Several DefinedTerm-shaped properties (measurementTechnique, input, output,
 * featureList) can carry an array `name` even though their types declare a
 * string, and the shared DefinedTerm cell renders an array name as empty.
 * The cards join with ', ', so do the same here.
 */
export const normalizeTermNames = <T extends { name?: string | string[] }>(
  terms?: T[] | null,
): T[] | null | undefined =>
  Array.isArray(terms)
    ? terms.map(term => ({
        ...term,
        name: Array.isArray(term?.name) ? term.name.join(', ') : term?.name,
      }))
    : terms;

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
