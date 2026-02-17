import {
  formatUnitText,
  formatNumericValue,
  formatTerm,
  getAvailableSamplePropertyColumns,
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
});
