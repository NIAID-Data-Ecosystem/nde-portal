/*
 * "Collection Size" is a filter over the `collectionSize` property, which the
 * API indexes as an object with `unitText` and `minValue` sub-fields.
 *
 * The filter writes two keys into the selected-filters object: the unit
 * (an ordinary facet key) and the numeric range (serialized as an unquoted
 * `[min TO max]` range).
 *
 * Keep this module free of *filter configuration* imports. The query-string
 * utility uses RANGE_FILTER_PROPERTIES and must remain independent of filter
 * config so it can be tested in isolation.
 */

import { upperFirst } from 'lodash';

/** Filter id, used as the key into FilterResults. */
export const COLLECTION_SIZE_FILTER_ID = 'collectionSize';

/**
 * Unit field. Mapped as `keyword`, so it can be faceted directly with no
 * `.raw` sub-field.
 */
export const COLLECTION_SIZE_UNIT_FIELD = 'collectionSize.unitText';

/**
 * Numeric field the two range inputs bound.
 *
 * `collectionSize.maxValue` and `collectionSize.value` are present on
 * effectively no records (0 and 1 respectively at time of writing), so
 * `minValue` carries the entire numeric signal and both range endpoints
 * are applied to it.
 */
export const COLLECTION_SIZE_VALUE_FIELD = 'collectionSize.minValue';

/** Combobox option shown when no unit is selected. */
export const COLLECTION_SIZE_ALL_UNITS_LABEL = 'All Units';

/** Group identity of the "All Units" option, which queries no unit at all. */
export const ALL_UNITS_KEY = '';

/**
 * Group identity for a unit term.
 *
 * The vocabulary is uncontrolled and contains case variants of the same unit
 * (`Assays`/`assays`, `Genes`/`genes`, `Studies`/`studies`, ...). They render
 * to an identical label, so they are grouped into one option and queried
 * together rather than listed as duplicate rows.
 */
export const normalizeUnitKey = (term: string): string =>
  term.trim().toLowerCase();

/**
 * Display label for a unit term.
 *
 * Uses `upperFirst` rather than lodash `capitalize`, which lowercases the
 * remainder and would render "UniProt proteomes" as "Uniprot proteomes".
 * Only the display label is transformed; queries use the indexed term.
 */
export const formatUnitLabel = (term: string): string => upperFirst(term);

// `collectionSize` has per-record-type descriptions in schema-definitions.json
// that describe the property rather than the filter, so the tooltip is
// defined here.
export const COLLECTION_SIZE_TOOLTIP =
  'The number of records, datasets, tools, items or pages in the collection.';

/**
 * Filter keys serialized as an unquoted numeric range: `field:[min TO max]`.
 *
 * Distinct from the `date` range, which quotes its endpoints. A value of `*`
 * on either side leaves that end unbounded.
 */
export const RANGE_FILTER_PROPERTIES = new Set([COLLECTION_SIZE_VALUE_FIELD]);

/** Open-ended bound marker used on either side of a range. */
export const RANGE_WILDCARD = '*';

/**
 * Filter keys whose values together represent ONE logical selection.
 *
 * The unit filter holds every case variant of the chosen unit, so the values
 * are shown as a single tag and removed together — one variant left behind
 * would keep filtering the results.
 */
export const GROUPED_VALUE_FILTER_PROPERTIES = new Set([
  COLLECTION_SIZE_UNIT_FIELD,
]);

/** One bar of the collection size histogram: a closed or open-ended range. */
export interface CollectionSizeBucket {
  /** Stable id, also the chart datum's term. */
  key: string;
  min: number;
  /** Absent on the final bucket, which is open-ended. */
  max?: number;
}

/**
 * Histogram buckets, ordered ascending.
 *
 * Decades rather than equal-width bins: collection sizes run from 0 to the
 * billions and the distribution is heavily weighted to single digits, so a
 * linear binning would put nearly every record in the first bin.
 *
 * The counts come from one range query per bucket — `collectionSize.minValue`
 * is neither faceted nor histogram-able (the API's `hist` param only produces
 * date histograms, and a terms facet is capped at 1000 values ordered by
 * count, which drops the entire large-value tail).
 */
export const COLLECTION_SIZE_BUCKETS: CollectionSizeBucket[] = [
  { key: '0-9', min: 0, max: 9 },
  { key: '10-99', min: 10, max: 99 },
  { key: '100-999', min: 100, max: 999 },
  { key: '1000-9999', min: 1000, max: 9999 },
  { key: '10000-99999', min: 10000, max: 99999 },
  { key: '100000-999999', min: 100000, max: 999999 },
  { key: '1000000-9999999', min: 1000000, max: 9999999 },
  { key: `10000000-${RANGE_WILDCARD}`, min: 10000000 },
];

/** The bucket a chart datum's term refers to, if any. */
export const getBucketByKey = (key: string): CollectionSizeBucket | undefined =>
  COLLECTION_SIZE_BUCKETS.find(bucket => bucket.key === key);

/**
 * A bucket's endpoints as filter values, with `*` for the open end. Matches
 * what the range inputs write, so a bar click and a typed range are
 * indistinguishable downstream.
 */
export const getBucketRangeValues = (
  bucket: CollectionSizeBucket,
): string[] => [
  String(bucket.min),
  bucket.max === undefined ? RANGE_WILDCARD : String(bucket.max),
];
