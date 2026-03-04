import {
  formatUnitText,
  formatNumericValue,
  formatTerm,
  formatPropertyId,
  getAvailableSamplePropertyColumns,
  getSampleCollectionItemsColumns,
  getSampleCollectionItemsRows,
} from './helpers';

import {
  getValueByPath,
  hasNonEmptyValue,
} from 'src/components/resource-sections/helpers';
import { formatSampleLabelFromProperty } from 'src/utils/formatting/formatSample';

// Mock dependencies
jest.mock('src/components/resource-sections/helpers', () => ({
  getValueByPath: jest.fn(),
  hasNonEmptyValue: jest.fn(),
}));

jest.mock('src/utils/formatting/formatSample', () => ({
  formatSampleLabelFromProperty: jest.fn((str: string) => `LABEL(${str})`),
}));

// Mock config so tests don't depend on real column list
jest.mock('./config', () => ({
  SAMPLE_AGGREGATE_COLUMNS: [
    {
      key: 'identifier',
      includedProperties: ['identifier'],
      isSortable: true,
    },
    {
      key: 'rangeProp',
      includedProperties: ['min', 'max'],
      // Example transform to prove transform path works
      transform: (values: any) => ({ transformed: values }),
    },
    {
      key: 'emptyProp',
      includedProperties: ['empty'],
    },
    {
      key: 'titledProp',
      title: 'Explicit Title',
      includedProperties: ['titleVal'],
    },
    {
      key: 'species',
      includedProperties: ['species'],
    },
    {
      key: 'infectiousAgent',
      includedProperties: ['infectiousAgent'],
    },
    {
      key: 'healthCondition',
      includedProperties: ['healthCondition'],
    },
  ],
}));

describe('helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatUnitText', () => {
    it('returns empty string for undefined/empty', () => {
      expect(formatUnitText(undefined)).toBe('');
      expect(formatUnitText('')).toBe('');
    });

    it('lowercases and replaces underscores with spaces', () => {
      expect(formatUnitText('CELL_COUNT')).toBe('cell counts'); // adds plural s
      expect(formatUnitText('Foo_Bar')).toBe('foo bars');
    });

    it('does not add "s" if already ends with "s"', () => {
      expect(formatUnitText('cells')).toBe('cells');
      expect(formatUnitText('CELLs')).toBe('cells'); // lowercased, already ends with s
    });
  });

  describe('formatNumericValue', () => {
    it('formats exact value', () => {
      expect(formatNumericValue({ value: 1234 })).toBe('1,234');
    });

    it('formats range when min and max provided', () => {
      expect(formatNumericValue({ minValue: 1, maxValue: 10 })).toBe('1 - 10');
    });

    it('returns single number when min equals max', () => {
      expect(formatNumericValue({ minValue: 5, maxValue: 5 })).toBe('5');
    });

    it('formats >= when only min is provided', () => {
      expect(formatNumericValue({ minValue: 7 })).toBe('>= 7');
    });

    it('formats <= when only max is provided', () => {
      expect(formatNumericValue({ maxValue: 9 })).toBe('<= 9');
    });

    it('returns empty string when no values provided', () => {
      expect(formatNumericValue({})).toBe('');
    });
  });

  describe('formatTerm', () => {
    it('capitalizes the first letter', () => {
      expect(formatTerm('abc')).toBe('Abc');
      expect(formatTerm('hello world')).toBe('Hello world');
    });

    it('returns empty string for empty input', () => {
      expect(formatTerm('')).toBe('');
    });
  });

  describe('formatPropertyId', () => {
    it('capitalizes each word and joins with spaces', () => {
      expect(formatPropertyId('cell_type')).toBe('Cell Type');
      expect(formatPropertyId('disease_state')).toBe('Disease State');
    });

    it('handles a single word with no underscores', () => {
      expect(formatPropertyId('genomic')).toBe('Genomic');
    });

    it('normalizes mixed-case input — each word is title-cased', () => {
      expect(formatPropertyId('CELL_TYPE')).toBe('Cell Type');
      expect(formatPropertyId('cElL_tYpE')).toBe('Cell Type');
    });

    it('handles an empty string without throwing', () => {
      expect(formatPropertyId('')).toBe('');
    });
  });

  describe('getAvailableSamplePropertyColumns', () => {
    it('returns only configs whose includedProperties contain any non-empty value', () => {
      // Make getValueByPath return different values depending on the path
      (getValueByPath as jest.Mock).mockImplementation(
        (_data: any, path: string) => {
          switch (path) {
            case 'identifier':
              return 'ID-1';
            case 'min':
              return 1;
            case 'max':
              return 10;
            case 'empty':
              return null;
            case 'titleVal':
              return 'TV';
            default:
              return undefined;
          }
        },
      );

      // Treat null/undefined/'' as empty, everything else non-empty
      (hasNonEmptyValue as jest.Mock).mockImplementation((v: any) => {
        if (v == null) return false;
        if (typeof v === 'string') return v.trim().length > 0;
        return true;
      });

      const data = {} as any;

      const cols = getAvailableSamplePropertyColumns(data);

      // identifier included
      // rangeProp included (min/max) with transform
      // titledProp included (uses explicit title)
      // emptyProp excluded
      expect(cols.map(c => c.key)).toEqual([
        'identifier',
        'rangeProp',
        'titledProp',
      ]);

      // Default title uses formatSampleLabelFromProperty
      expect(formatSampleLabelFromProperty).toHaveBeenCalledWith('identifier');
      expect(cols.find(c => c.key === 'identifier')!.title).toBe(
        'LABEL(identifier)',
      );

      // Explicit title bypasses formatSampleLabelFromProperty
      expect(cols.find(c => c.key === 'titledProp')!.title).toBe(
        'Explicit Title',
      );

      // valuesForProps behavior:
      // - identifier has one path => values is that single value
      expect(cols.find(c => c.key === 'identifier')!.values).toBe('ID-1');

      // - rangeProp has two paths => values is an array, then transformed
      const range = cols.find(c => c.key === 'rangeProp')!;
      expect(range.values).toEqual({ transformed: [1, 10] });

      // includedProperties preserved
      expect(range.includedProperties).toEqual(['min', 'max']);
    });

    it('uses config.title when provided, otherwise formatSampleLabelFromProperty', () => {
      (getValueByPath as jest.Mock).mockReturnValue('X');
      (hasNonEmptyValue as jest.Mock).mockReturnValue(true);

      const cols = getAvailableSamplePropertyColumns({} as any);
      const titled = cols.find(c => c.key === 'titledProp')!;
      const identifier = cols.find(c => c.key === 'identifier')!;

      expect(titled.title).toBe('Explicit Title');
      expect(identifier.title).toBe('LABEL(identifier)');
    });

    it('sets isSortable default false when not provided', () => {
      (getValueByPath as jest.Mock).mockReturnValue('X');
      (hasNonEmptyValue as jest.Mock).mockReturnValue(true);

      const cols = getAvailableSamplePropertyColumns({} as any);
      expect(cols.find(c => c.key === 'identifier')!.isSortable).toBe(true);
      expect(cols.find(c => c.key === 'titledProp')!.isSortable).toBe(false);
    });
  });

  describe('getSampleCollectionItemsRows', () => {
    it('maps each sample to a row with identifier shaped as { identifier, url }', () => {
      // Two samples are used: one with a real URL to verify it is
      // preserved, and one with an empty string to verify that case is handled
      // without errors.
      const samples = [
        { identifier: 'S1', url: 'https://example.com', species: 'human' },
        { identifier: 'S2', url: '', species: 'mouse' },
      ] as any[];

      const rows = getSampleCollectionItemsRows(samples);

      expect(rows[0].identifier).toEqual({
        identifier: 'S1',
        url: 'https://example.com',
      });
      expect(rows[1].identifier).toEqual({ identifier: 'S2', url: '' });
    });

    it('falls back to _id when identifier is missing', () => {
      const samples = [{ _id: 'fallback-id' }] as any[];

      const rows = getSampleCollectionItemsRows(samples);

      expect(rows[0].identifier).toEqual({
        identifier: 'fallback-id',
        url: '',
      });
      expect(rows[0]._identifierSort).toBe('fallback-id');
    });

    it('preserves other sample fields on the row', () => {
      const samples = [
        { identifier: 'S1', species: 'human', cellType: 'neuron' },
      ] as any[];

      const rows = getSampleCollectionItemsRows(samples);

      // toMatchObject is used so the test only asserts that these
      // fields are present with the correct values.
      expect(rows[0]).toMatchObject({ species: 'human', cellType: 'neuron' });
    });

    it('flattens additionalProperty array into namespaced keys', () => {
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [
            { propertyID: 'cell_type', value: 'CD138+ plasma' },
            { propertyID: 'disease_state', value: 'tumor' },
          ],
        },
      ] as any[];

      const rows = getSampleCollectionItemsRows(samples);

      expect(rows[0]['additionalProperty__cell_type']).toBe('CD138+ plasma');
      expect(rows[0]['additionalProperty__disease_state']).toBe('tumor');
    });

    it('normalizes a single additionalProperty object (non-array) into a namespaced key', () => {
      // The API can return a single object instead of an array.
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: {
            propertyID: 'cell_type',
            value: 'CD138+ plasma',
          },
        },
      ] as any[];

      const rows = getSampleCollectionItemsRows(samples);

      expect(rows[0]['additionalProperty__cell_type']).toBe('CD138+ plasma');
    });

    it('adds no additionalProperty keys when additionalProperty is absent', () => {
      const samples = [{ identifier: 'S1' }] as any[];

      const rows = getSampleCollectionItemsRows(samples);

      const additionalKeys = Object.keys(rows[0]).filter(k =>
        k.startsWith('additionalProperty__'),
      );
      expect(additionalKeys).toHaveLength(0);
    });

    it('adds _identifierSort as a plain string matching the identifier', () => {
      const samples = [
        { identifier: 'S1', url: 'https://example.com' },
        { identifier: 'S2', url: '' },
      ] as any[];

      const rows = getSampleCollectionItemsRows(samples);

      expect(rows[0]._identifierSort).toBe('S1');
      expect(rows[1]._identifierSort).toBe('S2');
    });
  });

  describe('getSampleCollectionItemsColumns', () => {
    beforeEach(() => {
      const actual = jest.requireActual(
        'src/components/resource-sections/helpers',
      );
      (getValueByPath as jest.Mock).mockImplementation(actual.getValueByPath);
      (hasNonEmptyValue as jest.Mock).mockImplementation(
        actual.hasNonEmptyValue,
      );
    });

    it('always includes Sample ID as the first column', () => {
      // The Sample ID column uses '_identifierSort' (a plain string field on
      // each row) as its property so that useTableSort compares strings rather
      // than the { identifier, url } object used for rendering. The
      // SampleCollectionItemsTable getCells callback remaps '_identifierSort'
      // back to 'identifier' when reading the row for display.
      const samples = [{ identifier: 'S1' }] as any[];

      const cols = getSampleCollectionItemsColumns(samples);

      expect(cols[0]).toEqual({
        title: 'Sample ID',
        property: '_identifierSort',
        isSortable: true,
      });
    });

    it('excludes columns where no sample has a value', () => {
      // 'emptyProp' is in the mocked SAMPLE_AGGREGATE_COLUMNS with
      // includedProperties: ['empty']. Neither sample has an 'empty' field,
      // so the column should be excluded entirely (rule R1).
      const samples = [
        { identifier: 'S1', species: [{ name: 'human' }], emptyProp: null },
        { identifier: 'S2', species: [{ name: 'human' }], emptyProp: null },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).not.toContain('emptyProp');
    });

    it('excludes species when all values are uniform', () => {
      // 'species' is one of the UNIFORM_HIDE_PROPS special fields. When every
      // sample shares the same value it should be hidden entirely (rule R2).
      const samples = [
        { identifier: 'S1', species: [{ name: 'Human' }] },
        { identifier: 'S2', species: [{ name: 'Human' }] },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).not.toContain('species');
    });

    it('includes species when values differ across samples', () => {
      // When species values differ across samples it is no longer
      // uniform and should appear as a column.
      const samples = [
        { identifier: 'S1', species: [{ name: 'human' }] },
        { identifier: 'S2', species: [{ name: 'mouse' }] },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).toContain('species');
    });

    it('excludes infectiousAgent when all values are uniform', () => {
      const samples = [
        { identifier: 'S1', infectiousAgent: [{ name: 'SARS-CoV-2' }] },
        { identifier: 'S2', infectiousAgent: [{ name: 'SARS-CoV-2' }] },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).not.toContain('infectiousAgent');
    });

    it('includes infectiousAgent when values differ across samples', () => {
      const samples = [
        { identifier: 'S1', infectiousAgent: [{ name: 'SARS-CoV-2' }] },
        { identifier: 'S2', infectiousAgent: [{ name: 'Influenza A' }] },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).toContain('infectiousAgent');
    });

    it('excludes healthCondition when all values are uniform', () => {
      const samples = [
        { identifier: 'S1', healthCondition: [{ name: 'Healthy' }] },
        { identifier: 'S2', healthCondition: [{ name: 'Healthy' }] },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).not.toContain('healthCondition');
    });

    it('includes healthCondition when values differ across samples', () => {
      const samples = [
        { identifier: 'S1', healthCondition: [{ name: 'Healthy' }] },
        { identifier: 'S2', healthCondition: [{ name: 'Tumor' }] },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).toContain('healthCondition');
    });

    it('places non-uniform columns before uniform ones (after Sample ID)', () => {
      // 'rangeProp' maps to includedProperties ['min', 'max'] in the mock
      // config. 'titledProp' maps to includedProperties ['titleVal'].
      // min/max differ across samples (1-10 vs 2-20) so rangeProp is
      // non-uniform. titleVal is identical ('X') so titledProp is uniform.
      // Non-uniform columns should appear before uniform ones.
      const samples = [
        { identifier: 'S1', min: 1, max: 10, titleVal: 'X' },
        { identifier: 'S2', min: 2, max: 20, titleVal: 'X' },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      const rangePropIdx = props.indexOf('rangeProp'); // non-uniform
      const titledPropIdx = props.indexOf('titledProp'); // uniform

      expect(rangePropIdx).toBeGreaterThan(0);
      expect(rangePropIdx).toBeLessThan(titledPropIdx);
    });

    it('sorts non-uniform and uniform groups alphabetically by title', () => {
      // Both groups (non-uniform and uniform) should
      // be sorted alphabetically by display title within their group.
      const samples = [
        { identifier: 'S1', min: 1, max: 10, titleVal: 'X' },
        { identifier: 'S2', min: 2, max: 20, titleVal: 'X' },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const nonIdCols = cols.slice(1).map(c => c.title);

      expect(nonIdCols).toEqual(
        [...nonIdCols].sort((a, b) => a.localeCompare(b)),
      );
    });

    it('adds a column for a non-uniform additionalProperty (rule R3)', () => {
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [{ propertyID: 'cell_type', value: 'plasma' }],
        },
        {
          identifier: 'S2',
          additionalProperty: [{ propertyID: 'cell_type', value: 'neuron' }],
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const col = cols.find(
        c => c.property === 'additionalProperty__cell_type',
      );

      expect(col).toBeDefined();
      expect(col!.title).toBe('Cell Type');
    });

    it('hides an additionalProperty column when all values are uniform', () => {
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [{ propertyID: 'cell_type', value: 'plasma' }],
        },
        {
          identifier: 'S2',
          additionalProperty: [{ propertyID: 'cell_type', value: 'plasma' }],
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).not.toContain('additionalProperty__cell_type');
    });

    it('treats a missing additionalProperty on one sample as non-uniform', () => {
      // S1 has cell_type; S2 does not. The absent value is treated as __NULL__,
      // which differs from 'plasma', so the column should appear.
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [{ propertyID: 'cell_type', value: 'plasma' }],
        },
        {
          identifier: 'S2',
          // no additionalProperty at all
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).toContain('additionalProperty__cell_type');
    });

    it('does not crash when additionalProperty is a single object instead of an array', () => {
      // Regression test for the runtime TypeError: .map is not a function.
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: { propertyID: 'cell_type', value: 'plasma' },
        },
        {
          identifier: 'S2',
          additionalProperty: { propertyID: 'cell_type', value: 'neuron' },
        },
      ] as any[];

      expect(() => getSampleCollectionItemsColumns(samples)).not.toThrow();

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);
      expect(props).toContain('additionalProperty__cell_type');
    });

    it('uses formatPropertyId to title-case the column header', () => {
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [{ propertyID: 'disease_state', value: 'tumor' }],
        },
        {
          identifier: 'S2',
          additionalProperty: [
            { propertyID: 'disease_state', value: 'healthy' },
          ],
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const col = cols.find(
        c => c.property === 'additionalProperty__disease_state',
      );

      expect(col!.title).toBe('Disease State');
    });

    it('places additionalProperty columns after all standard columns', () => {
      // Give samples both a standard varying field (min/max) and a varying
      // additionalProperty so both kinds appear in the output.
      const samples = [
        {
          identifier: 'S1',
          min: 1,
          max: 5,
          additionalProperty: [{ propertyID: 'cell_type', value: 'plasma' }],
        },
        {
          identifier: 'S2',
          min: 2,
          max: 10,
          additionalProperty: [{ propertyID: 'cell_type', value: 'neuron' }],
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      const rangePropIdx = props.indexOf('rangeProp');
      const additionalPropIdx = props.indexOf('additionalProperty__cell_type');

      // additionalProperty columns must come after all standard columns.
      expect(additionalPropIdx).toBeGreaterThan(rangePropIdx);
    });

    it('sorts multiple additionalProperty columns alphabetically', () => {
      // Three non-uniform properties whose titles, when sorted, should be:
      // "Cell Type", "Disease State", "Sample Type"
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [
            { propertyID: 'sample_type', value: 'reference' },
            { propertyID: 'cell_type', value: 'plasma' },
            { propertyID: 'disease_state', value: 'tumor' },
          ],
        },
        {
          identifier: 'S2',
          additionalProperty: [
            { propertyID: 'sample_type', value: 'control' },
            { propertyID: 'cell_type', value: 'neuron' },
            { propertyID: 'disease_state', value: 'healthy' },
          ],
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const additionalCols = cols
        .filter(c => c.property.startsWith('additionalProperty__'))
        .map(c => c.title);

      expect(additionalCols).toEqual(
        [...additionalCols].sort((a, b) => a.localeCompare(b)),
      );
      expect(additionalCols).toEqual([
        'Cell Type',
        'Disease State',
        'Sample Type',
      ]);
    });

    it('handles a mix of uniform and non-uniform additionalProperty fields', () => {
      // cell_type differs: should appear;
      // sample_type is the same: should be hidden
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [
            { propertyID: 'cell_type', value: 'plasma' },
            { propertyID: 'sample_type', value: 'reference' },
          ],
        },
        {
          identifier: 'S2',
          additionalProperty: [
            { propertyID: 'cell_type', value: 'neuron' },
            { propertyID: 'sample_type', value: 'reference' },
          ],
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const props = cols.map(c => c.property);

      expect(props).toContain('additionalProperty__cell_type');
      expect(props).not.toContain('additionalProperty__sample_type');
    });

    it('produces isSortable: false for all additionalProperty columns', () => {
      const samples = [
        {
          identifier: 'S1',
          additionalProperty: [{ propertyID: 'cell_type', value: 'plasma' }],
        },
        {
          identifier: 'S2',
          additionalProperty: [{ propertyID: 'cell_type', value: 'neuron' }],
        },
      ] as any[];

      const cols = getSampleCollectionItemsColumns(samples);
      const additionalCols = cols.filter(c =>
        c.property.startsWith('additionalProperty__'),
      );

      additionalCols.forEach(col => expect(col.isSortable).toBe(false));
    });
  });
});
