import {
  CollectionSize,
  FormattedResource,
  Funder,
  Funding,
  IncludedInDataCatalog,
  IsBasedOn,
  SampleAggregate,
  SampleCollection,
  UsageInfo,
} from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';

/*
Row shaping for the Search tables: turns a FormattedResource's fields into the
plain shapes the shared cells take (src/components/table/cells).
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
 * Every catalog in `includedInDataCatalog` as `{ name, url }`, preferring each
 * one's archived URL over its own URL.
 */
export const toCatalogEntries = (
  includedInDataCatalog?: IncludedInDataCatalog | IncludedInDataCatalog[],
): CatalogEntry[] =>
  toArray(includedInDataCatalog).map(catalog => {
    const archivedAt = catalog?.archivedAt;
    const url =
      (Array.isArray(archivedAt) ? archivedAt[0] : archivedAt) ??
      catalog?.url ??
      null;
    return { name: catalog?.name ?? '', url };
  });

/** The first catalog in `includedInDataCatalog` (see `toCatalogEntries`). */
export const toCatalogEntry = (
  includedInDataCatalog?: IncludedInDataCatalog | IncludedInDataCatalog[],
): CatalogEntry | null => toCatalogEntries(includedInDataCatalog)[0] ?? null;

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

/**
 * Topic categories by name, deduplicated and sorted the way the result card
 * lists them (`SearchableItems`).
 */
export const toTopicCategoryNames = (
  topicCategory?: FormattedResource['topicCategory'],
): string[] => {
  const names = toArray(topicCategory)
    .map(category => category?.name)
    .filter((name): name is string => typeof name === 'string' && !!name);
  return Array.from(new Set(names)).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
};

/** Based On: the names of the `isBasedOn` entries that are Actions. */
export const toBasedOnActionNames = (
  isBasedOn?: FormattedResource['isBasedOn'] | IsBasedOn | null,
): string[] =>
  toArray<IsBasedOn>(isBasedOn as IsBasedOn | IsBasedOn[] | null)
    .filter(entry => entry?.['@type'] === 'Action' && entry?.name)
    .map(entry => entry.name as string);

/**
 * Collection size as text, one per entry: "<minValue>+ <unit, lowercased>"
 * ("1000+ samples"), with either part alone when the other is missing.
 */
export const toCollectionSizes = (
  collectionSize?: CollectionSize | CollectionSize[] | null,
): string[] =>
  toArray<CollectionSize>(collectionSize).flatMap(entry => {
    const amount = entry?.minValue != null ? `${entry.minValue}+` : null;
    const unit = entry?.unitText ? entry.unitText.toLowerCase() : null;
    return amount || unit ? [[amount, unit].filter(Boolean).join(' ')] : [];
  });

/**
 * A sample's identifier: its `identifier` when that's a single non-empty
 * string, otherwise its `_id` without the leading underscore, upper-cased.
 */
export const toSampleIdentifier = (resource: FormattedResource): string => {
  const identifier = (resource as { identifier?: unknown }).identifier;
  if (typeof identifier === 'string' && identifier) return identifier;
  return resource._id?.replace(/^_/, '').toUpperCase() ?? '';
};
