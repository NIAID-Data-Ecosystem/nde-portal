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
  getDefaultFilterState,
  getFacetPropertiesForCategory,
  getFilterById,
  getFilterStateProperties,
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

  describe('Content Type', () => {
    it('lives in Shared / Dataset and hides the missing-value option', () => {
      const contentType = getFilterById('about.name');
      expect(contentType?.name).toBe('Content Type');
      expect(contentType?.category).toBe('Shared / Dataset');
      expect(contentType?.showMissing).toBe(false);
    });

    it('replaces the separate Data Type and Asset Type filters', () => {
      expect(getFilterById('exampleOfWork.about.name.raw')).toBeUndefined();
      expect(FILTER_CONFIGS.map(cfg => cfg.name)).not.toContain('Data Type');
      expect(FILTER_CONFIGS.map(cfg => cfg.name)).not.toContain('Asset Type');
    });

    it('requests both of its backing fields in its category aggregation', () => {
      const properties =
        getFacetPropertiesForCategory('Shared / Dataset').split(',');
      expect(properties).toContain('about.name');
      expect(properties).toContain('exampleOfWork.about.name.raw');
    });

    // Facet terms are the raw indexed values. `about.displayName` is not
    // facetable, which means the readable label needs to be derived.
    describe('transformData', () => {
      const transformData = () => {
        const transform = getFilterById('about.name')?.transformData;
        if (!transform) throw new Error('Expected Content Type transformData');
        return transform;
      };

      it('splits PascalCase terms into readable labels', () => {
        expect(
          transformData()({
            term: 'MolecularSequence',
            count: 5,
            label: 'MolecularSequence',
          }),
        ).toEqual({
          term: 'MolecularSequence',
          count: 5,
          label: 'Molecular Sequence',
        });
      });

      // The chart path passes no `label` and the tag path passes `count: 0`.
      // The transform can rely on `term` only.
      it('falls back to term when no label is supplied', () => {
        expect(transformData()({ term: 'GeneVariant', count: 0 })).toEqual({
          term: 'GeneVariant',
          count: 0,
          label: 'Gene Variant',
        });
      });

      it('leaves the searchable term untouched', () => {
        expect(transformData()({ term: 'ClinicalStudy', count: 6 }).term).toBe(
          'ClinicalStudy',
        );
      });
    });
  });

  describe('Collection Size', () => {
    const collectionSize = () => getFilterById('collectionSize');

    it('lives in Shared / Dataset and hides the missing-value option', () => {
      expect(collectionSize()?.name).toBe('Collection Size');
      expect(collectionSize()?.category).toBe('Shared / Dataset');
      expect(collectionSize()?.showMissing).toBe(false);
    });

    // Only the unit is a facetable keyword; the numeric field is filter-only,
    // so faceting it would return terms rather than anything usable.
    it('aggregates the unit field only', () => {
      expect(collectionSize()?.property).toBe('collectionSize.unitText');
      expect(
        getFacetPropertiesForCategory('Shared / Dataset').split(','),
      ).toContain('collectionSize.unitText');
      expect(ALL_FACET_PROPERTIES.split(',')).not.toContain(
        'collectionSize.minValue',
      );
    });

    it('declares the numeric field as its range key', () => {
      expect(collectionSize()?.rangeProperty).toBe('collectionSize.minValue');
    });

    // A 143-term uncontrolled vocabulary whose top 9 terms cover >99.8% of
    // records makes no readable pie or bar chart.
    it('has no visualization chart', () => {
      expect(collectionSize()?.chart).toBeUndefined();
    });
  });

  describe('getFilterStateProperties', () => {
    it('returns the single property for an ordinary filter', () => {
      const config = getFilterById('conditionsOfAccess')!;
      expect(getFilterStateProperties(config)).toEqual(['conditionsOfAccess']);
    });

    it('returns both keys for a filter with a range', () => {
      expect(
        getFilterStateProperties(getFilterById('collectionSize')!),
      ).toEqual(['collectionSize.unitText', 'collectionSize.minValue']);
    });
  });

  describe('getDefaultFilterState', () => {
    const defaults = getDefaultFilterState();

    it('seeds an empty array for every filter state key', () => {
      FILTER_CONFIGS.forEach(config => {
        getFilterStateProperties(config).forEach(property => {
          expect(defaults[property]).toEqual([]);
        });
      });
    });

    // Clearing all filters resets this object, so a missed key would survive
    // "Clear All".
    it("includes a filter's range key", () => {
      expect(defaults['collectionSize.minValue']).toEqual([]);
    });
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
