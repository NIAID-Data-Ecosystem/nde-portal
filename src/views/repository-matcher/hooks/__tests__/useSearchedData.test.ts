import { renderHook } from '@testing-library/react';
import { useSearchedData } from '../useSearchedData';

const rows = [
  { _id: '1', _search: 'alpha sequencing iid' },
  { _id: '2', _search: 'beta generalist' },
  { _id: '3', _search: 'gamma sequencing generalist' },
];

describe('useSearchedData', () => {
  // Pass debounceMs=0 so the debounced value resolves to the term immediately.
  const run = (data: typeof rows | undefined, term: string) =>
    renderHook(() => useSearchedData(data, term, 0));

  it('returns an empty array when data is undefined', () => {
    const { result } = run(undefined, '');
    expect(result.current).toEqual([]);
  });

  it('returns the original data when the search term is empty/whitespace', () => {
    const { result } = run(rows, '   ');
    expect(result.current).toBe(rows);
  });

  it('returns the data unchanged when it is an empty array', () => {
    const empty: typeof rows = [];
    const { result } = run(empty, 'alpha');
    expect(result.current).toBe(empty);
  });

  it('filters rows whose _search blob includes the term (case-insensitive)', () => {
    const { result } = run(rows, 'SEQUENCING');
    expect(result.current.map(r => r._id)).toEqual(['1', '3']);
  });

  it('returns no rows when nothing matches', () => {
    const { result } = run(rows, 'zzz');
    expect(result.current).toEqual([]);
  });
});
