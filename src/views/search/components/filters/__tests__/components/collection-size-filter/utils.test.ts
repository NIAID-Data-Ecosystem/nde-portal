import { FilterTermType } from '../../../types';
import {
  buildFilterPatch,
  buildUnitOptions,
  clampRange,
  getSelectedUnitKey,
  parseRangeValues,
} from '../../../components/collection-size-filter/utils';

const term = (
  value: string,
  count: number,
  label?: string,
): FilterTermType => ({
  term: value,
  label: label ?? value,
  count,
});

describe('collection-size-filter/utils', () => {
  describe('buildUnitOptions', () => {
    // useFilterQueries always prepends `_exists_` and may append `-_exists_`.
    // Neither is a unit the user can pick.
    it('drops the exists rows', () => {
      const options = buildUnitOptions([
        term('_exists_', 500),
        term('-_exists_', 20),
        term('Genomes', 10),
      ]);

      expect(options.map(option => option.label)).toEqual([
        'All Units',
        'Genomes',
      ]);
    });

    // The vocabulary is uncontrolled, so the same unit is indexed under
    // several spellings. Listing them separately would show duplicate rows and
    // let the user filter on one while the other went unqueried.
    it('groups case variants into one option', () => {
      const options = buildUnitOptions([
        term('Assays', 30, 'Assays'),
        term('assays', 12, 'Assays'),
      ]);

      expect(options).toHaveLength(2);
      expect(options[1]).toEqual({
        key: 'assays',
        label: 'Assays',
        terms: ['Assays', 'assays'],
        count: 42,
      });
    });

    it('labels a group after its most common spelling', () => {
      const options = buildUnitOptions([
        term('studies', 5, 'Studies'),
        term('STUDIES', 50, 'STUDIES'),
      ]);

      expect(options[1].label).toBe('STUDIES');
      expect(options[1].count).toBe(55);
    });

    it('puts All Units first and sorts the rest by count', () => {
      const options = buildUnitOptions([
        term('Genes', 5),
        term('Genomes', 90),
        term('Sites', 40),
      ]);

      expect(options.map(option => option.label)).toEqual([
        'All Units',
        'Genomes',
        'Sites',
        'Genes',
      ]);
      expect(options[0].terms).toEqual([]);
    });

    it('ignores empty terms', () => {
      expect(buildUnitOptions([term('', 4), term('   ', 2)])).toHaveLength(1);
    });
  });

  describe('getSelectedUnitKey', () => {
    it('resolves any spelling of the applied unit to its group', () => {
      expect(getSelectedUnitKey(['Assays', 'assays'])).toBe('assays');
    });

    it('falls back to All Units when nothing is applied', () => {
      expect(getSelectedUnitKey([])).toBe('');
      expect(getSelectedUnitKey(['_exists_'])).toBe('');
    });
  });

  describe('parseRangeValues', () => {
    it('reads both endpoints', () => {
      expect(parseRangeValues(['1000', '50000'])).toEqual({
        min: '1000',
        max: '50000',
      });
    });

    // `*` is how an open end is serialized, and it is not an input value.
    it('treats a wildcard or junk endpoint as blank', () => {
      expect(parseRangeValues(['*', '500'])).toEqual({ min: '', max: '500' });
      expect(parseRangeValues(['1000', '*'])).toEqual({
        min: '1000',
        max: '',
      });
      expect(parseRangeValues(['abc'])).toEqual({ min: '', max: '' });
    });
  });

  describe('buildFilterPatch', () => {
    const unit = {
      key: 'assays',
      label: 'Assays',
      terms: ['Assays', 'assays'],
      count: 42,
    };
    const allUnits = { key: '', label: 'All Units', terms: [], count: 0 };

    // Both keys are always written, so one route update carries the whole
    // filter state.
    it('writes every spelling of the unit alongside the range', () => {
      expect(buildFilterPatch({ unit, min: '1000', max: '50000' })).toEqual({
        'collectionSize.unitText': ['Assays', 'assays'],
        'collectionSize.minValue': ['1000', '50000'],
      });
    });

    it('marks an open end with a wildcard', () => {
      expect(buildFilterPatch({ unit, min: '1000', max: '' })).toEqual({
        'collectionSize.unitText': ['Assays', 'assays'],
        'collectionSize.minValue': ['1000', '*'],
      });
      expect(buildFilterPatch({ unit, min: '', max: '500' })).toEqual({
        'collectionSize.unitText': ['Assays', 'assays'],
        'collectionSize.minValue': ['*', '500'],
      });
    });

    // `[* TO *]` would filter nothing while still rendering a tag.
    it('clears both keys when nothing is selected', () => {
      expect(buildFilterPatch({ unit: allUnits, min: '', max: '' })).toEqual({
        'collectionSize.unitText': [],
        'collectionSize.minValue': [],
      });
    });
  });

  describe('clampRange', () => {
    const bounds = { min: 0, max: 1000 };

    it('keeps whole non-negative numbers', () => {
      expect(clampRange('10.7', '-5', bounds)).toEqual({
        min: '0',
        max: '10',
      });
    });

    // `[50000 TO 1000]` matches nothing, so a reversed range is corrected
    // rather than applied as typed.
    it('swaps reversed endpoints', () => {
      expect(clampRange('900', '100', bounds)).toEqual({
        min: '100',
        max: '900',
      });
    });

    it('holds endpoints inside the known bounds', () => {
      expect(clampRange('5000', '', bounds)).toEqual({
        min: '1000',
        max: '',
      });
    });

    it('leaves values alone when bounds are unknown', () => {
      expect(clampRange('5000', '9000')).toEqual({
        min: '5000',
        max: '9000',
      });
    });

    it('reads a blank endpoint as unbounded', () => {
      expect(clampRange('', '', bounds)).toEqual({ min: '', max: '' });
    });
  });
});
