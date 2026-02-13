import {
  getValueByPath,
  hasNonEmptyValue,
} from 'src/components/resource-sections/helpers';
import { SampleAggregate, SampleCollection } from 'src/utils/api/types';
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

interface SamplePropertyColumns extends Column {
  values: any;
  includedProperties: string[];
  key: string;
}

/*
 * Generate table rows based on available sample properties.
 * Only includes rows where at least one configured property has a non-empty value.
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
 * sameness comparison. Use identifier
 * when present, fall back to name.
 */
const termKey = (
  term: { identifier?: string; name?: string } | string,
): string => {
  if (typeof term === 'string') return term.trim().toLowerCase();
  return (term.identifier ?? term.name ?? '').trim().toLowerCase();
};

/**
 * Produce a string representing the full value of a field on one sample.
 * Arrays are sorted so element-order differences don't count as "different".
 */
const fieldSignature = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (Array.isArray(value)) {
    return value
      .map(v => termKey(v as { identifier?: string; name?: string } | string))
      .sort()
      .join('|');
  }
  if (typeof value === 'object') {
    return termKey(value as { identifier?: string; name?: string });
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
 * Builds the columns array for the fetched SampleCollection items table.
 * The identifier column is always first and always shown.
 * Remaining columns follow the order defined in SAMPLE_AGGREGATE_COLUMNS.
 */
export const getSampleCollectionItemsColumns = (
  samples: SampleAggregate[],
): Array<{ title: string; property: string; isSortable?: boolean }> => {
  const columns: Array<{
    title: string;
    property: string;
    isSortable?: boolean;
  }> = [{ title: 'Sample ID', property: 'identifier', isSortable: true }];

  for (const { key } of SAMPLE_AGGREGATE_COLUMNS) {
    // Skip columns where no sample has a non-empty value.
    const anyHasValue = samples.some(sample =>
      hasNonEmptyValue(getValueByPath(sample, key)),
    );
    if (!anyHasValue) continue;

    // Skip if all values are identical.
    if (UNIFORM_HIDE_PROPS.has(key)) {
      const first = fieldSignature(getValueByPath(samples[0], key));
      const uniform = samples.every(
        sample => fieldSignature(getValueByPath(sample, key)) === first,
      );
      if (uniform) continue;
    }

    columns.push({
      title: formatSampleLabelFromProperty(key),
      property: key,
      isSortable: false,
    });
  }

  return columns;
};

/**
 * Builds the rows array for the fetched SampleCollection items table.
 * The `identifier` field is shaped as `{ identifier, url }` so the existing
 * DefinedTermCell renderer can display it as an external link.
 */
export const getSampleCollectionItemsRows = (
  samples: SampleAggregate[],
): Record<string, unknown>[] => {
  return samples.map(sample => ({
    ...sample,
    identifier: {
      identifier: sample.identifier ?? (sample as any)._id,
      url: (sample as any).url ?? '',
    },
  }));
};
