import { renderHook } from '@testing-library/react';
import { useRepositoryMatcherFilters } from '../useRepositoryMatcherFilters';
import { RepositoryMatcherRow } from '../useRepositoryMatcherData';

// Rows are keyed by column id with the already-transformed display values,
// mirroring what useRepositoryMatcherData produces.
const rowA = {
  _id: 'a',
  researchDomain: ['IID'],
  coa: 'Open Access',
  type: ['Resource Catalog'],
  healthCondition: [{ name: 'Malaria' }],
} as unknown as RepositoryMatcherRow;

const rowB = {
  _id: 'b',
  researchDomain: ['Generalist'],
  coa: 'Controlled Access',
  type: ['Dataset Repository'],
  healthCondition: [],
} as unknown as RepositoryMatcherRow;

const rowC = {
  _id: 'c',
  researchDomain: ['IID', 'Generalist'],
  coa: '',
  type: [],
  healthCondition: [{ name: 'Flu' }, { name: null }],
} as unknown as RepositoryMatcherRow;

const data = [rowA, rowB, rowC];

describe('useRepositoryMatcherFilters', () => {
  it('returns all rows and an empty terms shape when data is undefined', () => {
    const { result } = renderHook(() =>
      useRepositoryMatcherFilters(undefined, {}),
    );
    expect(result.current.filteredData).toEqual([]);
    // Every filterable column is represented with an empty term list.
    expect(result.current.termsByColumnId.researchDomain).toEqual([]);
    expect(result.current.termsByColumnId.coa).toEqual([]);
  });

  it('returns all rows when no filters are selected', () => {
    const { result } = renderHook(() => useRepositoryMatcherFilters(data, {}));
    expect(result.current.filteredData.map(r => r._id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('keeps rows that match a selected array-valued filter', () => {
    const { result } = renderHook(() =>
      useRepositoryMatcherFilters(data, { researchDomain: ['IID'] }),
    );
    expect(result.current.filteredData.map(r => r._id)).toEqual(['a', 'c']);
  });

  it('keeps rows that match a selected string-valued filter', () => {
    const { result } = renderHook(() =>
      useRepositoryMatcherFilters(data, { coa: ['Open Access'] }),
    );
    expect(result.current.filteredData.map(r => r._id)).toEqual(['a']);
  });

  it('excludes rows that have no values for a selected filter', () => {
    // rowC has coa '' -> no filter values -> excluded.
    const { result } = renderHook(() =>
      useRepositoryMatcherFilters(data, { coa: ['Controlled Access'] }),
    );
    expect(result.current.filteredData.map(r => r._id)).toEqual(['b']);
  });

  it('applies multiple selected filters together (AND across columns)', () => {
    const { result } = renderHook(() =>
      useRepositoryMatcherFilters(data, {
        researchDomain: ['IID'],
        coa: ['Open Access'],
      }),
    );
    expect(result.current.filteredData.map(r => r._id)).toEqual(['a']);
  });

  it('builds sorted, de-duplicated, case-insensitive terms per column', () => {
    const { result } = renderHook(() => useRepositoryMatcherFilters(data, {}));
    expect(result.current.termsByColumnId.researchDomain).toEqual([
      { term: 'Generalist', label: 'Generalist' },
      { term: 'IID', label: 'IID' },
    ]);
    // DefinedTerm columns map to .name and drop null names.
    expect(result.current.termsByColumnId.healthCondition).toEqual([
      { term: 'Flu', label: 'Flu' },
      { term: 'Malaria', label: 'Malaria' },
    ]);
  });
});
