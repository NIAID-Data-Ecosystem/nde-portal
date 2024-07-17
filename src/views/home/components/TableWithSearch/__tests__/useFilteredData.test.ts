import { renderHook } from '@testing-library/react';
import useFilteredData from '../hooks/useFilteredData'; // Adjust the import path as necessary

describe('useFilteredData', () => {
  it('filters data based on the search term correctly', async () => {
    const initialData = [
      {
        _id: 'source_01',
        name: 'Source 1',
        abstract: 'Lorem ipsum dolor sit amet',
        domain: 'iid',
        conditionsOfAccess: 'Open',
        type: 'ResourceCatalog',
      },
      {
        _id: 'source_02',
        name: 'Source 2',
        abstract:
          'Orci varius natoque penatibus et magnis dis parturient montes',
        domain: 'generalist',
        conditionsOfAccess: 'Restricted',
        type: 'Repository',
      },
    ] as any[];

    // Mock useDebounceValue to immediately return the current searchTerm for simplicity in testing
    jest.mock('usehooks-ts', () => ({
      useDebounceValue: jest
        .fn()
        .mockImplementation(searchTerm => [searchTerm]),
    }));

    const { result } = renderHook(() =>
      useFilteredData(initialData, 'generalist', []),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('Source 2');
  });

  it('applies AND/OR logic for filters correctly', () => {
    const initialData = [
      {
        _id: 'source_01',
        name: 'Source 1',
        abstract: 'Lorem ipsum dolor sit amet',
        domain: 'iid',
        conditionsOfAccess: 'Open',
        type: 'ResourceCatalog',
      },
      {
        _id: 'source_02',
        name: 'Source 2',
        abstract:
          'Orci varius natoque penatibus et magnis dis parturient montes',
        domain: 'generalist',
        conditionsOfAccess: 'Restricted',
        type: 'Repository',
      },
      {
        _id: 'source_03',
        name: 'Source 3',
        abstract: 'Lorem ipsum dolor sit amet',
        domain: 'iid',
        conditionsOfAccess: 'Restricted',
        type: 'ResourceCatalog',
      },
    ] as any[];

    const filters = [{ name: 'IID', value: 'iid', property: 'domain' }];

    const { result } = renderHook(() =>
      useFilteredData(initialData, '', filters),
    );
    expect(result.current).toHaveLength(2);

    const access_filters = [
      { name: 'IID', value: 'iid', property: 'domain' },
      {
        name: 'Restricted',
        value: 'Restricted',
        property: 'conditionsOfAccess',
      },
    ];

    const { result: filterAccess } = renderHook(() =>
      useFilteredData(initialData, '', access_filters),
    );
    expect(filterAccess.current).toHaveLength(1);
  });

  it('applies filters for array data values correctly', () => {
    const initialData = [
      {
        _id: 'source_01',
        name: 'Source 1',
        abstract: 'Lorem ipsum dolor sit amet',
        domain: 'iid',
        conditionsOfAccess: ['Open', 'Restricted'],
        type: 'ResourceCatalog',
      },
      {
        _id: 'source_02',
        name: 'Source 2',
        abstract:
          'Orci varius natoque penatibus et magnis dis parturient montes',
        domain: 'generalist',
        conditionsOfAccess: 'Open',
        type: 'Repository',
      },
      {
        _id: 'source_03',
        name: 'Source 3',
        abstract: 'Lorem ipsum dolor sit amet',
        domain: 'iid',
        conditionsOfAccess: 'Restricted',
        type: 'ResourceCatalog',
      },
    ] as any[];

    const access_filters = [
      {
        name: 'Restricted',
        value: 'Restricted',
        property: 'conditionsOfAccess',
      },
    ];

    const { result: filterAccess } = renderHook(() =>
      useFilteredData(initialData, '', access_filters),
    );
    expect(filterAccess.current).toHaveLength(2);

    const { result: withSearch } = renderHook(() =>
      useFilteredData(initialData, 'resTricted', []),
    );
    expect(withSearch.current).toHaveLength(2);
  });

  it('handles a property with no values correctly', () => {
    const initialData = [
      {
        _id: 'source_01',
        name: '',
        abstract: 'Lorem ipsum dolor sit amet',
        domain: 'iid',
        conditionsOfAccess: ['Open', 'Restricted'],
        type: 'ResourceCatalog',
      },
      {
        _id: 'source_02',
        name: '',
        abstract:
          'Orci varius natoque penatibus et magnis dis parturient montes',
        domain: 'generalist',
        conditionsOfAccess: 'Open',
        type: 'Repository',
      },
      {
        _id: 'source_03',
        name: '',
        abstract: 'Lorem ipsum dolor sit amet',
        domain: 'iid',
        conditionsOfAccess: 'Restricted',
        type: 'ResourceCatalog',
      },
    ] as any[];

    const access_filters = [
      {
        name: 'Name',
        value: '',
        property: 'name',
      },
    ];

    const { result } = renderHook(() =>
      useFilteredData(initialData, '', access_filters),
    );
    expect(result.current).toHaveLength(0);
  });
});
