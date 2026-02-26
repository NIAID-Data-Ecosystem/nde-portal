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
import { Column } from 'src/components/table';
import { SAMPLE_AGGREGATE_COLUMNS } from './config';
/**
 * Format unit text:
 * - Lowercase all characters.
 * - Replace underscores (e.g., "CELL_COUNT") with spaces.
 */
export const formatUnitText = (unit: string | undefined) => {
  if (!unit) return '';
  const unit_str = unit.toLowerCase().replace(/_/g, ' ');
  return unit_str.charAt(unit_str.length - 1) === 's'
    ? unit_str
    : `${unit_str}s`;
};

/**
 * Format a numeric "value" field.
 * Supports:
 * - Exact number.
 * - Min / Max (range).
 * - Only min (>=)
 * - Only max (<=)
 */
export const formatNumericValue = ({
  value,
  minValue,
  maxValue,
}: {
  value?: number;
  minValue?: number;
  maxValue?: number;
}) => {
  if (value != null) {
    return value.toLocaleString();
  }

  if (minValue != null && maxValue != null) {
    // If min == max, show single number
    if (minValue === maxValue) {
      return minValue.toLocaleString();
    }
    return `${minValue.toLocaleString()} - ${maxValue.toLocaleString()}`;
  }

  if (minValue != null) {
    return `>= ${minValue.toLocaleString()}`;
  }

  if (maxValue != null) {
    return `<= ${maxValue.toLocaleString()}`;
  }

  return '';
};

export const formatTerm = (term: string) =>
  term.charAt(0).toUpperCase() + term.slice(1);

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

interface SamplePropertyColumns extends Column {
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
      normalizeAdditionalProperty(sample).map(p => p.propertyID),
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
): Array<{ title: string; property: string; isSortable?: boolean }> => {
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

  // Assemble final columns: Sample ID, non-uniform, uniform, additionalProperty.
  return [
    { title: 'Sample ID', property: 'identifier', isSortable: true },
    ...nonUniformColumns.map(col => ({ ...col, isSortable: false })),
    ...uniformColumns.map(col => ({ ...col, isSortable: false })),
    ...additionalPropertyColumns.map(col => ({ ...col, isSortable: false })),
  ];
};

/**
 * Build the rows array for the fetched SampleCollection items table.
 * The `identifier` field is shaped as `{ identifier, url }` so the existing
 * DefinedTermCell renderer can display it as an external link.
 *
 * Each `additionalProperty` entry is flattened into the row under the
 * namespaced key `additionalProperty__<propertyID>` so the column renderer
 * can pick it up via `props.data?.[props.column.property]`.
 */
export const getSampleCollectionItemsRows = (
  samples: SampleAggregate[],
): Record<string, unknown>[] =>
  samples.map(sample => {
    const additionalPropertyEntries = Object.fromEntries(
      normalizeAdditionalProperty(sample).map(({ propertyID, value }) => [
        toAdditionalPropertyKey(propertyID),
        value,
      ]),
    );

    return {
      ...sample,
      identifier: {
        identifier: sample.identifier ?? (sample as any)._id,
        url: sample.url ?? '',
      },
      ...additionalPropertyEntries,
    };
  });
