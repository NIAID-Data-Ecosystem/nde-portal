import { SelectedFilterType, SelectedFilterValueType } from '../types';
import { formatResourceTypeForAPI } from 'src/utils/formatting/formatResourceType';
import { SHOW_FILTER_ANY_NO_EXCLUSIVITY } from 'src/utils/feature-flags';
import { APPLY_DEFAULT_DATE_FILTER_KEY } from 'src/views/search/config/defaultQuery';

// Regex to split filter values by quoted/bare OR and TO separators.
// Matches: " OR ", OR, " TO ", TO (used in both date ranges and multi-value filters)
const VALUE_SPLIT_PATTERN = /(?:" OR ")| OR |(?:" TO ")| TO /;

/**
 * Reserved filter key for a cross-field OR group. Its value is an array of
 * single-field filter objects that are OR-ed together across different fields,
 * e.g. `{ _or: [{ 'includedInDataCatalog.name': ['x'] }, { _id: ['y'] }] }`
 * serializes to `(includedInDataCatalog.name:("x") OR _id:("y"))`.
 *
 * This is the only cross-field OR the helpers support and is entirely opt-in:
 * nothing produces this key unless it is explicitly set, so existing filters
 * are unaffected.
 */
export const OR_FILTER_KEY = '_or';

// A leading `field:` prefix (dotted / underscored / @-prefixed field names).
// Used only to recognize a serialized `_or` group on parse.
const FIELD_PREFIX = /^[@\w][\w.@-]*:/;

// Split a string on a separator that appears at paren-depth 0 only, leaving
// separators nested inside `(...)` untouched. Lets us detect a cross-field OR
// group (`a:("x") OR b:("y")`) without splitting a single field's internal
// multi-value OR (`a:("x" OR "y")`).
const splitTopLevel = (input: string, separator: string): string[] => {
  const result: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '(') depth++;
    else if (char === ')') depth = Math.max(0, depth - 1);

    if (depth === 0 && input.startsWith(separator, i)) {
      result.push(current);
      current = '';
      i += separator.length - 1;
      continue;
    }
    current += char;
  }
  result.push(current);
  return result;
};

const coerceFilterValues = (values: unknown): SelectedFilterValueType[] => {
  if (Array.isArray(values)) {
    return values;
  }

  if (typeof values === 'string') {
    return values ? [values] : [];
  }

  if (values && typeof values === 'object') {
    return [values as { [key: string]: string[] }];
  }

  return [];
};

/**
 * Convert a filters object to an API-compatible query string.
 *
 * Produces strings like:
 *   (topic:("Genomics" OR "Proteomics")) AND (@type:("Dataset"))
 *   (date:["2020-01-01" TO "2023-12-31"])
 *   (keywords:(-_exists_:("keywords")))
 */
export const queryFilterObject2String = (
  selectedFilters?: SelectedFilterType,
): string | null => {
  const filterParts = Object.entries(selectedFilters || {})
    .map(([filterName, rawValues]) => {
      // Internal-only marker persisted inside saved-query filters; it must never
      // reach the URL filter string or the API `extra_filter`.
      if (filterName === APPLY_DEFAULT_DATE_FILTER_KEY) {
        return null;
      }
      const values = coerceFilterValues(rawValues);
      if (values.length === 0) {
        return null;
      }

      // Cross-field OR group: recurse each single-field entry, drop the single
      // outer paren layer it adds, and OR the segments inside one paren group.
      // Segments keep their own `field:` prefix, which is how the parser tells
      // this apart from a single field's multi-value OR.
      if (filterName === OR_FILTER_KEY) {
        const orParts = values
          .filter(
            (v): v is { [key: string]: string[] } => typeof v === 'object',
          )
          .map(obj => queryFilterObject2String(obj))
          .filter((s): s is string => !!s)
          .map(s => s.replace(/^\((.*)\)$/, '$1'));
        return orParts.length > 0 ? `(${orParts.join(' OR ')})` : null;
      }

      const stringValues = values.filter(
        (v): v is string => typeof v === 'string' && v !== '',
      );
      const objectValues = values.filter(
        (v): v is { [key: string]: string[] } => typeof v === 'object',
      );

      let valueString = '';

      if (stringValues.length > 0 && filterName === '@type') {
        // @type values need API-specific formatting (e.g., "Dataset" -> "schema:Dataset")
        valueString = `("${stringValues
          .map(type => formatResourceTypeForAPI(type))
          .join('" OR "')}")`;
      } else if (filterName === 'date') {
        // Single date = exact match; multiple dates = range with TO
        if (stringValues.length === 1) {
          valueString = stringValues[0];
        } else if (stringValues.length > 1) {
          valueString = `["${stringValues.join('" TO "')}"]`;
        }
      } else if (stringValues.length > 0) {
        valueString = `("${stringValues.join('" OR "')}")`;
      }

      // Object values represent _exists_ / -_exists_ checks, recurse to build their query strings
      if (objectValues.length > 0) {
        const objectStrings = objectValues
          .map(obj => queryFilterObject2String(obj))
          .filter((s): s is string => s !== null);
        if (objectStrings.length > 0) {
          valueString = valueString
            ? valueString + ' OR ' + objectStrings.join(' OR ')
            : objectStrings.join(' OR ');
        }
      }

      return valueString ? `(${filterName}:${valueString})` : null;
    })
    .filter(Boolean);

  return filterParts.length > 0 ? filterParts.join(' AND ') : null;
};

/**
 * Parse an API query string back into a filters object.
 * Inverse of `queryFilterObject2String`.
 */
export const queryFilterString2Object = (
  queryString?: string | string[],
): SelectedFilterType | null => {
  if (!queryString || Array.isArray(queryString)) {
    return null;
  }

  const filterParts = queryString.includes(' AND ')
    ? queryString.split(' AND ')
    : [queryString];

  return filterParts.reduce((acc, part) => {
    // Strip outer parentheses: "(key:value)" -> "key:value"
    let cleanPart = part;
    if (cleanPart.startsWith('(') && cleanPart.endsWith(')')) {
      cleanPart = cleanPart.slice(1, -1);
    }

    // Cross-field OR group (inverse of the `OR_FILTER_KEY` serialization):
    //   includedInDataCatalog.name:("X") OR _id:("Y")
    // Every top-level OR segment carries its own `field:` prefix — unlike a
    // single field's multi-value OR (one prefix-less segment) or an _exists_
    // group (later segments start with `(`), so neither is misread here.
    const orSegments = splitTopLevel(cleanPart, ' OR ').map(s => s.trim());
    if (
      orSegments.length > 1 &&
      orSegments.every(seg => FIELD_PREFIX.test(seg))
    ) {
      acc[OR_FILTER_KEY] = orSegments
        .map(seg => queryFilterString2Object(seg))
        .filter(
          (o): o is SelectedFilterType => !!o,
        ) as SelectedFilterValueType[];
      return acc;
    }

    // Split on first colon to separate key from value
    const colonIndex = cleanPart.indexOf(':');
    if (colonIndex === -1) return acc;

    const key = cleanPart.slice(0, colonIndex).replace(/[("]/g, '');
    const rawValue = cleanPart.slice(colonIndex + 1);

    const values = parseFilterValues(rawValue);
    if (values.length > 0) {
      acc[key] = values;
    }

    return acc;
  }, {} as SelectedFilterType);
};

/**
 * Parse the value portion of a single "key:value" filter expression.
 * Strips wrapper quotes/brackets, splits on OR/TO, and recursively
 * parses any nested _exists_ sub-expressions.
 */
const parseFilterValues = (valueString: string): SelectedFilterValueType[] => {
  // Strip first-occurrence-only wrappers to preserve nested structures
  const cleaned = valueString
    .replace('("', '')
    .replace('")', '')
    .replace('["', '')
    .replace('"]', '');

  return cleaned
    .split(VALUE_SPLIT_PATTERN)
    .filter(Boolean)
    .map(part => {
      if (part.includes('_exists_')) {
        return queryFilterString2Object(
          part,
        ) as unknown as SelectedFilterValueType;
      }
      return part;
    });
};

/**
 * Convert bare _exists_ / -_exists_ strings into the object form
 * expected by the filter state: { "_exists_": ["facetName"] }
 */
export const normalizeFilterValues = (
  values: SelectedFilterValueType[],
  facet: string,
): SelectedFilterValueType[] => {
  return values.map(value => {
    if (value === '_exists_' || value === '-_exists_') {
      return { [value]: [facet] };
    }
    return value;
  });
};

/**
 * Extract display-friendly labels from filter values.
 * String values pass through; object values (e.g., _exists_ filters) return the key.
 */
export const getSelectedFilterDisplay = (
  values: SelectedFilterValueType[],
): string[] => {
  return values.map(value => {
    if (typeof value === 'object') {
      return Object.keys(value)[0];
    }
    return value;
  });
};

/**
 * Resolves mutual exclusivity between "Any" (_exists_) / "No" (-_exists_)
 * and a facet's other values:
 *   - Checking "Any" or "No" deselects every other value for that facet,
 *     including the opposite of itself.
 *   - Checking a normal value while "Any"/"No" is still active drops
 *     "Any"/"No" so only the real value(s) remain.
 *
 * The second rule is a no-op for the sidebar checkbox list (FiltersList),
 * since once "Any"/"No" is checked there, every other checkbox is hidden
 * and can't be clicked until "Any"/"No" is unchecked first. It's load-bearing
 * for the Visual Summary charts, though: chart slices aren't hidden the same
 * way, so a user can click a real value's slice (e.g. "Influenza") while
 * "Any"/"No" is still selected from the sidebar, producing exactly the
 * mixed state this rule cleans up.
 *
 * `values` is the full new set of checked values for the facet (as emitted
 * by the checkbox group or chart click handler); `prevValues` is what was
 * selected before this change. Works for both plain string values and the
 * `{ [key]: string[] }` object form used for _exists_/-_exists_ in
 * SelectedFilterType.
 *
 * Behind the SHOW_FILTER_ANY_NO_EXCLUSIVITY feature flag: until approved for
 * production, this function is a no-op and "Any"/"No" behaves like any other
 * checkbox value (no auto-deselection of other values).
 */
export const sanitizeExistsFilterValues = <T extends SelectedFilterValueType>(
  values: T[],
  prevValues: T[],
): T[] => {
  if (!SHOW_FILTER_ANY_NO_EXCLUSIVITY) {
    return values;
  }

  const normalize = (v: T): string =>
    typeof v === 'object' ? Object.keys(v)[0] : v;

  const isExistsType = (v: T) => {
    const key = normalize(v);
    return key === '_exists_' || key === '-_exists_';
  };

  const prevKeys = prevValues.map(normalize);
  const added = values.filter(v => !prevKeys.includes(normalize(v)));
  const addedExists = added.find(isExistsType);

  // "Any"/"No" was just checked: it overrides every other selection.
  if (addedExists) {
    return [addedExists];
  }

  // A normal value is checked while "Any"/"No" is still present from a
  // previous selection (only reachable via Visual Summary charts): drop "Any"/"No" so only the normal value(s) remain.
  if (values.some(v => !isExistsType(v)) && values.some(isExistsType)) {
    return values.filter(v => !isExistsType(v));
  }

  return values;
};
