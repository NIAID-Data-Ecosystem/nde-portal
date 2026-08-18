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

  // The Content Type filter maps to two API fields: about.name and
  // exampleOfWork.about.name. The generated query must apply the selected
  // values to both fields with OR, and parsing that query back must preserve
  // the original filter so the selection is not lost after a page reload.
  describe('merged multi-field filters', () => {
    const ABOUT = 'about.name';
    const EXAMPLE_OF_WORK = 'exampleOfWork.about.name';

    it('emits one OR-joined clause per field', () => {
      expect(queryFilterObject2String({ [ABOUT]: ['Genome'] })).toBe(
        `((${ABOUT}:("Genome")) OR (${EXAMPLE_OF_WORK}:("Genome")))`,
      );
    });

    it('repeats every selected value across both fields', () => {
      expect(
        queryFilterObject2String({ [ABOUT]: ['Genome', 'Tomogram'] }),
      ).toBe(
        `((${ABOUT}:("Genome" OR "Tomogram")) OR ` +
          `(${EXAMPLE_OF_WORK}:("Genome" OR "Tomogram")))`,
      );
    });

    it('retargets _exists_ values at the field of their own clause', () => {
      expect(
        queryFilterObject2String({ [ABOUT]: [{ _exists_: [ABOUT] }] }),
      ).toBe(
        `((${ABOUT}:(_exists_:("${ABOUT}"))) OR ` +
          `(${EXAMPLE_OF_WORK}:(_exists_:("${EXAMPLE_OF_WORK}"))))`,
      );
    });

    it.each([
      ['a single value', { [ABOUT]: ['Genome'] }],
      ['several values', { [ABOUT]: ['Genome', 'Tomogram'] }],
      ['an _exists_ value', { [ABOUT]: [{ _exists_: [ABOUT] }] }],
    ])('round-trips %s back to the filter object', (_label, filters) => {
      const built = queryFilterObject2String(filters);
      expect(queryFilterString2Object(built!)).toEqual(filters);
    });

    it('round-trips alongside other filters joined by AND', () => {
      const filters = {
        'topicCategory.name.raw': ['Genomics'],
        [ABOUT]: ['Genome'],
      };
      const built = queryFilterObject2String(filters);

      expect(built).toBe(
        '(topicCategory.name.raw:("Genomics")) AND ' +
          `((${ABOUT}:("Genome")) OR (${EXAMPLE_OF_WORK}:("Genome")))`,
      );
      expect(queryFilterString2Object(built!)).toEqual(filters);
    });

    it('still parses the pre-merge single-field form, so old URLs keep working', () => {
      expect(queryFilterString2Object(`(${ABOUT}:("Genome"))`)).toEqual({
        [ABOUT]: ['Genome'],
      });
    });
  });
});
