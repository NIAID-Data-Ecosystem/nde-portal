import {
  FormattedResource,
  Funder,
  Funding,
  IncludedInDataCatalog,
  SampleAggregate,
  SampleCollection,
  UsageInfo,
} from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';

/*
Row shaping for the Search tables: turns a FormattedResource's fields into the
plain shapes the shared cells take (src/components/table/data-table/cells).
Used by the column accessors in ./columns.tsx and ./tables/*.
*/

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

export type SampleEntry = {
  count: number;
  kind: 'experimental' | 'population';
};

/**
 * Reduce the record's `sample` to the single count the table shows, along with
 * which kind of sample it is. Discriminates on the top-level `@type`, the same
 * way the card's sample pill does: a SampleCollection is an experimental count,
 * a SampleAggregate a population count. Returns null when there is no count to
 * show.
 */
export const toSampleEntry = (
  sample?: SampleAggregate | SampleCollection | null,
): SampleEntry | null => {
  if (!sample) return null;

  if (sample['@type'] === 'SampleCollection') {
    const count = (sample as SampleCollection).numberOfItems?.value;
    return count == null ? null : { count, kind: 'experimental' };
  }

  const { sampleQuantity } = sample as SampleAggregate;
  const count =
    sampleQuantity && !Array.isArray(sampleQuantity)
      ? sampleQuantity.value
      : undefined;

  return count == null ? null : { count, kind: 'population' };
};

/**
 * Usage info (a single object or an array) as `{ label, url }` entries. An entry
 * with no name reads "Usage Agreement", as on the card.
 */
export const toUsageInfoEntries = (
  usageInfo?: UsageInfo | UsageInfo[] | null,
): { label: string; url: string | null }[] =>
  toArray(usageInfo)
    .map(info => ({
      label: info?.name || 'Usage Agreement',
      url: info?.url ?? null,
    }))
    .filter(entry => entry.label || entry.url);

/**
 * Software help as `{ label, url }` entries, by the card's rules: entries
 * without a url are dropped, an array `name` is joined (in practice it always
 * arrives as one, e.g. `["General"]`, despite its declared type), and the url
 * stands in when no name is left.
 */
export const toSoftwareHelpEntries = (
  softwareHelp?: FormattedResource['softwareHelp'] | null,
): { label: string; url: string }[] =>
  toArray<{ name?: string | string[]; url?: string }>(
    softwareHelp as { name?: string | string[]; url?: string }[],
  ).flatMap(entry => {
    if (!entry?.url) return [];
    const name = Array.isArray(entry.name)
      ? entry.name.filter(Boolean).join(', ')
      : entry.name;
    return [{ label: name || entry.url, url: entry.url }];
  });
