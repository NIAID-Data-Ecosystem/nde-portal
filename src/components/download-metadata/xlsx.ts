import { MAX_CELL_CHARACTERS } from './helpers';

/*
 [XLSX "Custom Result View" export]:
 Builds .xlsx files from a table-shaped description of the data, rather
 than from the raw API records like the JSON and CSV downloads do.

 A cell in Excel / OpenXML can only hold one clickable hyperlink, so a column
 whose cells contain several links is expanded into several numbered columns
 (e.g. "Topic Category 1", "Topic Category 2"), one link per cell. Columns
 that only contain plain text keep a single cell per row, joining multiple
 values with "; ".

 Columns with no data in any row are left out of the file.

 As the files have to open in both Excel and Google Sheets, each file is kept
 within a size budget (XLSX_LIMITS). An export over budget is split
 into several files that are bundled into a single .zip download.
*/

/** A single value shown in a cell, optionally linked to a url. */
export interface XlsxCellEntry {
  text: string;
  url?: string | null;
}

/** One column of the portal table, as it should appear in the xlsx file. */
export interface XlsxColumnSpec<TRow = Record<string, unknown>> {
  header: string;
  getEntries: (row: TRow) => XlsxCellEntry[];
}

export interface XlsxSheetSpec<TRow = Record<string, unknown>> {
  sheetName: string;
  columns: XlsxColumnSpec<TRow>[];
  rows: TRow[];
}

/**
 * Size budget for a single xlsx file.
 * - cellsPerFile: Google Sheets refuses spreadsheets over 10M cells.
 * - rowsPerFile: Excel's hard limit is 1,048,576 rows per sheet.
 * - linksPerFile: Excel keeps at most ~65,530 hyperlinks per worksheet.
 * - maxColumns: Excel's hard limit is 16,384 columns.
 */
export const XLSX_LIMITS = {
  cellsPerFile: 2_000_000,
  rowsPerFile: 1_000_000,
  linksPerFile: 60_000,
  maxColumns: 16_000,
};

export type XlsxLimits = typeof XLSX_LIMITS;

// Thrown when link expansion makes the sheet wider than spreadsheets allow.
export class XlsxTooWideError extends Error {
  constructor(public columnCount: number) {
    super(
      `The export would need ${columnCount.toLocaleString()} columns, more than a spreadsheet can hold.`,
    );
    this.name = 'XlsxTooWideError';
  }
}

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Excel limits sheet names to 31 characters and disallows : \ / ? * [ ]
const MAX_SHEET_NAME_LENGTH = 31;
const toSheetName = (name: string) =>
  (
    name
      .replace(/[:\\/?*[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Results'
  ).slice(0, MAX_SHEET_NAME_LENGTH);

// Column width bounds, in characters.
const MIN_COLUMN_WIDTH = 12;
const MAX_COLUMN_WIDTH = 60;

const HEADER_STYLE = { font: { bold: true } };
const LINK_STYLE = { font: { color: { rgb: '0563C1' }, underline: true } };

const truncate = (text: string) =>
  text.length > MAX_CELL_CHARACTERS
    ? `${text.substring(0, MAX_CELL_CHARACTERS - 3)}...`
    : text;

const isValidUrl = (url?: string | null): url is string =>
  !!url && /^(https?:\/\/|mailto:|ftp:\/\/)/i.test(url.trim());

// Drop entries that carry neither text nor a link.
const cleanEntries = (entries: XlsxCellEntry[]) =>
  entries.filter(entry => entry && (entry.text || isValidUrl(entry.url)));

/**
 * The xlsx-level column layout for one portal column: either a single column,
 * or several numbered columns holding one linked entry each.
 */
interface ExpandedColumn {
  headers: string[];
  // Whether each entry gets its own column (true when the column has links
  // and at least one row holds more than one entry).
  isExpanded: boolean;
}

const expandColumn = (
  header: string,
  cellEntries: XlsxCellEntry[][],
): ExpandedColumn => {
  let maxEntries = 0;
  let hasLinks = false;
  cellEntries.forEach(entries => {
    maxEntries = Math.max(maxEntries, entries.length);
    if (!hasLinks) hasLinks = entries.some(entry => isValidUrl(entry.url));
  });

  if (hasLinks && maxEntries > 1) {
    return {
      headers: Array.from(
        { length: maxEntries },
        (_, idx) => `${header} ${idx + 1}`,
      ),
      isExpanded: true,
    };
  }
  return { headers: [header], isExpanded: false };
};

const toCell = (entry?: XlsxCellEntry) => {
  if (!entry) return null;
  const url = isValidUrl(entry.url) ? entry.url.trim() : null;
  const text = truncate(entry.text || url || '');
  if (!url) return text || null;
  return {
    value: text,
    hyperlink: { target: url },
    style: LINK_STYLE,
  };
};

// Several entries in a single cell: the text is joined, and the cell links to
// the only url when there is exactly one.
const toJoinedCell = (entries: XlsxCellEntry[]) => {
  if (entries.length === 0) return null;
  if (entries.length === 1) return toCell(entries[0]);
  return truncate(entries.map(entry => entry.text || entry.url).join('; '));
};

/** The column layout and cell entries of an export, computed once. */
export interface XlsxLayout {
  sheetName: string;
  columns: ExpandedColumn[];
  // [column][row] => entries, for the kept columns only.
  entriesByColumn: XlsxCellEntry[][][];
  // Number of xlsx columns once link columns are expanded.
  width: number;
  rowCount: number;
  // Number of hyperlink cells each row produces.
  linkCounts: number[];
}

export const computeXlsxLayout = <TRow>({
  sheetName,
  columns,
  rows,
}: XlsxSheetSpec<TRow>): XlsxLayout => {
  // Extract every cell's entries once: [column][row] => entries.
  const allEntriesByColumn = columns.map(column =>
    rows.map(row => cleanEntries(column.getEntries(row) || [])),
  );

  // Leave out columns with no data in any row. If every column is empty,
  // keep them all so the sheet still has headers.
  const nonEmptyIdx = columns
    .map((_, colIdx) => colIdx)
    .filter(colIdx =>
      allEntriesByColumn[colIdx].some(entries => entries.length > 0),
    );
  const keptIdx =
    nonEmptyIdx.length > 0 ? nonEmptyIdx : columns.map((_, colIdx) => colIdx);
  const entriesByColumn = keptIdx.map(colIdx => allEntriesByColumn[colIdx]);

  const layoutColumns = keptIdx.map((colIdx, keptColIdx) =>
    expandColumn(columns[colIdx].header, entriesByColumn[keptColIdx]),
  );

  // A column only stays unexpanded when its links never share a cell, so
  // every entry with a valid url becomes exactly one hyperlink cell.
  const linkCounts = rows.map((_, rowIdx) =>
    entriesByColumn.reduce(
      (count, column) =>
        count + column[rowIdx].filter(entry => isValidUrl(entry.url)).length,
      0,
    ),
  );

  return {
    sheetName,
    columns: layoutColumns,
    entriesByColumn,
    width: layoutColumns.reduce((sum, { headers }) => sum + headers.length, 0),
    rowCount: rows.length,
    linkCounts,
  };
};

/** A range of data rows, [start, end), written to one xlsx file. */
export interface XlsxRowRange {
  start: number;
  end: number;
}

/** The most data rows (excluding the header) a file of `width` columns fits. */
export const getMaxRowsPerFile = (
  width: number,
  limits: XlsxLimits = XLSX_LIMITS,
) =>
  Math.max(
    1,
    Math.min(
      limits.rowsPerFile - 1,
      Math.floor(limits.cellsPerFile / Math.max(width, 1)) - 1,
    ),
  );

/**
 * Split the rows into consecutive ranges, each within the per-file budget for
 * cells, rows and hyperlinks. A row is never split, so a single row with more
 * links than the budget gets a file of its own.
 */
export const partitionRows = (
  layout: XlsxLayout,
  limits: XlsxLimits = XLSX_LIMITS,
): XlsxRowRange[] => {
  if (layout.rowCount === 0) return [{ start: 0, end: 0 }];

  const maxRows = getMaxRowsPerFile(layout.width, limits);
  const ranges: XlsxRowRange[] = [];
  let start = 0;
  let links = 0;

  for (let rowIdx = 0; rowIdx < layout.rowCount; rowIdx++) {
    const rowLinks = layout.linkCounts[rowIdx];
    const isFull =
      rowIdx - start >= maxRows || links + rowLinks > limits.linksPerFile;
    if (isFull && rowIdx > start) {
      ranges.push({ start, end: rowIdx });
      start = rowIdx;
      links = 0;
    }
    links += rowLinks;
  }
  ranges.push({ start, end: layout.rowCount });
  return ranges;
};

/**
 * Build the xlsx bytes for a range of rows of a layout. hucre is loaded on
 * demand so it is only downloaded when a user requests an xlsx file.
 */
export const buildXlsxPart = async (
  layout: XlsxLayout,
  { start, end }: XlsxRowRange = { start: 0, end: layout.rowCount },
): Promise<Uint8Array> => {
  const { columns, entriesByColumn } = layout;

  const headerRow = columns.flatMap(({ headers }) =>
    headers.map(header => ({ value: header, style: HEADER_STYLE })),
  );

  const dataRows = [];
  for (let rowIdx = start; rowIdx < end; rowIdx++) {
    dataRows.push(
      columns.flatMap(({ headers, isExpanded }, colIdx) => {
        const entries = entriesByColumn[colIdx][rowIdx];
        return isExpanded
          ? headers.map((__, entryIdx) => toCell(entries[entryIdx]))
          : [toJoinedCell(entries)];
      }),
    );
  }

  // Size each column to its header, within sensible bounds.
  const columnDefs = columns.flatMap(({ headers }) =>
    headers.map(header => ({
      width: Math.min(
        MAX_COLUMN_WIDTH,
        Math.max(MIN_COLUMN_WIDTH, header.length + 4),
      ),
    })),
  );

  const { writeXlsx } = await import('hucre/xlsx');

  return writeXlsx({
    sheets: [
      {
        name: toSheetName(layout.sheetName),
        columns: columnDefs,
        rows: [headerRow, ...dataRows],
        freezePane: { rows: 1 },
      },
    ],
  });
};

/** Build a single workbook holding every row of the sheet description. */
export const buildXlsxWorkbook = async <TRow>(
  sheet: XlsxSheetSpec<TRow>,
): Promise<Uint8Array> => buildXlsxPart(computeXlsxLayout(sheet));

/** The layout of an export and how its rows are split across files. */
export interface XlsxPreparedExport {
  layout: XlsxLayout;
  ranges: XlsxRowRange[];
}

/**
 * Work out the column layout of an export and how its rows split across files
 * within the per-file budget, without building any file yet. Throws
 * XlsxTooWideError when link expansion makes the sheet too wide.
 */
export const prepareXlsxExport = <TRow>(
  sheet: XlsxSheetSpec<TRow>,
  limits: XlsxLimits = XLSX_LIMITS,
): XlsxPreparedExport => {
  const layout = computeXlsxLayout(sheet);
  if (layout.width > limits.maxColumns) {
    throw new XlsxTooWideError(layout.width);
  }
  return { layout, ranges: partitionRows(layout, limits) };
};

export interface XlsxDownloadOptions {
  // Called before each file is built, with 1-based file number.
  onProgress?: (fileNumber: number, fileCount: number) => void;
}

// Let the browser paint progress between the heavy synchronous steps.
const yieldToBrowser = () => new Promise(resolve => setTimeout(resolve, 0));

const padNumber = (value: number, length: number) =>
  String(value).padStart(length, '0');

// Name of each file in a split export, e.g., "results_part-01-of-07.xlsx".
export const getPartFileName = (
  downloadName: string,
  fileNumber: number,
  fileCount: number,
) => {
  const digits = String(fileCount).length;
  return `${downloadName}_part-${padNumber(fileNumber, digits)}-of-${padNumber(
    fileCount,
    digits,
  )}.xlsx`;
};

const buildReadme = (
  downloadName: string,
  ranges: XlsxRowRange[],
  totalRows: number,
) =>
  [
    `This download holds ${totalRows.toLocaleString()} rows split across ${
      ranges.length
    } spreadsheet files, so that each file opens in both Microsoft Excel and Google Sheets.`,
    'Every file has the same columns and a header row.',
    '',
    ...ranges.map(
      ({ start, end }, idx) =>
        `${getPartFileName(downloadName, idx + 1, ranges.length)}: rows ${(
          start + 1
        ).toLocaleString()} to ${end.toLocaleString()}`,
    ),
    '',
  ].join('\r\n');

interface ZipEntry {
  name: string;
  data: Uint8Array | string;
}

// Bundle files into an uncompressed zip
const zipFiles = async (files: ZipEntry[]) => {
  const { Zip, ZipPassThrough, strToU8 } = await import('fflate');
  const chunks: Uint8Array[] = [];
  const zip = new Zip((err, chunk) => {
    if (err) throw err;
    chunks.push(chunk);
  });
  files.forEach(({ name, data }) => {
    const file = new ZipPassThrough(name);
    zip.add(file);
    file.push(typeof data === 'string' ? strToU8(data) : data, true);
  });
  zip.end();
  return new Blob(chunks as BlobPart[], { type: 'application/zip' });
};

/**
 * Build the files of a prepared export: a single .xlsx, or a .zip of every
 * part plus a README file when the rows are split across several files.
 */
export const downloadXlsxExport = async (
  { layout, ranges }: XlsxPreparedExport,
  downloadName: string,
  { onProgress }: XlsxDownloadOptions = {},
): Promise<{ href: string; download: string } | null> => {
  if (!downloadName) return null;

  if (ranges.length === 1) {
    onProgress?.(1, 1);
    await yieldToBrowser();
    const bytes = await buildXlsxPart(layout, ranges[0]);
    const blob = new Blob([bytes as BlobPart], { type: XLSX_MIME_TYPE });
    return {
      href: URL.createObjectURL(blob),
      download: `${downloadName}.xlsx`,
    };
  }

  // Build the files one at a time so only one workbook object model is in
  // memory at once.
  const files: ZipEntry[] = [];
  for (let idx = 0; idx < ranges.length; idx++) {
    onProgress?.(idx + 1, ranges.length);
    await yieldToBrowser();
    files.push({
      name: getPartFileName(downloadName, idx + 1, ranges.length),
      data: await buildXlsxPart(layout, ranges[idx]),
    });
  }
  files.push({
    name: 'README.txt',
    data: buildReadme(downloadName, ranges, layout.rowCount),
  });

  const blob = await zipFiles(files);
  return { href: URL.createObjectURL(blob), download: `${downloadName}.zip` };
};
