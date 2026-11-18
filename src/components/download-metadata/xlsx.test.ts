import { buildXlsxWorkbook, XlsxColumnSpec } from './xlsx';

const mockWriteXlsx = jest.fn((_: any) => new Uint8Array());

jest.mock('hucre/xlsx', () => ({
  writeXlsx: (args: any) => mockWriteXlsx(args),
}));

type Row = Record<string, string | undefined>;

const column = (header: string, key: string): XlsxColumnSpec<Row> => ({
  header,
  getEntries: row => (row[key] ? [{ text: row[key] as string }] : []),
});

const getSheet = () => mockWriteXlsx.mock.calls.at(-1)![0].sheets[0];
const getHeaders = () => getSheet().rows[0].map((cell: any) => cell.value);

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
