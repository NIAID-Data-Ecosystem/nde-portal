import { TagInfo } from '.';
import {
  FilterConfig,
  SelectedFilterType,
  SelectedFilterTypeValue,
} from '../../types';
import { capitalize, has, isPlainObject } from 'lodash';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

/**
 * Controls how a selected filter is displayed in the tag.
 */
const getDisplayValue = (
  key: string,
  value: string | SelectedFilterTypeValue,
  values: (string | SelectedFilterTypeValue)[],
  index: number,
  config?: FilterConfig,
): string => {
  if (isPlainObject(value)) {
    const objectKey = Object.keys(value)[0];
    return objectKey.startsWith('-_exists_') ? 'None' : 'Any';
  }

  // Format date ranges
  if (
    key === 'date' &&
    values.length === 2 &&
    typeof values[0] === 'string' &&
    typeof values[1] === 'string'
  ) {
    if (index > 0) return '';
    return `From ${values[0]} to ${values[1]}`;
  }

  // Display names that have it, with both common and scientific forms
  if (typeof value === 'string') {
    if (key.includes('displayName') && value.includes(' | ')) {
      const [commonName, scientificName] = value.split(' | ');
      return `${capitalize(scientificName)} (${capitalize(commonName)})`;
    }

    // Apply any custom label transformation from config
    if (
      (key === '@type' || key === 'conditionsOfAccess') &&
      config?.transformData
    ) {
      return config.transformData({ term: value, count: 0 })?.label || '';
    }
  }

  return String(value);
};

/**
 * Generates a flat list of tag metadata objects from selected filters.
 */
const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;
export const generateTagName = (key: string, config?: FilterConfig): string => {
  if (config?.name) return config.name;
  if (schema?.[key]?.name) return schema[key].name;

  return key;
};

export const generateTags = (
  selectedFilters: SelectedFilterType,
  configMap: Record<string, FilterConfig>,
): TagInfo[] => {
  return Object.entries(selectedFilters).flatMap(([key, values]) => {
    const config = configMap[key];
    const name = generateTagName(key, config);

    if (
      key === 'date' &&
      values.length === 1 &&
      isPlainObject(values[0]) &&
      (has(values[0], '_exists_') || has(values[0], '-_exists_'))
    ) {
      return [];
    }

    // Special handling for date ranges - create one tag for the entire range
    if (
      key === 'date' &&
      values.length === 2 &&
      typeof values[0] === 'string' &&
      typeof values[1] === 'string'
    ) {
      const displayValue = `From ${values[0]} to ${values[1]}`;
      return [
        {
          key: `${key}-range`,
          filterKey: key,
          name,
          value: values, // Pass the entire array as the value
          displayValue,
        },
      ];
    }

    // Generate tag info for each value (non-date or single date)
    return values
      .map((rawValue, index) => {
        const displayValue = getDisplayValue(
          key,
          rawValue,
          values,
          index,
          config,
        );
        if (!displayValue) return null;

        return {
          key: `${key}-${index}`,
          filterKey: key,
          name,
          value: rawValue,
          displayValue,
        };
      })
      .filter(Boolean) as TagInfo[];
  });
};
