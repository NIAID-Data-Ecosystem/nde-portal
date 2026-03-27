import {
  filterGroupsBySearchTerm,
  groupFiltersByCategory,
} from '../../../components/customize-filters-popover/utils';

describe('customize-filters-popover/utils', () => {
  const filters = [
    {
      id: 'a',
      name: 'Host Species',
      property: 'species',
      queryType: 'facet',
      description: '',
      category: 'Dataset' as const,
    },
    {
      id: 'b',
      name: 'Input',
      property: 'input',
      queryType: 'facet',
      description: '',
      category: 'Computational Tool' as const,
    },
    {
      id: 'c',
      name: 'Funding',
      property: 'funding',
      queryType: 'facet',
      description: '',
      category: 'Shared' as const,
    },
  ];

  it('groups filters by category preserving grouped entries', () => {
    const groups = groupFiltersByCategory(filters as any);
    expect(groups).toHaveLength(3);
    expect(groups.find(g => g.category === 'Dataset')?.filters[0].id).toBe('a');
  });

  it('filters groups by search term and trims/normalizes case', () => {
    const groups = groupFiltersByCategory(filters as any);
    expect(filterGroupsBySearchTerm(groups, '   host   ')).toEqual([
      {
        category: 'Dataset',
        filters: [filters[0]],
      },
    ]);
  });

  it('returns original groups on empty search and removes empty groups otherwise', () => {
    const groups = groupFiltersByCategory(filters as any);
    expect(filterGroupsBySearchTerm(groups, '')).toEqual(groups);
    expect(filterGroupsBySearchTerm(groups, 'zzzz')).toEqual([]);
  });
});
