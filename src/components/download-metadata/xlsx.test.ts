import { strFromU8, unzipSync } from 'fflate';

import {
  buildXlsxWorkbook,
  computeXlsxLayout,
  downloadXlsxExport,
  getPartFileName,
  partitionRows,
  prepareXlsxExport,
  XlsxColumnSpec,
  XlsxLimits,
} from './xlsx';

// Each built workbook is a small marker holding the number of rows written,
// so tests can tell which part ended up where.
const mockWriteXlsx = jest.fn((args: any) =>
  Promise.resolve(new Uint8Array([args.sheets[0].rows.length])),
);

jest.mock('hucre/xlsx', () => ({
  writeXlsx: (args: any) => mockWriteXlsx(args),
}));

type Row = Record<string, string | string[] | undefined>;

const column = (header: string, key: string): XlsxColumnSpec<Row> => ({
  header,
  getEntries: row => (row[key] ? [{ text: row[key] as string }] : []),
});

// A column whose cells hold one linked entry per value.
const linkColumn = (header: string, key: string): XlsxColumnSpec<Row> => ({
  header,
  getEntries: row =>
    ((row[key] as string[] | undefined) || []).map(value => ({
      text: value,
      url: `https://example.org/${value}`,
    })),
});

const getSheet = () => mockWriteXlsx.mock.calls.at(-1)![0].sheets[0];
const getHeaders = () => getSheet().rows[0].map((cell: any) => cell.value);

const LIMITS: XlsxLimits = {
  cellsPerFile: 1_000,
  rowsPerFile: 1_000,
  linksPerFile: 1_000,
};

// A column whose cells hold several plain-text values.
const listColumn = (header: string, key: string): XlsxColumnSpec<Row> => ({
  header,
  getEntries: row =>
    ((row[key] as string[] | undefined) || []).map(value => ({ text: value })),
});

// A column whose cells hold a single linked value.
const singleLinkColumn = (
  header: string,
  key: string,
): XlsxColumnSpec<Row> => ({
  header,
  getEntries: row =>
    row[key]
      ? [{ text: row[key] as string, url: `https://example.org/${row[key]}` }]
      : [],
});

const link = (value: string) => ({
  value,
  hyperlink: { target: `https://example.org/${value}` },
  style: expect.any(Object),
});

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, idx) => ({ name: `Row ${idx}` }));

const blobs: Blob[] = [];

beforeAll(() => {
  global.URL.createObjectURL = jest.fn((blob: Blob) => {
    blobs.push(blob);
    return `blob:${blobs.length}`;
  });
});

// jsdom's Blob has no arrayBuffer(), so read it with FileReader.
const lastBlobBytes = () =>
  new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blobs.at(-1)!);
  });

describe('buildXlsxWorkbook', () => {
  beforeEach(() => mockWriteXlsx.mockClear());

  const columns = [
    column('Name', 'name'),
    column('Empty', 'empty'),
    column('Sparse', 'sparse'),
    column('Date', 'date'),
  ];

  it('drops columns with no data in any row and keeps the order of the rest', async () => {
    await buildXlsxWorkbook({
      sheetName: 'Datasets',
      columns,
      rows: [
        { name: 'A', date: '2024', empty: '' },
        { name: 'B', sparse: 'x', date: '2025' },
      ],
    });

    expect(getHeaders()).toEqual(['Name', 'Sparse', 'Date']);
    expect(getSheet().columns).toHaveLength(3);
    expect(getSheet().rows[1]).toEqual(['A', null, '2024']);
    expect(getSheet().rows[2]).toEqual(['B', 'x', '2025']);
  });

  it('keeps every header when all columns are empty', async () => {
    await buildXlsxWorkbook({ sheetName: 'Datasets', columns, rows: [{}] });

    expect(getHeaders()).toEqual(['Name', 'Empty', 'Sparse', 'Date']);
  });

  it('keeps one column per property and stacks multiple values over rows', async () => {
    await buildXlsxWorkbook({
      sheetName: 'Datasets',
      columns: [
        column('Name', 'name'),
        linkColumn('Topic', 'topics'),
        linkColumn('Species', 'species'),
        listColumn('Keywords', 'keywords'),
        singleLinkColumn('Source', 'source'),
      ],
      rows: [
        {
          name: 'A',
          topics: ['t1', 't2', 't3'],
          species: ['s1', 's2'],
          keywords: ['k1', 'k2'],
          source: 'src',
        },
        { name: 'B', topics: ['t1'], keywords: ['k3'] },
      ],
    });

    const { rows } = getSheet();
    expect(getHeaders()).toEqual([
      'Name',
      'Topic',
      'Species',
      'Keywords',
      'Source',
    ]);
    expect(getSheet().columns).toHaveLength(5);
    // Header + 3 rows for record A + 1 row for record B.
    expect(rows).toHaveLength(5);
    // Single values repeat on every row of a record; stacked columns (links
    // or plain text) are filled top-down and blank below.
    expect(rows[1]).toEqual(['A', link('t1'), link('s1'), 'k1', link('src')]);
    expect(rows[2]).toEqual(['A', link('t2'), link('s2'), 'k2', link('src')]);
    expect(rows[3]).toEqual(['A', link('t3'), null, null, link('src')]);
    // A stacked column's single entry is not repeated (B has only one row).
    expect(rows[4]).toEqual(['B', link('t1'), null, 'k3', null]);
  });

  it('does not repeat a single entry in a stacked column', async () => {
    await buildXlsxWorkbook({
      sheetName: 'Datasets',
      columns: [
        linkColumn('Topic', 'topics'),
        linkColumn('Species', 'species'),
      ],
      rows: [
        { topics: ['t1', 't2'], species: ['s1'] },
        // Makes Species a stacked column.
        { species: ['s2', 's3'] },
      ],
    });

    const { rows } = getSheet();
    expect(rows).toHaveLength(5);
    expect(rows[1]).toEqual([link('t1'), link('s1')]);
    expect(rows[2]).toEqual([link('t2'), null]);
    expect(rows[3]).toEqual([null, link('s2')]);
    expect(rows[4]).toEqual([null, link('s3')]);
  });

  it('repeats a column that never holds more than one link', async () => {
    await buildXlsxWorkbook({
      sheetName: 'Datasets',
      columns: [
        linkColumn('Topic', 'topics'),
        linkColumn('Species', 'species'),
      ],
      rows: [{ topics: ['t1', 't2'], species: ['s1'] }],
    });

    const { rows } = getSheet();
    expect(rows[1]).toEqual([link('t1'), link('s1')]);
    expect(rows[2]).toEqual([link('t2'), link('s1')]);
  });

  it('repeats a plain-text column that never holds more than one value', async () => {
    await buildXlsxWorkbook({
      sheetName: 'Datasets',
      columns: [listColumn('Keywords', 'keywords'), column('Date', 'date')],
      rows: [{ keywords: ['k1', 'k2', 'k3'], date: '2024' }],
    });

    const { rows } = getSheet();
    expect(rows.slice(1)).toEqual([
      ['k1', '2024'],
      ['k2', '2024'],
      ['k3', '2024'],
    ]);
  });

  it('stacks a column mixing links and plain text, one value per row', async () => {
    await buildXlsxWorkbook({
      sheetName: 'Datasets',
      columns: [
        column('Name', 'name'),
        {
          header: 'Funding',
          getEntries: () => [
            { text: 'f1', url: 'https://example.org/f1' },
            { text: 'Unlinked grant' },
            { text: 'f2', url: 'https://example.org/f2' },
          ],
        },
      ],
      rows: [{ name: 'A' }],
    });

    const { rows } = getSheet();
    expect(rows.slice(1)).toEqual([
      ['A', link('f1')],
      ['A', 'Unlinked grant'],
      ['A', link('f2')],
    ]);
  });
});

describe('computeXlsxLayout', () => {
  it('counts columns, rows per record and hyperlinks per record', () => {
    const layout = computeXlsxLayout({
      sheetName: 'Datasets',
      columns: [
        column('Name', 'name'),
        linkColumn('Topic', 'topics'),
        singleLinkColumn('Source', 'source'),
        listColumn('Keywords', 'keywords'),
      ],
      rows: [
        { name: 'A', topics: ['x', 'y', 'z'], source: 'src' },
        { name: 'B', topics: ['x'] },
        // Plain-text values also take a row each.
        { name: 'C', source: 'src', keywords: ['k1', 'k2', 'k3', 'k4'] },
      ],
    });

    expect(layout.width).toBe(4);
    expect(layout.recordHeights).toEqual([3, 1, 4]);
    expect(layout.sheetRowCount).toBe(8);
    // A: 3 stacked links + the single source link repeated on its 3 rows.
    // C: the single source link repeated on its 4 rows.
    expect(layout.linkCounts).toEqual([6, 1, 4]);
  });
});

describe('partitionRows', () => {
  const layoutFor = (rows: Row[], columns = [column('Name', 'name')]) =>
    computeXlsxLayout({ sheetName: 'Datasets', columns, rows });

  it('keeps everything in one part when it fits', () => {
    expect(partitionRows(layoutFor(makeRows(10)), LIMITS)).toEqual([
      { start: 0, end: 10 },
    ]);
  });

  it('splits by cell budget, leaving room for the header row', () => {
    const limits = { ...LIMITS, cellsPerFile: 10 };
    // 1 column, 10 cells per file => 9 data rows + header.
    expect(partitionRows(layoutFor(makeRows(20)), limits)).toEqual([
      { start: 0, end: 9 },
      { start: 9, end: 18 },
      { start: 18, end: 20 },
    ]);
  });

  it('splits by row budget', () => {
    const limits = { ...LIMITS, rowsPerFile: 5 };
    expect(partitionRows(layoutFor(makeRows(10)), limits)).toEqual([
      { start: 0, end: 4 },
      { start: 4, end: 8 },
      { start: 8, end: 10 },
    ]);
  });

  it('splits by sheet rows when records span several rows', () => {
    const limits = { ...LIMITS, rowsPerFile: 6 }; // 5 data rows + header
    const rows: Row[] = [
      { topics: ['a', 'b'] }, // 2 rows
      { topics: ['a', 'b', 'c'] }, // 3 rows
      { topics: ['a', 'b'] }, // 2 rows
      { topics: ['a'] }, // 1 row
    ];
    const layout = layoutFor(rows, [linkColumn('Topic', 'topics')]);
    expect(partitionRows(layout, limits)).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]);
  });

  it('splits by cell budget counting every row of a record', () => {
    // 2 columns, 12 cells per file => 5 data rows + header.
    const limits = { ...LIMITS, cellsPerFile: 12 };
    const rows: Row[] = [
      { name: 'A', topics: ['a', 'b', 'c', 'd'] }, // 4 rows
      { name: 'B', topics: ['a', 'b'] }, // 2 rows
      { name: 'C' }, // 1 row
    ];
    const layout = layoutFor(rows, [
      column('Name', 'name'),
      linkColumn('Topic', 'topics'),
    ]);
    expect(partitionRows(layout, limits)).toEqual([
      { start: 0, end: 1 },
      { start: 1, end: 3 },
    ]);
  });

  it('gives a record taller than the budget a file of its own', () => {
    const limits = { ...LIMITS, rowsPerFile: 3 }; // 2 data rows + header
    const rows: Row[] = [
      { topics: ['a'] },
      { topics: ['a', 'b', 'c', 'd'] },
      { topics: ['a'] },
    ];
    const layout = layoutFor(rows, [linkColumn('Topic', 'topics')]);
    expect(partitionRows(layout, limits)).toEqual([
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      { start: 2, end: 3 },
    ]);
  });

  it('splits by hyperlink budget, never splitting a row', () => {
    const limits = { ...LIMITS, linksPerFile: 3 };
    const rows: Row[] = [
      { topics: ['a', 'b'] },
      { topics: ['a', 'b'] },
      { topics: ['a', 'b', 'c', 'd'] },
      { topics: ['a'] },
    ];
    const layout = layoutFor(rows, [linkColumn('Topic', 'topics')]);
    expect(partitionRows(layout, limits)).toEqual([
      { start: 0, end: 1 },
      { start: 1, end: 2 },
      // Over budget on its own, but a row can't be split.
      { start: 2, end: 3 },
      { start: 3, end: 4 },
    ]);
  });
});

describe('prepareXlsxExport', () => {
  it('keeps the width fixed and splits by the rows link stacking adds', () => {
    // With a 60-cell budget, 2 columns fit 29 data rows per file. 20 records
    // would fit in one file, but one record has 20 links and takes 20 rows,
    // making 39 sheet rows in total.
    const limits = { ...LIMITS, cellsPerFile: 60 };
    const rows: Row[] = Array.from({ length: 20 }, (_, idx) => ({
      name: `Row ${idx}`,
      topics:
        idx === 0
          ? Array.from({ length: 20 }, (__, linkIdx) => `t${linkIdx}`)
          : ['a'],
    }));

    const { layout, ranges } = prepareXlsxExport(
      {
        sheetName: 'Datasets',
        columns: [column('Name', 'name'), linkColumn('Topic', 'topics')],
        rows,
      },
      limits,
    );

    expect(layout.width).toBe(2);
    expect(layout.sheetRowCount).toBe(39);
    expect(ranges).toEqual([
      { start: 0, end: 10 },
      { start: 10, end: 20 },
    ]);
  });
});

describe('downloadXlsxExport', () => {
  const sheet = (count: number) => ({
    sheetName: 'Datasets',
    columns: [column('Name', 'name')],
    rows: makeRows(count),
  });
  const limits = { ...LIMITS, cellsPerFile: 10 }; // 9 data rows per file

  beforeEach(() => mockWriteXlsx.mockClear());

  it('downloads a single .xlsx when everything fits', async () => {
    const prepared = prepareXlsxExport(sheet(5), limits);
    const result = await downloadXlsxExport(prepared, 'results');

    expect(result).toMatchObject({ download: 'results.xlsx' });
    expect(mockWriteXlsx).toHaveBeenCalledTimes(1);
    // Header + 5 data rows.
    expect(getSheet().rows).toHaveLength(6);
  });

  it('zips several files with a README when the rows are split', async () => {
    const onProgress = jest.fn();
    const prepared = prepareXlsxExport(sheet(20), limits);
    const result = await downloadXlsxExport(prepared, 'results', {
      onProgress,
    });

    expect(result).toMatchObject({ download: 'results.zip' });
    expect(onProgress.mock.calls).toEqual([
      [1, 3],
      [2, 3],
      [3, 3],
    ]);

    const files = unzipSync(await lastBlobBytes());
    expect(Object.keys(files)).toEqual([
      'results_part-1-of-3.xlsx',
      'results_part-2-of-3.xlsx',
      'results_part-3-of-3.xlsx',
      'README.txt',
    ]);
    // Each marker holds the rows written to that part, header included.
    expect(files['results_part-1-of-3.xlsx']).toEqual(new Uint8Array([10]));
    expect(files['results_part-3-of-3.xlsx']).toEqual(new Uint8Array([3]));
    const readme = strFromU8(files['README.txt']);
    expect(readme).toContain('20 results split across 3 spreadsheet files');
    expect(readme).toContain('results_part-3-of-3.xlsx: results 19 to 20');
  });
});

describe('getPartFileName', () => {
  it('pads part numbers to the width of the file count', () => {
    expect(getPartFileName('results', 3, 12)).toBe(
      'results_part-03-of-12.xlsx',
    );
  });
});
