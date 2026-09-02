import { TagInfo } from '.';

import { capitalize, has, isPlainObject } from 'lodash';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import {
  FilterConfig,
  SelectedFilterType,
  SelectedFilterValueType,
} from '../../types';
import {
  APIResourceType,
  formatAPIResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { SHOW_FILTER_SPECIFIED_UNSPECIFIED_LABELS } from 'src/utils/feature-flags';
import {
  GROUPED_VALUE_FILTER_PROPERTIES,
  RANGE_FILTER_PROPERTIES,
  RANGE_WILDCARD,
} from 'src/views/search/config/collection-size';
// Generic numeric formatter — renders "1,000 - 50,000", ">= 1,000" or
// "<= 50,000" — already covered by tests alongside its own module.
import { formatNumericValue } from 'src/components/resource-sections/components/samples/helpers';

// Constants
const DISPLAY_NAME_SEPARATOR = ' | ';
const DATE_FILTER_KEY = 'date';
const EXISTS_PREFIX = '_exists_';
const NOT_EXISTS_PREFIX = '-_exists_';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

// Type guards
const isStringValue = (value: unknown): value is string =>
  typeof value === 'string';

const isObjectValue = (value: unknown): value is Record<string, unknown> =>
  isPlainObject(value);

const coerceTagValues = (values: unknown): SelectedFilterValueType[] => {
  if (Array.isArray(values)) {
    return values;
  }

  if (typeof values === 'string') {
    return values ? [values] : [];
  }

  if (isObjectValue(values)) {
    return [values as { [key: string]: string[] }];
  }

  return [];
};

const isDateRangeValues = (
  values: SelectedFilterValueType[],
): values is [string, string] =>
  values.length === 2 && isStringValue(values[0]) && isStringValue(values[1]);

// Helper Functions

// Formats a display name with common and scientific names
const formatDisplayName = (value: string): string => {
  if (!value.includes(DISPLAY_NAME_SEPARATOR)) {
    return value;
  }

  const [commonName, scientificName] = value.split(DISPLAY_NAME_SEPARATOR);
  return `${capitalize(scientificName)} (${capitalize(commonName)})`;
};

// Formats a date range for display
const formatDateRange = (startDate: string, endDate: string): string =>
  `From ${startDate} to ${endDate}`;

// Applies custom label transformation from filter config
const applyConfigTransform = (value: string, config?: FilterConfig): string => {
  if (!config?.transformData) {
    return value;
  }

  return config.transformData({ term: value, count: 0 })?.label || value;
};

// Controls how a selected filter is displayed in the tag
const getDisplayValue = (
  key: string,
  value: string | SelectedFilterValueType,
  values: SelectedFilterValueType[],
  index: number,
  config?: FilterConfig,
): string => {
  // Handle object values (exists/not exists queries)
  if (isObjectValue(value)) {
    const objectKey = Object.keys(value)[0];
    const isNotExists = objectKey?.startsWith(NOT_EXISTS_PREFIX);
    if (SHOW_FILTER_SPECIFIED_UNSPECIFIED_LABELS) {
      return isNotExists ? 'Unspecified' : 'Specified';
    }
    return isNotExists ? 'None' : 'Any';
  }

  // Handle date ranges (skip subsequent values in range)

  if (key === DATE_FILTER_KEY && isDateRangeValues(values)) {
    return index === 0 ? formatDateRange(values[0], values[1]) : '';
  }

  // Handle string values
  if (isStringValue(value)) {
    // Format display names
    if (key.includes('displayName')) {
      return formatDisplayName(value);
    }
    if (config?.transformData) {
      return applyConfigTransform(value, config);
    }
    // Apply type formatting for @type filters
    if (key === '@type') {
      return formatAPIResourceTypeForDisplay(value as APIResourceType);
    }
  }

  return String(value);
};

// Checks if a filter represents a date exists/not exists query
const stripDateExistsQuery = (values: SelectedFilterValueType[]) => {
  return values.filter(
    value =>
      !isObjectValue(value) &&
      !has(value, EXISTS_PREFIX) &&
      !has(value, NOT_EXISTS_PREFIX),
  );
};

/**
 * Display string for a numeric range filter. `*` marks an unbounded end, so
 * an endpoint carrying it is left out of the formatted value.
 */
const formatNumericRange = (values: SelectedFilterValueType[]) => {
  const toNumber = (value: SelectedFilterValueType | undefined) => {
    if (!isStringValue(value) || value === RANGE_WILDCARD) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  return formatNumericValue({
    minValue: toNumber(values[0]),
    maxValue: toNumber(values[1]),
  });
};

// Creates a tag info object for a numeric range, so both endpoints are
// removed together rather than one at a time.
const createNumericRangeTag = (
  key: string,
  name: string,
  values: SelectedFilterValueType[],
  displayValue: string,
): TagInfo => ({
  key: `${key}-range`,
  filterKey: key,
  name,
  value: values,
  displayValue,
});

// Creates a tag info object for a filter whose values are one logical
// selection, so all of them are carried on a single removable tag.
const createGroupedValueTag = (
  key: string,
  name: string,
  values: SelectedFilterValueType[],
  displayValue: string,
): TagInfo => ({
  key: `${key}-group`,
  filterKey: key,
  name,
  value: values,
  displayValue,
});

// Creates a tag info object for a date range
const createDateRangeTag = (
  key: string,
  name: string,
  values: [string, string],
): TagInfo => ({
  key: `${key}-range`,
  filterKey: key,
  name,
  value: values,
  displayValue: formatDateRange(values[0], values[1]),
});

// Creates tag info objects for individual filter values
const createValueTags = (
  key: string,
  name: string,
  values: unknown,
  config?: FilterConfig,
): TagInfo[] => {
  const tagValues = coerceTagValues(values);
  if (tagValues.length === 0) {
    return [];
  }

  return tagValues
    .map((rawValue, index): TagInfo | null => {
      const displayValue = getDisplayValue(
        key,
        rawValue,
        tagValues,
        index,
        config,
      );

      if (!displayValue) {
        return null;
      }

      return {
        key: `${key}-${index}`,
        filterKey: key,
        name,
        value: rawValue,
        displayValue,
      };
    })
    .filter((tag): tag is TagInfo => tag !== null);
};

// Exported functions

// Generates a human-readable name for a filter key
export const generateTagName = (key: string, config?: FilterConfig): string => {
  return config?.name ?? schema?.[key]?.name ?? key;
};

// Generates a flat list of tag metadata objects from selected filters
export const generateTags = (
  selectedFilters: SelectedFilterType,
  configMap: Record<string, FilterConfig>,
): TagInfo[] => {
  return Object.entries(selectedFilters).flatMap(([key, values]) => {
    const config = configMap[key];
    const name = generateTagName(key, config);
    const tagValues = coerceTagValues(values);

    if (tagValues.length === 0) {
      return [];
    }

    // Handle numeric ranges as a single tag. Without this, each endpoint
    // would render as its own tag and could be removed independently,
    // leaving a half-range behind.
    if (RANGE_FILTER_PROPERTIES.has(key)) {
      const displayValue = formatNumericRange(tagValues);
      if (!displayValue) {
        return [];
      }
      return [createNumericRangeTag(key, name, tagValues, displayValue)];
    }

    // Handle a grouped-value filter as a single tag. The unit filter holds
    // every case variant of the chosen unit, so one tag per value would show
    // the same label twice and let the user strip one spelling while the other
    // kept filtering.
    if (GROUPED_VALUE_FILTER_PROPERTIES.has(key)) {
      const firstValue = tagValues.find(isStringValue);
      if (!firstValue) {
        return [];
      }
      return [
        createGroupedValueTag(
          key,
          name,
          tagValues,
          applyConfigTransform(firstValue, config),
        ),
      ];
    }

    // Handle date ranges as a single tag
    if (key === DATE_FILTER_KEY) {
      const cleanedDateValues = stripDateExistsQuery(tagValues);

      if (cleanedDateValues?.length === 0) {
        return [];
      }

      if (isDateRangeValues(cleanedDateValues)) {
        return [createDateRangeTag(key, name, cleanedDateValues)];
      }
      // If not a range, fall through to create individual tags
      return createValueTags(key, name, cleanedDateValues, config);
    }

    // Handle all other filters
    return createValueTags(key, name, values, config);
  });
};
