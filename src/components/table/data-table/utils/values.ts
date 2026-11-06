import type { SortDirection, SortValue } from '../types';

/**
 * Whether a value is genuinely missing: `null`/`undefined`, a blank string,
 * `NaN`, or an array with nothing in it. Real values that merely read as
 * "nothing" — `0`, `false`, "Unknown", "Not applicable" — are not missing.
 */
export const isEmptyValue = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  if (Array.isArray(value)) return value.every(isEmptyValue);
  return false;
};

const NAME_KEYS = ['name', 'label', 'title', 'identifier'] as const;

/**
 * A value as plain text, for display, default sorting and search. Arrays are
 * comma-joined; objects use their first of `name`, `label`, `title`,
 * `identifier` (the shapes the API's DefinedTerm and the app's link values
 * use).
 */
export const toText = (value: unknown): string => {
  if (isEmptyValue(value)) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of NAME_KEYS) {
      const text = toText(record[key]);
      if (text) return text;
    }
  }
  return '';
};

/** Numbers sort numerically; everything else on its text. */
export const toSortValue = (value: unknown): SortValue => {
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  return toText(value) || null;
};

const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
});

/** Compares two non-empty sort values: numerically, else case-insensitively. */
export const compareValues = (
  a: NonNullable<SortValue>,
  b: NonNullable<SortValue>,
): number =>
  typeof a === 'number' && typeof b === 'number'
    ? a - b
    : collator.compare(String(a), String(b));

/**
 * A sorted copy of `rows`. Stable, reads each row's value once, and puts
 * empty values last in both directions, so flipping the direction never
 * buries real values under blanks.
 */
export const sortRows = <TRow>(
  rows: TRow[],
  getValue: (row: TRow) => SortValue,
  direction: SortDirection,
): TRow[] => {
  const factor = direction === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, value: getValue(row) }))
    .sort((a, b) => {
      const aEmpty = isEmptyValue(a.value);
      const bEmpty = isEmptyValue(b.value);
      if (aEmpty || bEmpty) {
        return aEmpty === bEmpty ? a.index - b.index : aEmpty ? 1 : -1;
      }
      return (
        factor * compareValues(a.value as string, b.value as string) ||
        a.index - b.index
      );
    })
    .map(({ row }) => row);
};

/**
 * Text for free-text search, or `null` to leave the value out of the search
 * index. Moved from the repository matcher's `defaultSearchValue`, which the
 * saved page also uses.
 */
export const toSearchValue = (value: unknown): string | string[] | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (
    Array.isArray(value) &&
    value.every(v => typeof v === 'string' || typeof v === 'number')
  ) {
    return value.map(String);
  }
  return null;
};
