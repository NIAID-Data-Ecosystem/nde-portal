jest.mock('src/utils/formatting/formatResourceType', () => ({
  formatResourceTypeForAPI: jest.fn((value: string) => `api-${value}`),
}));

import {
  queryFilterObject2String,
  queryFilterString2Object,
  normalizeFilterValues,
  getSelectedFilterDisplay,
} from '../../utils/query-string';

describe('filters/utils/query-string', () => {
  it('builds query strings for standard values, date ranges, @type, and exists objects', () => {
    const result = queryFilterObject2String({
      topic: ['alpha', 'beta'],
      date: ['2020-01-01', '2021-12-31'],
      '@type': ['Dataset'],
      source: [{ _exists_: ['source'] }, { '-_exists_': ['source'] }],
      empty: [''],
    });

    expect(result).toContain('(topic:("alpha" OR "beta"))');
    expect(result).toContain('(date:["2020-01-01" TO "2021-12-31"])');
    expect(result).toContain('(@type:("api-Dataset"))');
    expect(result).toContain(
      '(source:(_exists_:("source")) OR (-_exists_:("source")))',
    );
  });

  it('returns null for no selected filter values', () => {
    expect(queryFilterObject2String({ topic: [], date: [] })).toBeNull();
  });

  it('parses query strings back to filter objects', () => {
    const parsed = queryFilterString2Object(
      '(topic:("alpha" OR "beta")) AND (date:["2020-01-01" TO "2021-12-31"])',
    );
    expect(parsed).toEqual({
      topic: ['alpha', 'beta'],
      date: ['2020-01-01', '2021-12-31'],
    });
  });

  it('handles invalid and array queryString input safely', () => {
    expect(queryFilterString2Object(undefined)).toBeNull();
    expect(queryFilterString2Object(['a', 'b'])).toBeNull();
    expect(queryFilterString2Object('(invalid)')).toEqual({});
  });

  it('normalizes exists values and selected display values', () => {
    expect(
      normalizeFilterValues(['_exists_', '-_exists_', 'x'], 'facet'),
    ).toEqual([{ _exists_: ['facet'] }, { '-_exists_': ['facet'] }, 'x']);

    expect(
      getSelectedFilterDisplay([
        { _exists_: ['f'] },
        { '-_exists_': ['f'] },
        'x',
      ]),
    ).toEqual(['_exists_', '-_exists_', 'x']);
  });

  it('supports date exact-match formatting and wrapper converters', () => {
    const q = queryFilterObject2String({ date: ['2020-01-01'] });
    expect(q).toBe('(date:2020-01-01)');
    expect(queryFilterString2Object(q!)).toEqual({ date: ['2020-01-01'] });
    expect(queryFilterString2Object('')).toBeNull();
  });
});
