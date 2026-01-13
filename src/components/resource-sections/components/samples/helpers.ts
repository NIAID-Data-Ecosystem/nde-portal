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
