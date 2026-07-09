jest.mock('src/utils/formatting/formatResourceType', () => ({
  formatResourceTypeForAPI: jest.fn((value: string) => `api-${value}`),
}));

import {
  OR_FILTER_KEY,
  queryFilterObject2String,
  queryFilterString2Object,
  normalizeFilterValues,
  getSelectedFilterDisplay,
} from '../../utils/query-string';
import { SelectedFilterType } from '../../types';

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

  it('never serializes the reserved _applyDefaultDate marker', () => {
    const result = queryFilterObject2String({
      topic: ['alpha'],
      _applyDefaultDate: false,
    } as unknown as Parameters<typeof queryFilterObject2String>[0]);

    expect(result).toBe('(topic:("alpha"))');
    expect(result).not.toContain('_applyDefaultDate');
  });

  it('returns null when only the reserved _applyDefaultDate marker is present', () => {
    expect(
      queryFilterObject2String({
        _applyDefaultDate: false,
      } as unknown as Parameters<typeof queryFilterObject2String>[0]),
    ).toBeNull();
  });

  it('handles a selected filter value that is unexpectedly a string', () => {
    const result = queryFilterObject2String({
      topic: 'alpha',
    } as unknown as Parameters<typeof queryFilterObject2String>[0]);

    expect(result).toBe('(topic:("alpha"))');
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

  it('serializes and round-trips a cross-field OR (`_or`) group', () => {
    const filters: SelectedFilterType = {
      [OR_FILTER_KEY]: [
        { 'includedInDataCatalog.name': ['acd@NIAID'] },
        { _id: ['dde_123'] },
      ],
    };
    const str = queryFilterObject2String(filters);

    expect(str).toBe(
      '(includedInDataCatalog.name:("acd@NIAID") OR _id:("dde_123"))',
    );
    expect(queryFilterString2Object(str!)).toEqual(filters);
  });

  it('keeps a single field multi-value OR distinct from an `_or` group', () => {
    // The inner OR sits inside the parens -> a single field, not an `_or` group.
    expect(queryFilterString2Object('(topic:("alpha" OR "beta"))')).toEqual({
      topic: ['alpha', 'beta'],
    });
  });

  it('AND-combines an `_or` group with other filters without disturbing them', () => {
    const filters: SelectedFilterType = {
      [OR_FILTER_KEY]: [
        { 'includedInDataCatalog.name': ['acd@NIAID'] },
        { _id: ['dde_123'] },
      ],
      topic: ['alpha'],
    };
    const str = queryFilterObject2String(filters);
    expect(str).toContain(
      '(includedInDataCatalog.name:("acd@NIAID") OR _id:("dde_123"))',
    );
    expect(str).toContain('(topic:("alpha"))');
    expect(str).toContain(' AND ');
    expect(queryFilterString2Object(str!)).toEqual(filters);
  });

  it('does not misparse an _exists_ OR group as a cross-field `_or`', () => {
    // Later segments start with `(` (no `field:` prefix), so this stays a
    // single-field parse and never produces an `_or` key.
    const parsed = queryFilterString2Object(
      '(source:(_exists_:("source")) OR (-_exists_:("source")))',
    );
    expect(parsed).not.toBeNull();
    expect(parsed).not.toHaveProperty(OR_FILTER_KEY);
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
