import { MAX_CELL_CHARACTERS } from './helpers';

/*
 [XLSX "Custom Result View" export]:
 Builds .xlsx files from a table-shaped description of the data, rather
 than from the raw API records like the JSON and CSV downloads do.

 Every column of the portal table becomes exactly one xlsx column.

 A cell in Excel / OpenXML can only hold one clickable hyperlink, so values are
 never combined in a cell: a record whose cells contain several values (links,
 plain text or a mix of both) is written over several rows, one value per row.
 In those "stacked" columns, rows past the cell's last value are left blank.
 Every other column holds at most one value per record, and repeats it on each
 of the record's rows, so sorting or filtering the sheet keeps each value next
 to its record.

 Columns with no data in any row are left out of the file.

 As the files have to open in both Excel and Google Sheets, each file is kept
 within a size budget (XLSX_LIMITS). An export over budget is split
 into several files that are bundled into a single .zip download. A record is
 never split across files.
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
 */
export const XLSX_LIMITS = {
  cellsPerFile: 2_000_000,
  rowsPerFile: 1_000_000,
  linksPerFile: 60_000,
};

export type XlsxLimits = typeof XLSX_LIMITS;

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

/** The xlsx-level layout of one portal column. */
interface LayoutColumn {
  header: string;
  // Whether each entry gets its own row (true when at least one cell of the
  // column holds more than one entry).
  isStacked: boolean;
}

const toLayoutColumn = (
  header: string,
  cellEntries: XlsxCellEntry[][],
): LayoutColumn => ({
  header,
  isStacked: cellEntries.some(entries => entries.length > 1),
});

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

// Whether an unstacked cell (at most one entry) is written as a hyperlink.
const isLinkedSingleCell = (entries: XlsxCellEntry[]) =>
  entries.length === 1 && isValidUrl(entries[0].url);

/** The column layout and cell entries of an export, computed once. */
export interface XlsxLayout {
  sheetName: string;
  columns: LayoutColumn[];
  // [column][record] => entries, for the kept columns only.
  entriesByColumn: XlsxCellEntry[][][];
  // Number of xlsx columns.
  width: number;
  // Number of records (portal table rows).
  rowCount: number;
  // Number of spreadsheet rows each record takes.
  recordHeights: number[];
  // Total number of data rows in the sheet, header excluded.
  sheetRowCount: number;
  // Number of hyperlink cells each record produces.
  linkCounts: number[];
}

export const computeXlsxLayout = <TRow>({
  sheetName,
  columns,
  rows,
}: XlsxSheetSpec<TRow>): XlsxLayout => {
  // Extract every cell's entries once: [column][record] => entries.
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
    toLayoutColumn(columns[colIdx].header, entriesByColumn[keptColIdx]),
  );

  const recordHeights = rows.map((_, rowIdx) =>
    layoutColumns.reduce(
      (height, { isStacked }, colIdx) =>
        isStacked
          ? Math.max(height, entriesByColumn[colIdx][rowIdx].length)
          : height,
      1,
    ),
  );

  // Stacked columns write each linked entry once; other columns repeat their
  // (single) link on each of the record's rows.
  const linkCounts = rows.map((_, rowIdx) =>
    layoutColumns.reduce((count, { isStacked }, colIdx) => {
      const entries = entriesByColumn[colIdx][rowIdx];
      if (isStacked) {
        return count + entries.filter(entry => isValidUrl(entry.url)).length;
      }
      return isLinkedSingleCell(entries)
        ? count + recordHeights[rowIdx]
        : count;
    }, 0),
  );

  return {
    sheetName,
    columns: layoutColumns,
    entriesByColumn,
    width: layoutColumns.length,
    rowCount: rows.length,
    recordHeights,
    sheetRowCount: recordHeights.reduce((sum, height) => sum + height, 0),
    linkCounts,
  };
};

/** A range of records, [start, end), written to one xlsx file. */
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
 * Split the records into consecutive ranges, each within the per-file budget
 * for cells, rows and hyperlinks. A record is never split, so a single record
 * over the budget gets a file of its own.
 */
export const partitionRows = (
  layout: XlsxLayout,
  limits: XlsxLimits = XLSX_LIMITS,
): XlsxRowRange[] => {
  if (layout.rowCount === 0) return [{ start: 0, end: 0 }];

  const maxRows = getMaxRowsPerFile(layout.width, limits);
  const ranges: XlsxRowRange[] = [];
  let start = 0;
  let sheetRows = 0;
  let links = 0;

  for (let rowIdx = 0; rowIdx < layout.rowCount; rowIdx++) {
    const height = layout.recordHeights[rowIdx];
    const rowLinks = layout.linkCounts[rowIdx];
    const isFull =
      sheetRows + height > maxRows || links + rowLinks > limits.linksPerFile;
    if (isFull && rowIdx > start) {
      ranges.push({ start, end: rowIdx });
      start = rowIdx;
      sheetRows = 0;
      links = 0;
    }
    sheetRows += height;
    links += rowLinks;
  }
  ranges.push({ start, end: layout.rowCount });
  return ranges;
};

/**
 * Build the xlsx bytes for a range of records of a layout. hucre is loaded on
 * demand so it is only downloaded when a user requests an xlsx file.
 */
export const buildXlsxPart = async (
  layout: XlsxLayout,
  { start, end }: XlsxRowRange = { start: 0, end: layout.rowCount },
): Promise<Uint8Array> => {
  const { columns, entriesByColumn, recordHeights } = layout;

  const headerRow = columns.map(({ header }) => ({
    value: header,
    style: HEADER_STYLE,
  }));

  const dataRows = [];
  for (let rowIdx = start; rowIdx < end; rowIdx++) {
    // Unstacked cells hold at most one entry and repeat on every row of the
    // record.
    const singleCells = columns.map(({ isStacked }, colIdx) =>
      isStacked ? null : toCell(entriesByColumn[colIdx][rowIdx][0]),
    );
    for (let lineIdx = 0; lineIdx < recordHeights[rowIdx]; lineIdx++) {
      dataRows.push(
        columns.map(({ isStacked }, colIdx) =>
          isStacked
            ? toCell(entriesByColumn[colIdx][rowIdx][lineIdx])
            : singleCells[colIdx],
        ),
      );
    }
  }

  // Size each column to its header, within sensible bounds.
  const columnDefs = columns.map(({ header }) => ({
    width: Math.min(
      MAX_COLUMN_WIDTH,
      Math.max(MIN_COLUMN_WIDTH, header.length + 4),
    ),
  }));

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

/** The layout of an export and how its records are split across files. */
export interface XlsxPreparedExport {
  layout: XlsxLayout;
  ranges: XlsxRowRange[];
}

/**
 * Work out the column layout of an export and how its records split across
 * files within the per-file budget, without building any file yet.
 */
export const prepareXlsxExport = <TRow>(
  sheet: XlsxSheetSpec<TRow>,
  limits: XlsxLimits = XLSX_LIMITS,
): XlsxPreparedExport => {
  const layout = computeXlsxLayout(sheet);
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
    `This download holds ${totalRows.toLocaleString()} results split across ${
      ranges.length
    } spreadsheet files, so that each file opens in both Microsoft Excel and Google Sheets.`,
    'Every file has the same columns and a header row.',
    'A result with several values in a column takes several rows, one value per row, with its single values repeated on each row.',
    '',
    ...ranges.map(
      ({ start, end }, idx) =>
        `${getPartFileName(downloadName, idx + 1, ranges.length)}: results ${(
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
 * part plus a README file when the records are split across several files.
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
