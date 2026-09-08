import { omit } from 'lodash';
import { FilterTermType, SelectedFilterType } from '../../types';
import {
  ALL_UNITS_KEY,
  COLLECTION_SIZE_ALL_UNITS_LABEL,
  COLLECTION_SIZE_UNIT_FIELD,
  COLLECTION_SIZE_VALUE_FIELD,
  RANGE_WILDCARD,
  normalizeUnitKey,
} from 'src/views/search/config/collection-size';
import { queryFilterString2Object } from '../../utils/query-string';

/**
 * One selectable unit in the dropdown.
 *
 * `terms` holds every indexed spelling grouped under this option, because the
 * vocabulary is uncontrolled and contains case variants of the same unit. All
 * of them are queried together.
 */
export interface UnitOption {
  key: string;
  label: string;
  terms: string[];
  count: number;
}

/** Endpoints of the numeric range as they appear in the inputs. */
export interface RangeValues {
  min: string;
  max: string;
}

/** Known numeric limits of the unit's collection sizes. */
export interface CollectionSizeBounds {
  min: number;
  max: number;
}

/**
 * `useFilterQueries` always prepends an `_exists_` row and, for filters that
 * allow it, appends `-_exists_`. Neither is a unit.
 */
const EXISTS_TERMS = new Set(['_exists_', '-_exists_']);

/** The option shown when no unit is selected, which queries no unit at all. */
const allUnitsOption = (): UnitOption => ({
  key: ALL_UNITS_KEY,
  label: COLLECTION_SIZE_ALL_UNITS_LABEL,
  terms: [],
  count: 0,
});

/**
 * Dropdown options for the unit field, most common unit first.
 *
 * Case variants of the same unit are collapsed into one option: they render to
 * an identical label, so listing them separately would show duplicate rows and
 * let the user query one spelling while the other went unfiltered.
 */
export const buildUnitOptions = (terms: FilterTermType[]): UnitOption[] => {
  const grouped = new Map<string, UnitOption & { topCount: number }>();

  terms.forEach(({ term, label, count = 0 }) => {
    if (!term || EXISTS_TERMS.has(term)) return;

    const key = normalizeUnitKey(term);
    if (!key) return;

    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        key,
        // Labels arrive already formatted by the filter config's
        // `transformData`; fall back to the raw term when absent.
        label: label || term,
        terms: [term],
        count,
        topCount: count,
      });
      return;
    }

    existing.count += count;
    if (!existing.terms.includes(term)) {
      existing.terms.push(term);
    }
    // Label follows the most common spelling of the unit.
    if (count > existing.topCount) {
      existing.label = label || term;
      existing.topCount = count;
    }
  });

  const options = Array.from(grouped.values())
    .map(({ topCount, ...option }) => option)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return [allUnitsOption(), ...options];
};

/**
 * Group identity of the currently applied unit. The selection holds every
 * spelling of one unit, so any of them resolves to the same option.
 */
export const getSelectedUnitKey = (selectedUnits: string[]): string => {
  const applied = selectedUnits.find(
    value => typeof value === 'string' && !EXISTS_TERMS.has(value) && value,
  );
  return applied ? normalizeUnitKey(applied) : ALL_UNITS_KEY;
};

/** Numeric endpoint as an input value. `*` and non-numeric values are blank. */
const toInputValue = (value?: string): string => {
  if (!value || value === RANGE_WILDCARD) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : '';
};

/** Applied range endpoints, as the two inputs should show them. */
export const parseRangeValues = (selectedRange: string[]): RangeValues => ({
  min: toInputValue(selectedRange[0]),
  max: toInputValue(selectedRange[1]),
});

/**
 * Both filter keys as one patch, applied in a single route update.
 *
 * The range is written as a pair with `*` on any unbounded end, which
 * `queryFilterObject2String` serializes to `[min TO max]`. An empty range
 * clears the key rather than writing `[* TO *]`, which would filter nothing
 * while still rendering a tag.
 */
export const buildFilterPatch = ({
  unit,
  min,
  max,
}: {
  unit: UnitOption;
  min: string;
  max: string;
}): SelectedFilterType => {
  const hasRange = min !== '' || max !== '';

  return {
    [COLLECTION_SIZE_UNIT_FIELD]: unit.key === ALL_UNITS_KEY ? [] : unit.terms,
    [COLLECTION_SIZE_VALUE_FIELD]: hasRange
      ? [min || RANGE_WILDCARD, max || RANGE_WILDCARD]
      : [],
  };
};

/**
 * The applied filters with the collection size range removed.
 *
 * Both the bounds probe and the histogram describe the range the user could
 * pick, not the one already picked: leaving the applied range in would bound
 * the inputs by the current selection and collapse the histogram to the
 * selected buckets. Everything else is kept.
 */
export const withoutRangeFilter = (
  extra_filter: string,
): SelectedFilterType => {
  const filtersObject = extra_filter
    ? queryFilterString2Object(extra_filter)
    : {};

  return omit(filtersObject ?? {}, [COLLECTION_SIZE_VALUE_FIELD]);
};

/** Non-negative integer, or `null` when the input is not a usable number. */
const toBoundedNumber = (value: string): number | null => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.floor(parsed));
};

/**
 * Range endpoints as they should be applied: whole non-negative numbers,
 * ordered, and held inside the known bounds. Reversed endpoints are swapped
 * rather than rejected, since `[50000 TO 1000]` matches nothing.
 */
export const clampRange = (
  min: string,
  max: string,
  bounds?: CollectionSizeBounds,
): RangeValues => {
  let lower = toBoundedNumber(min);
  let upper = toBoundedNumber(max);

  if (lower !== null && upper !== null && lower > upper) {
    [lower, upper] = [upper, lower];
  }

  if (bounds) {
    if (lower !== null) {
      lower = Math.min(Math.max(lower, bounds.min), bounds.max);
    }
    if (upper !== null) {
      upper = Math.min(Math.max(upper, bounds.min), bounds.max);
    }
  }

  return {
    min: lower === null ? '' : String(lower),
    max: upper === null ? '' : String(upper),
  };
};
