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
        'Any',
        'None',
      ]),
    );
  });
});
