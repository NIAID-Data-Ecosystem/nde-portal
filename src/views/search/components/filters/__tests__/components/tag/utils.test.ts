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

  it('renders a cross-field OR (`_or`) group as one tag labelled from a known facet', () => {
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
          { _id: ['dde_123'] },
        ],
      } as any,
      orConfigMap,
    );

    expect(tags).toHaveLength(1);
    expect(tags[0]).toMatchObject({
      filterKey: '_or',
      name: 'Sources',
      displayValue: 'acd@NIAID',
    });
    // The tag's value is the whole group so removing it clears the filter.
    expect(tags[0].value).toEqual([
      { 'includedInDataCatalog.name': ['acd@NIAID'] },
      { _id: ['dde_123'] },
    ]);
  });
});
