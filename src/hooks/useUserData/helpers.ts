import { SavedQuery } from './types';

// Filter value objects encode existence checks, e.g. { '-_exists_': ['date'] }.
const EXISTS_KEYS = ['_exists_', '-_exists_'] as const;

/**
 * Hoist any `_exists_` / `-_exists_` objects nested inside a filters object's
 * value arrays up to top-level keys, as the favorites API expects.
 *
 * Input:
 *   { date: ['2000-01-01', '2026-12-31', { '-_exists_': ['date'] }] }
 * Output:
 *   { date: ['2000-01-01', '2026-12-31'], '-_exists_': ['date'] }
 *
 * Field names from multiple facets sharing the same exists key are merged
 * (de-duped) into a single array. The prefix is preserved, since `_exists_`
 * (field present) and `-_exists_` (field absent) mean opposite things. Filter
 * keys left with no remaining values are dropped.
 */
export const formatSavedQueryFilters = (
  filters: SavedQuery['filters'],
): SavedQuery['filters'] => {
  const result: Record<string, any> = {};
  const hoisted: Record<string, string[]> = {};

  Object.entries(filters || {}).forEach(([filterName, values]) => {
    if (!Array.isArray(values)) {
      result[filterName] = values;
      return;
    }

    const remaining: any[] = [];

    values.forEach(value => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        let isExists = false;
        EXISTS_KEYS.forEach(existsKey => {
          const fields = (value as Record<string, unknown>)[existsKey];
          if (Array.isArray(fields)) {
            isExists = true;
            hoisted[existsKey] = [
              ...(hoisted[existsKey] || []),
              ...fields.filter((f): f is string => typeof f === 'string'),
            ];
          }
        });
        // Preserve any non-exists object as-is.
        if (!isExists) {
          remaining.push(value);
        }
      } else {
        remaining.push(value);
      }
    });

    if (remaining.length > 0) {
      result[filterName] = remaining;
    }
  });

  EXISTS_KEYS.forEach(existsKey => {
    if (hoisted[existsKey]?.length) {
      result[existsKey] = Array.from(new Set(hoisted[existsKey]));
    }
  });

  return result;
};

/**
 * Inverse of `formatSavedQueryFilters`: fold top-level `_exists_` / `-_exists_`
 * keys from an API response back into the nested-object form the app uses
 * internally, so consumers keep working with a single filter shape.
 *
 * Input:
 *   { date: ['2000-01-01', '2026-12-31'], '-_exists_': ['date'] }
 * Output:
 *   { date: ['2000-01-01', '2026-12-31', { '-_exists_': ['date'] }] }
 *
 * Each field name is appended as `{ [existsKey]: [field] }` to that field's
 * value array, recreating the array if the forward transform dropped it.
 */
export const parseSavedQueryFilters = (
  filters: SavedQuery['filters'],
): SavedQuery['filters'] => {
  const result: Record<string, any> = {};

  Object.entries(filters || {}).forEach(([key, values]) => {
    // Top-level exists keys are folded back in below, not copied through.
    if ((EXISTS_KEYS as readonly string[]).includes(key)) {
      return;
    }
    result[key] = values;
  });

  EXISTS_KEYS.forEach(existsKey => {
    const fields = (filters as Record<string, unknown>)?.[existsKey];
    if (Array.isArray(fields)) {
      fields.forEach(field => {
        if (typeof field !== 'string') return;
        const existing = Array.isArray(result[field]) ? result[field] : [];
        result[field] = [...existing, { [existsKey]: [field] }];
      });
    }
  });

  return result;
};

/**
 * Apply `parseSavedQueryFilters` across a list of saved searches returned by
 * the API, normalizing each query's filters back into the app's internal form.
 */
export const parseSavedQueries = (queries: SavedQuery[]): SavedQuery[] =>
  queries.map(query => ({
    ...query,
    filters: parseSavedQueryFilters(query.filters),
  }));

/**
 * Stringify a value with object keys sorted recursively, so that two
 * structurally-equal filter objects compare equal regardless of key order.
 * Array order is preserved (it is meaningful for filters such as
 * `date: [start, end, ...]`).
 */
export const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map(
        key =>
          `${JSON.stringify(key)}:${stableStringify(
            (value as Record<string, unknown>)[key],
          )}`,
      );
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
};

/**
 * Locate a saved query by identity (`query` string + structurally-equal
 * `filters`) rather than by position. Deleting by index is fragile: the
 * favorites API removes by index, so any stale index (e.g. computed before a
 * prior delete shrank the list) can point past the end of the server array and
 * return "Index out of range". Resolving the index from the freshest list at
 * call time keeps deletes correct regardless of order. Returns -1 if absent.
 */
export const findSavedQueryIndex = (
  queries: SavedQuery[],
  target: Pick<SavedQuery, 'query' | 'filters'>,
): number =>
  queries.findIndex(
    query =>
      query.query === target.query &&
      stableStringify(query.filters) === stableStringify(target.filters),
  );
