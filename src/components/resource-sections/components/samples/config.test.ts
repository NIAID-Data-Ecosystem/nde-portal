import { SAMPLE_TABLE_CONFIG, SAMPLE_COLLECTION_TABLE_CONFIG } from './config';

jest.mock('src/utils/formatting/formatSample', () => ({
  formatSampleLabelFromProperty: jest.fn(() => 'CAPTION(itemListElement)'),
}));

jest.mock('./helpers', () => ({
  getAvailableSamplePropertyColumns: jest.fn(() => [
    { key: 'k1', property: 'k1' },
  ]),
}));

import { getAvailableSamplePropertyColumns } from './helpers';

describe('samples config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SAMPLE_TABLE_CONFIG getRows returns a single-row array', () => {
    const sample = { '@type': 'Sample', foo: 1 } as any;
    expect(SAMPLE_TABLE_CONFIG.getRows(sample)).toEqual([sample]);
  });

  it('SAMPLE_TABLE_CONFIG getColumns delegates to getAvailableSamplePropertyColumns', () => {
    const sample = { '@type': 'Sample', foo: 1 } as any;
    const cols = SAMPLE_TABLE_CONFIG.getColumns(sample);

    expect(getAvailableSamplePropertyColumns).toHaveBeenCalledWith(sample);
    expect(cols).toEqual([{ key: 'k1', property: 'k1' }]);
  });

  it('SAMPLE_COLLECTION_TABLE_CONFIG builds identifier column + aggregate columns and maps rows', () => {
    const sampleCollection = {
      '@type': 'SampleCollection',
      itemListElement: [
        { identifier: 'S1', url: 'https://x.com' },
        { identifier: 'S2' },
      ],
      aggregateElement: { a: 1, b: 2 },
    } as any;

    const cols = SAMPLE_COLLECTION_TABLE_CONFIG.getColumns(sampleCollection);
    expect(cols[0]).toEqual(
      expect.objectContaining({
        title: 'Sample ID',
        property: 'identifier',
        isSortable: true,
      }),
    );
    expect(cols.slice(1)).toEqual([{ key: 'k1', property: 'k1' }]);

    const rows = SAMPLE_COLLECTION_TABLE_CONFIG.getRows(sampleCollection);
    expect(rows).toEqual([
      { identifier: { identifier: 'S1', url: 'https://x.com' }, a: 1, b: 2 },
      { identifier: { identifier: 'S2', url: '' }, a: 1, b: 2 },
    ]);

    expect(SAMPLE_COLLECTION_TABLE_CONFIG.caption).toBe(
      'CAPTION(itemListElement)',
    );
  });

  it('SAMPLE_COLLECTION_TABLE_CONFIG uses empty aggregate columns when aggregateElement missing', () => {
    const sampleCollection = {
      '@type': 'SampleCollection',
      itemListElement: [{ identifier: 'S1' }],
      aggregateElement: undefined,
    } as any;

    const cols = SAMPLE_COLLECTION_TABLE_CONFIG.getColumns(sampleCollection);
    // only show the identifier column
    expect(cols).toHaveLength(1);
    expect(cols[0].property).toBe('identifier');
  });
});
