jest.mock('src/components/metadata', () => ({
  getMetadataDescription: jest.fn((key: string) => `${key} description`),
}));

jest.mock('src/utils/formatting/formatConditionsOfAccess', () => ({
  formatConditionsOfAccess: jest.fn((value: string) => `formatted:${value}`),
  transformConditionsOfAccessLabel: jest.fn(
    (value: string) => `label:${value}`,
  ),
}));

import {
  ALL_FACET_PROPERTIES,
  FACET_PROPERTIES_BY_CATEGORY,
  FILTER_CONFIGS,
  getFacetPropertiesForCategory,
  getFilterById,
} from '../config';

describe('filters/config', () => {
  it('has unique filter ids and required fields', () => {
    const ids = FILTER_CONFIGS.map(cfg => cfg.id);
    expect(new Set(ids).size).toBe(ids.length);
    FILTER_CONFIGS.forEach(cfg => {
      expect(cfg.id).toBeTruthy();
      expect(cfg.name).toBeTruthy();
      expect(cfg.property).toBeTruthy();
      expect(cfg.queryType).toBeTruthy();
      expect(cfg.category).toBeTruthy();
    });
  });

  it('returns filter by id and undefined for missing id', () => {
    expect(getFilterById('date')?.property).toBe('date');
    expect(getFilterById('__missing__')).toBeUndefined();
  });

  it('applies transformData for conditionsOfAccess', () => {
    const conditions = FILTER_CONFIGS.find(f => f.id === 'conditionsOfAccess');
    expect(conditions?.transformData).toBeDefined();
    expect(
      conditions?.transformData?.({ term: 'open', count: 1, label: 'open' }),
    ).toEqual({ term: 'open', count: 1, label: 'label:formatted:open' });
    expect(conditions?.transformData?.({ term: 'open', count: 2 })).toEqual({
      term: 'open',
      count: 2,
      label: 'label:formatted:open',
    });
  });

  describe('FACET_PROPERTIES_BY_CATEGORY', () => {
    // Each category's scoped aggregation requests only its own facet
    // properties. If this partition ever drops or duplicates a property, the
    // corresponding filter section silently loses its terms and counts.
    it('is a lossless partition of ALL_FACET_PROPERTIES', () => {
      const partitioned = Object.values(FACET_PROPERTIES_BY_CATEGORY)
        .flatMap(properties => properties.split(','))
        .sort();
      const all = ALL_FACET_PROPERTIES.split(',').sort();

      expect(partitioned).toEqual(all);
      expect(new Set(partitioned).size).toBe(partitioned.length);
    });

    it('groups every filter under its own category', () => {
      FILTER_CONFIGS.forEach(cfg => {
        expect(
          getFacetPropertiesForCategory(cfg.category).split(','),
        ).toContain(cfg.property);
      });
    });

    it('returns an empty string for a category with no visible filters', () => {
      expect(getFacetPropertiesForCategory('Dataset')).toBe('');
    });
  });
});
