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
