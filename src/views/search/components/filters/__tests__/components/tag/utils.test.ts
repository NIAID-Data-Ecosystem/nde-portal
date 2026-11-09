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

  it('labels filters outside the filter list from the schema definitions', () => {
    expect(generateTagName('sdPublisher.name')).toBe('SDPublisher Name');
    // Schema definitions are keyed without the `.raw` keyword suffix.
    expect(generateTagName('sdPublisher.name.raw')).toBe('SDPublisher Name');
    expect(generateTagName('_id')).toBe('ID');
    expect(generateTagName('notInSchema')).toBe('notInSchema');

    expect(
      generateTags({ 'sdPublisher.name.raw': ['ImmPort'] } as any, configMap),
    ).toEqual([
      {
        key: 'sdPublisher.name.raw-0',
        filterKey: 'sdPublisher.name.raw',
        name: 'SDPublisher Name',
        value: 'ImmPort',
        displayValue: 'ImmPort',
      },
    ]);
  });

  it('renders one tag per value of every field in an `_or` group', () => {
    const orConfigMap = {
      ...configMap,
      'includedInDataCatalog.name': {
        id: 'includedInDataCatalog',
        name: 'Sources',
        property: 'includedInDataCatalog.name',
        category: 'Shared',
        queryType: 'source',
        description: '',
      },
    } as any;

    const tags = generateTags(
      {
        _or: [
          { 'includedInDataCatalog.name': ['acd@NIAID'] },
          {
            'includedInDataCatalog.name': ['Data Discovery Engine (DDE)'],
            _id: ['dde_123'],
          },
        ],
      } as any,
      orConfigMap,
    );

    expect(
      tags.map(({ filterKey, name, value, displayValue }) => ({
        filterKey,
        name,
        value,
        displayValue,
      })),
    ).toEqual([
      {
        filterKey: 'includedInDataCatalog.name',
        name: 'Sources',
        value: 'acd@NIAID',
        displayValue: 'acd@NIAID',
      },
      {
        filterKey: 'includedInDataCatalog.name',
        name: 'Sources',
        value: 'Data Discovery Engine (DDE)',
        displayValue: 'Data Discovery Engine (DDE)',
      },
      // `_id` isn't in the filter list but still gets a tag.
      {
        filterKey: '_id',
        name: 'ID',
        value: 'dde_123',
        displayValue: 'dde_123',
      },
    ]);
    expect(new Set(tags.map(tag => tag.key)).size).toBe(3);
  });

  it('labels `_or` group fields outside the filter list from the schema definitions', () => {
    const tags = generateTags(
      {
        _or: [{ 'sdPublisher.name.raw': ['ImmPort'] }, { notInSchema: ['b'] }],
      } as any,
      configMap,
    );

    expect(
      tags.map(({ filterKey, name, displayValue }) => ({
        filterKey,
        name,
        displayValue,
      })),
    ).toEqual([
      {
        filterKey: 'sdPublisher.name.raw',
        name: 'SDPublisher Name',
        displayValue: 'ImmPort',
      },
      { filterKey: 'notInSchema', name: 'notInSchema', displayValue: 'b' },
    ]);
  });
});
