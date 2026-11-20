import { unzipSync, strFromU8 } from 'fflate';
import {
  buildXlsxWorkbook,
  computeXlsxLayout,
  downloadXlsxExport,
  getPartFileName,
  partitionRows,
  prepareXlsxExport,
  XlsxColumnSpec,
  XlsxLimits,
  XlsxTooWideError,
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
  maxColumns: 100,
};

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
});

describe('computeXlsxLayout', () => {
  it('counts expanded columns and hyperlinks per row', () => {
    const layout = computeXlsxLayout({
      sheetName: 'Datasets',
      columns: [column('Name', 'name'), linkColumn('Topic', 'topics')],
      rows: [
        { name: 'A', topics: ['x', 'y', 'z'] },
        { name: 'B', topics: ['x'] },
        { name: 'C' },
      ],
    });

    expect(layout.width).toBe(4);
    expect(layout.linkCounts).toEqual([3, 1, 0]);
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
  it('splits by the expanded width once link columns are known', () => {
    // With a 60-cell budget, the 2 visible columns would fit 29 rows, so all
    // 20 rows in one file. One row has 5 links, which expands the sheet to 6
    // columns, and 6 columns fit only 9 rows per file.
    const limits = { ...LIMITS, cellsPerFile: 60 };
    const rows: Row[] = Array.from({ length: 20 }, (_, idx) => ({
      name: `Row ${idx}`,
      topics: idx === 0 ? ['a', 'b', 'c', 'd', 'e'] : ['a'],
    }));

    const { layout, ranges } = prepareXlsxExport(
      {
        sheetName: 'Datasets',
        columns: [column('Name', 'name'), linkColumn('Topic', 'topics')],
        rows,
      },
      limits,
    );

    expect(layout.width).toBe(6);
    expect(ranges).toHaveLength(3);
  });

  it('throws when link expansion is wider than a spreadsheet allows', () => {
    expect(() =>
      prepareXlsxExport(
        {
          sheetName: 'Datasets',
          columns: [linkColumn('Topic', 'topics')],
          rows: [{ topics: ['a', 'b', 'c', 'd'] }],
        },
        { ...LIMITS, maxColumns: 3 },
      ),
    ).toThrow(XlsxTooWideError);
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
    expect(strFromU8(files['README.txt'])).toContain('rows 19 to 20');
  });
});

describe('getPartFileName', () => {
  it('pads part numbers to the width of the file count', () => {
    expect(getPartFileName('results', 3, 12)).toBe(
      'results_part-03-of-12.xlsx',
    );
  });
});
