import {
  getValueByPath,
  hasNonEmptyValue,
} from 'src/components/resource-sections/helpers';
import {
  AdditionalProperty,
  SampleAggregate,
  SampleCollection,
} from 'src/utils/api/types';
import { formatSampleLabelFromProperty } from 'src/utils/formatting/formatSample';

import { SAMPLE_AGGREGATE_COLUMNS } from './config';

// The term formatters live with the shared table cells; re-exported for this
// folder's existing imports.
export {
  formatNumericValue,
  formatTerm,
  formatUnitText,
} from 'src/components/table/utils/terms';

/**
 * Format a propertyID string into a human-readable column title.
 * Replace underscores with spaces and capitalize each word.
 */
export const formatPropertyId = (propertyId: string): string =>
  propertyId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

/**
 * Namespaced column property key for an additionalProperty entry.
 * Using a prefix guarantees no collision with top-level SampleAggregate fields.
 */
const ADDITIONAL_PROPERTY_PREFIX = 'additionalProperty__' as const;

type AdditionalPropertyColumnKey =
  `${typeof ADDITIONAL_PROPERTY_PREFIX}${string}`;

const toAdditionalPropertyKey = (
  propertyId: string,
): AdditionalPropertyColumnKey => `${ADDITIONAL_PROPERTY_PREFIX}${propertyId}`;

/**
 * Normalize additionalProperty to always be an array.
 * The API can return either a single object or an array depending on the record.
 */
const normalizeAdditionalProperty = (
  sample: SampleAggregate,
): AdditionalProperty[] => {
  const raw = sample.additionalProperty;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
};

/**
 * Retrieve the value for a given propertyID from a sample's
 * additionalProperty array, or undefined if absent.
 */
const getAdditionalPropertyValue = (
  sample: SampleAggregate,
  propertyId: string,
): AdditionalProperty['value'] | undefined =>
  normalizeAdditionalProperty(sample).find(p => p.propertyID === propertyId)
    ?.value;

/** A column of a sample table, before it becomes a DataTable column. */
export interface SampleColumn {
  title: string;
  /** The row field the column sorts on; also its id. */
  property: string;
  /**
   * The row field the column shows, when it isn't `property`: Sample ID shows
   * the linked `identifier` ({ identifier, url }) but sorts on the plain
   * `_identifierSort`.
   */
  valueProperty?: string;
  isSortable?: boolean;
}

interface SamplePropertyColumns extends SampleColumn {
  values: any;
  includedProperties: string[];
  key: string;
}

/*
 * Generate table rows based on available sample properties.
 * Only include rows where at least one configured property has a non-empty value.
 */
export const getAvailableSamplePropertyColumns = (
  data: SampleAggregate | SampleCollection,
  properties = SAMPLE_AGGREGATE_COLUMNS,
): SamplePropertyColumns[] => {
  return properties.flatMap(config => {
    // Get values for all defined paths (allows for dot notation).
    const valuesForProps = config.includedProperties.map(path =>
      getValueByPath(data, path),
    );
    // Check if the associated values are non-empty.
    const hasValue = valuesForProps.some(v => hasNonEmptyValue(v));

    // If no value, omit this row entirely
    if (!hasValue) return [];

    const values =
      valuesForProps.length === 1 ? valuesForProps[0] : valuesForProps;

    return [
      {
        key: config.key,
        title: config?.title || formatSampleLabelFromProperty(config.key),
        property: config.key,
        isSortable: config?.isSortable || false,
        values: config.transform ? config.transform(values) : values,
        includedProperties: config.includedProperties,
      },
    ];
  });
};

/**
 * Produce a key for a DefinedTerm-like value used for
 * sameness comparison. Use identifier when present, fall back to name.
 */
const termKey = (
  term: { identifier?: string; name?: string } | string,
): string => {
  if (typeof term === 'string') return term.trim().toLowerCase();
  return (term.identifier ?? term.name ?? '').trim().toLowerCase();
};

/**
 * Produce a stable string representing the full value of a field on one sample.
 * Arrays are sorted so element-order differences don't count as "different".
 * Returns a special marker for null/undefined to distinguish from empty strings.
 */
const fieldSignature = (value: unknown): string => {
  if (value == null) return '__NULL__';
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '__EMPTY_ARRAY__';

    // Check if array contains DefinedTerm objects
    const allAreDefinedTerms = value.every(
      item =>
        item != null &&
        typeof item === 'object' &&
        ('identifier' in item || 'name' in item) &&
        (!('@type' in item) || (item as any)['@type'] !== 'QuantitativeValue'),
    );

    if (allAreDefinedTerms) {
      // Use termKey for DefinedTerm-like objects
      return value
        .map(v => termKey(v as { identifier?: string; name?: string }))
        .sort()
        .join('|');
    }

    // For other arrays, use full JSON comparison
    try {
      return JSON.stringify(
        value.map(item => {
          if (item != null && typeof item === 'object') {
            // Sort keys for stable comparison
            const sorted: Record<string, unknown> = {};
            Object.keys(item)
              .sort()
              .forEach(key => {
                sorted[key] = (item as Record<string, unknown>)[key];
              });
            return sorted;
          }
          return item;
        }),
      );
    } catch {
      return JSON.stringify(value);
    }
  }

  if (typeof value === 'object') {
    // Check if it's a DefinedTerm-like object
    if (
      ('identifier' in value || 'name' in value) &&
      (!('@type' in value) || (value as any)['@type'] !== 'QuantitativeValue')
    ) {
      return termKey(value as { identifier?: string; name?: string });
    }

    // For complex objects, use full JSON comparison
    try {
      const sorted: Record<string, unknown> = {};
      Object.keys(value)
        .sort()
        .forEach(key => {
          sorted[key] = (value as Record<string, unknown>)[key];
        });
      return JSON.stringify(sorted);
    } catch {
      return String(value);
    }
  }

  return String(value).trim().toLowerCase();
};

/**
 * Fields that should be hidden when every sample in the collection shares
 * the same value.
 */
const UNIFORM_HIDE_PROPS = new Set<string>([
  'healthCondition',
  'infectiousAgent',
  'species',
]);

/**
 * Collect all distinct propertyIDs that appear across the given samples.
 */
const collectAdditionalPropertyIds = (samples: SampleAggregate[]): string[] => [
  ...new Set(
    samples.flatMap(sample =>
      normalizeAdditionalProperty(sample)
        .map(p => p.propertyID)
        .filter((propertyID): propertyID is string => Boolean(propertyID)),
    ),
  ),
];

/**
 * Build the columns array for the fetched SampleCollection items table.
 *
 * Rules applied:
 *   R1. Omit any column where no sample has a value.
 *   R2. Omit healthCondition / infectiousAgent / species when all values
 *       are identical across samples.
 *   R3. additionalProperty columns: shown only when values differ across
 *       samples (same rule as UNIFORM_HIDE_PROPS); hidden when uniform.
 *
 * Column ordering:
 *   1. Sample ID
 *   2. Non-uniform columns (sorted alphabetically by display title)
 *   3. Uniform columns (sorted alphabetically by display title)
 *   4. Non-uniform additionalProperty columns (sorted alphabetically by title)
 *
 */
export const getSampleCollectionItemsColumns = (
  samples: SampleAggregate[],
): SampleColumn[] => {
  const nonUniformColumns: Array<{ title: string; property: string }> = [];
  const uniformColumns: Array<{ title: string; property: string }> = [];

  for (const config of SAMPLE_AGGREGATE_COLUMNS) {
    const { key, includedProperties, transform } = config;

    // Skip columns where no sample has a non-empty value.
    const anyHasValue = samples.some(sample => {
      const valuesForProps = includedProperties.map(path =>
        getValueByPath(sample, path),
      );
      return valuesForProps.some(v => hasNonEmptyValue(v));
    });
    if (!anyHasValue) continue;

    // Check if all values are uniform (identical across samples).
    const signatures = samples.map(sample => {
      const valuesForProps = includedProperties.map(path =>
        getValueByPath(sample, path),
      );
      const values =
        valuesForProps.length === 1 ? valuesForProps[0] : valuesForProps;
      const finalValue = transform ? transform(values) : values;
      return fieldSignature(finalValue);
    });

    const first = signatures[0];
    const uniform = signatures.every(sig => sig === first);

    // For the three special fields, skip entirely if uniform.
    if (UNIFORM_HIDE_PROPS.has(key) && uniform) continue;

    const title = formatSampleLabelFromProperty(key);

    if (uniform) {
      uniformColumns.push({ title, property: key });
    } else {
      nonUniformColumns.push({ title, property: key });
    }
  }

  // Sort each group alphabetically by display title.
  nonUniformColumns.sort((a, b) => a.title.localeCompare(b.title));
  uniformColumns.sort((a, b) => a.title.localeCompare(b.title));

  // For each distinct propertyID, apply the same uniform-hide rule:
  // render a column only when at least one sample differs (including missing = __NULL__).
  const additionalPropertyColumns: Array<{ title: string; property: string }> =
    collectAdditionalPropertyIds(samples)
      .filter(propertyId => {
        const signatures = samples.map(sample =>
          fieldSignature(getAdditionalPropertyValue(sample, propertyId)),
        );
        return !signatures.every(sig => sig === signatures[0]);
      })
      .map(propertyId => ({
        title: formatPropertyId(propertyId),
        property: toAdditionalPropertyKey(propertyId),
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

  // Assemble final columns: Sample ID, non-uniform, uniform,
  // additionalProperty. Sample ID sorts on '_identifierSort' (a plain string
  // field added to each row) and shows the { identifier, url } object, as a
  // link. Its id stays '_identifierSort', so it can't collide with a property
  // column keyed 'identifier'.
  return [
    {
      title: 'Sample ID',
      property: '_identifierSort',
      valueProperty: 'identifier',
      isSortable: true,
    },
    ...nonUniformColumns.map(col => ({ ...col, isSortable: false })),
    ...uniformColumns.map(col => ({ ...col, isSortable: false })),
    ...additionalPropertyColumns.map(col => ({ ...col, isSortable: false })),
  ];
};

/**
 * Build the rows array for the fetched SampleCollection items table.
 * The `identifier` field is shaped as `{ identifier, url }` so the shared term
 * cell can display it as an external link.
 *
 * Each `additionalProperty` entry is flattened into the row under the
 * namespaced key `additionalProperty__<propertyID>`, the property of its
 * column.
 *
 * `_identifierSort` is a plain string copy of the identifier, which the Sample
 * ID column sorts on.
 */
export const getSampleCollectionItemsRows = (
  samples: SampleAggregate[],
): Record<string, unknown>[] =>
  samples.map(sample => {
    const additionalPropertyEntries = Object.fromEntries(
      normalizeAdditionalProperty(sample)
        // Columns are keyed by propertyID, so an entry without one has no
        // column to fill.
        .filter(({ propertyID }) => Boolean(propertyID))
        .map(({ propertyID, value }) => [
          toAdditionalPropertyKey(propertyID as string),
          value,
        ]),
    );

    // When identifier is an array of strings, fall back to _id (with the
    // leading underscore stripped).
    const rawIdentifier = sample.identifier;
    const resolvedIdentifier = Array.isArray(rawIdentifier)
      ? sample._id?.replace(/^_/, '').toUpperCase() ?? ''
      : rawIdentifier ?? sample._id ?? '';

    return {
      ...sample,
      identifier: {
        identifier: resolvedIdentifier,
        url: sample.url ?? '',
      },
      _identifierSort: resolvedIdentifier,
      ...additionalPropertyEntries,
    };
  });
