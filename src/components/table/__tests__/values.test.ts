import {
  compareValues,
  isEmptyValue,
  sortRows,
  toSearchValue,
  toSortValue,
  toText,
} from '../utils/values';

describe('isEmptyValue', () => {
  it('treats nullish, blank, NaN and empty arrays as missing', () => {
    [null, undefined, '', '   ', NaN, [], ['', null]].forEach(value =>
      expect(isEmptyValue(value)).toBe(true),
    );
  });

  it('keeps meaningful values, including zero, false and "Unknown"', () => {
    [0, false, 'Unknown', 'Not applicable', ['a'], { name: 'x' }].forEach(
      value => expect(isEmptyValue(value)).toBe(false),
    );
  });
});

describe('toText', () => {
  it('joins arrays and reads names off objects', () => {
    expect(toText(['a', { name: 'b' }, null, { label: 'c' }])).toBe('a, b, c');
    expect(toText({ identifier: 'ID-1' })).toBe('ID-1');
    expect(toText(true)).toBe('Yes');
    expect(toText(0)).toBe('0');
    expect(toText({})).toBe('');
  });
});

describe('toSortValue', () => {
  it('keeps numbers numeric and turns everything else into text', () => {
    expect(toSortValue(3)).toBe(3);
    expect(toSortValue(NaN)).toBeNull();
    expect(toSortValue(['b', 'a'])).toBe('b, a');
    expect(toSortValue('')).toBeNull();
  });
});

describe('compareValues', () => {
  it('compares numbers numerically and text case-insensitively', () => {
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues('item 2', 'Item 10')).toBeLessThan(0);
    expect(compareValues('alpha', 'ALPHA')).toBe(0);
  });
});

describe('sortRows', () => {
  const rows = [
    { id: 'a', v: 'beta' },
    { id: 'b', v: null },
    { id: 'c', v: 'Alpha' },
    { id: 'd', v: '' },
    { id: 'e', v: 'gamma' },
  ];
  const ids = (list: typeof rows) => list.map(r => r.id);

  it('sorts ascending and descending', () => {
    expect(ids(sortRows(rows, r => r.v, 'asc'))).toEqual([
      'c',
      'a',
      'e',
      'b',
      'd',
    ]);
    expect(ids(sortRows(rows, r => r.v, 'desc'))).toEqual([
      'e',
      'a',
      'c',
      'b',
      'd',
    ]);
  });

  it('keeps empty values last in both directions, in their original order', () => {
    expect(ids(sortRows(rows, r => r.v, 'desc')).slice(-2)).toEqual(['b', 'd']);
  });

  it('is stable for equal values and does not mutate the input', () => {
    const tied = [
      { id: '1', v: 'x' },
      { id: '2', v: 'X' },
      { id: '3', v: 'x' },
    ];
    expect(sortRows(tied, r => r.v, 'desc').map(r => r.id)).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(ids(rows)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

// Moved from useRepositoryMatcherData's `defaultSearchValue`.
describe('toSearchValue', () => {
  it('returns null for nullish values', () => {
    expect(toSearchValue(null)).toBeNull();
    expect(toSearchValue(undefined)).toBeNull();
  });

  it('passes strings through and stringifies numbers', () => {
    expect(toSearchValue('hello')).toBe('hello');
    expect(toSearchValue(42)).toBe('42');
  });

  it('maps arrays of strings/numbers to string arrays', () => {
    expect(toSearchValue(['a', 1, 'b'])).toEqual(['a', '1', 'b']);
  });

  it('returns null for objects and mixed arrays', () => {
    expect(toSearchValue({ name: 'x' })).toBeNull();
    expect(toSearchValue([{ a: 1 }])).toBeNull();
  });
});
