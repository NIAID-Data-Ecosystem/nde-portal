import { generateTagName, generateTags } from '../../../components/tag/utils';

describe('tag/utils', () => {
  const configMap = {
    '@type': {
      id: '@type',
      name: 'Resource Type',
      property: '@type',
      category: 'Shared',
      queryType: 'facet',
      description: '',
      transformData: ({ term, count }: any) => ({
        term,
        count,
        label: `mapped-${term}`,
      }),
    },
    conditionsOfAccess: {
      id: 'conditionsOfAccess',
      name: 'Conditions',
      property: 'conditionsOfAccess',
      category: 'Shared',
      queryType: 'facet',
      description: '',
      transformData: ({ term, count }: any) => ({
        term,
        count,
        label: `coa-${term}`,
      }),
    },
    date: {
      id: 'date',
      name: 'Date',
      property: 'date',
      category: 'Shared',
      queryType: 'histogram',
      description: '',
    },
    'species.displayName.raw': {
      id: 'species.displayName.raw',
      name: 'Host Species',
      property: 'species.displayName.raw',
      category: 'Dataset',
      queryType: 'facet',
      description: '',
    },
    // Collection Size owns two keys, and FilterTags maps both of them to the
    // same config so the range tag is named after the filter.
    'collectionSize.unitText': {
      id: 'collectionSize',
      name: 'Collection Size',
      property: 'collectionSize.unitText',
      rangeProperty: 'collectionSize.minValue',
      category: 'Shared / Dataset',
      queryType: 'facet',
      description: '',
      transformData: ({ term, count }: any) => ({
        term,
        count,
        label: `unit-${term}`,
      }),
    },
    'collectionSize.minValue': {
      id: 'collectionSize',
      name: 'Collection Size',
      property: 'collectionSize.unitText',
      rangeProperty: 'collectionSize.minValue',
      category: 'Shared / Dataset',
      queryType: 'facet',
      description: '',
    },
  } as any;

  it('generates tag names from config first', () => {
    expect(generateTagName('@type', configMap['@type'])).toBe('Resource Type');
  });

  it('creates date range as single tag and skips empty date payload', () => {
    expect(
      generateTags({ date: ['2020-01-01', '2021-12-31'] } as any, configMap),
    ).toEqual([
      {
        key: 'date-range',
        filterKey: 'date',
        name: 'Date',
        value: ['2020-01-01', '2021-12-31'],
        displayValue: 'From 2020-01-01 to 2021-12-31',
      },
    ]);

    expect(
      generateTags({ date: [{ _exists_: ['date'] }] } as any, configMap),
    ).toEqual([]);
  });

  describe('grouped-value tags', () => {
    const UNIT_KEY = 'collectionSize.unitText';

    // The unit filter holds every case variant of the chosen unit. One tag per
    // value would repeat the same label and let the user strip one spelling
    // while the other kept filtering.
    it('creates a single tag for every spelling of one unit', () => {
      expect(
        generateTags({ [UNIT_KEY]: ['Assays', 'assays'] } as any, configMap),
      ).toEqual([
        {
          key: `${UNIT_KEY}-group`,
          filterKey: UNIT_KEY,
          name: 'Collection Size',
          value: ['Assays', 'assays'],
          displayValue: 'unit-Assays',
        },
      ]);
    });

    it('labels a single-spelling unit the same way', () => {
      const [tag] = generateTags({ [UNIT_KEY]: ['Genomes'] } as any, configMap);

      expect(tag.displayValue).toBe('unit-Genomes');
      expect(tag.value).toEqual(['Genomes']);
    });

    it('skips an empty unit selection', () => {
      expect(generateTags({ [UNIT_KEY]: [] } as any, configMap)).toEqual([]);
    });

    it('tags the unit separately from the range', () => {
      const tags = generateTags(
        {
          [UNIT_KEY]: ['Assays', 'assays'],
          'collectionSize.minValue': ['1000', '50000'],
        } as any,
        configMap,
      );

      expect(tags).toHaveLength(2);
      expect(tags.map(t => t.displayValue)).toEqual([
        'unit-Assays',
        '1,000 - 50,000',
      ]);
    });
  });

  describe('numeric range tags', () => {
    const RANGE_KEY = 'collectionSize.minValue';

    // One tag, not one per endpoint — otherwise removing a tag would leave
    // half a range behind.
    it('creates a single tag for both endpoints', () => {
      expect(
        generateTags({ [RANGE_KEY]: ['1000', '50000'] } as any, configMap),
      ).toEqual([
        {
          key: `${RANGE_KEY}-range`,
          filterKey: RANGE_KEY,
          name: 'Collection Size',
          value: ['1000', '50000'],
          displayValue: '1,000 - 50,000',
        },
      ]);
    });

    it('shows a single number when both endpoints match', () => {
      const [tag] = generateTags(
        { [RANGE_KEY]: ['1000', '1000'] } as any,
        configMap,
      );
      expect(tag.displayValue).toBe('1,000');
    });

    it('renders an unbounded upper end as a minimum', () => {
      const [tag] = generateTags(
        { [RANGE_KEY]: ['1000', '*'] } as any,
        configMap,
      );
      expect(tag.displayValue).toBe('>= 1,000');
    });

    it('renders an unbounded lower end as a maximum', () => {
      const [tag] = generateTags(
        { [RANGE_KEY]: ['*', '500'] } as any,
        configMap,
      );
      expect(tag.displayValue).toBe('<= 500');
    });

    it('skips an empty or fully unbounded range', () => {
      expect(generateTags({ [RANGE_KEY]: [] } as any, configMap)).toEqual([]);
      expect(
        generateTags({ [RANGE_KEY]: ['*', '*'] } as any, configMap),
      ).toEqual([]);
    });

    // The unit/range pairing is covered by "grouped-value tags" above, which
    // also asserts the unit label goes through the config's transform.
    it('names the range tag after the filter, not the raw API field', () => {
      const [tag] = generateTags(
        { [RANGE_KEY]: ['1000', '50000'] } as any,
        configMap,
      );

      expect(tag.name).toBe('Collection Size');
    });
  });

  it('creates a tag when filter values are unexpectedly a string', () => {
    expect(
      generateTags({ conditionsOfAccess: 'restricted' } as any, configMap),
    ).toEqual([
      {
        key: 'conditionsOfAccess-0',
        filterKey: 'conditionsOfAccess',
        name: 'Conditions',
        value: 'restricted',
        displayValue: 'coa-restricted',
      },
    ]);
  });

  it('creates a date tag when date values are unexpectedly a string', () => {
    expect(generateTags({ date: '2020-01-01' } as any, configMap)).toEqual([
      {
        key: 'date-0',
        filterKey: 'date',
        name: 'Date',
        value: '2020-01-01',
        displayValue: '2020-01-01',
      },
    ]);
  });

  it('creates transformed, display-name, and exists tags', () => {
    const tags = generateTags(
      {
        '@type': ['Dataset'],
        conditionsOfAccess: ['restricted'],
        'species.displayName.raw': ['common name | scientific name'],
        topic: [{ _exists_: ['topic'] }, { '-_exists_': ['topic'] }],
      } as any,
      configMap,
    );

    expect(tags.map(t => t.displayValue)).toEqual(
      expect.arrayContaining([
        'mapped-Dataset',
        'coa-restricted',
        'Scientific name (Common name)',
        'Specified',
        'Unspecified',
      ]),
    );
  });
});
