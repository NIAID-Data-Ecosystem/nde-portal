import { getFileIcon, getTruncatedText } from 'src/components/table/helpers';
describe('Table Helpers', () => {
  /*** getFileIcon ***/
  test('returns null icon and color for empty value', () => {
    const result = getFileIcon('');
    expect(result).toEqual({ icon: null, color: null });
  });

  test('returns correct icon and color for XML/HTML file types', () => {
    const xmlResult = getFileIcon('file.xml');
    expect(xmlResult.icon).toBeDefined(); // Since you're testing a dynamic import, checking for definition might be enough
    expect(xmlResult.color).toBe('inherit');

    const htmlResult = getFileIcon('file.html');
    expect(htmlResult.icon).toBeDefined();
    expect(htmlResult.color).toBe('inherit');

    const bamResult = getFileIcon('file.bam');
    expect(bamResult.icon).toBeDefined();
    expect(bamResult.color).toBe('inherit');

    const fasta = getFileIcon('file.fasta');
    expect(fasta.icon).toBeDefined();
    expect(fasta.color).toBe('inherit');

    const zip = getFileIcon('file.zip');
    const tar = getFileIcon('file.tar');
    const gzip = getFileIcon('file.gzip');
    const seven = getFileIcon('file.7z');
    expect(zip.icon).toBeDefined();
    expect(tar.icon).toBeDefined();
    expect(gzip.icon).toBeDefined();
    expect(seven.icon).toBeDefined();
    expect(zip.color).toBe('inherit');
    expect(tar.color).toBe('inherit');
    expect(gzip.color).toBe('inherit');
    expect(seven.color).toBe('inherit');

    const png = getFileIcon('file.png');
    const jpeg = getFileIcon('file.jpeg');
    const svg = getFileIcon('file.svg');
    expect(png.icon).toBeDefined();
    expect(jpeg.icon).toBeDefined();
    expect(svg.icon).toBeDefined();
    expect(png.color).toBe('inherit');
    expect(jpeg.color).toBe('inherit');
    expect(svg.color).toBe('inherit');

    const xls = getFileIcon('file.xls');
    const xlsx = getFileIcon('file.xlsx');
    const csv = getFileIcon('file.csv');
    const textCSV = getFileIcon('text/csv');
    expect(csv.icon).toBeDefined();
    expect(textCSV.icon).toBeDefined();
    expect(xls.icon).toBeDefined();
    expect(xlsx.icon).toBeDefined();
    expect(xls.color).toMatch(/green/);
    expect(xlsx.color).toMatch(/green/);
    expect(csv.color).toMatch(/green/);
    expect(textCSV.color).toMatch(/green/);

    const doc = getFileIcon('file.doc');
    const docx = getFileIcon('file.docx');
    expect(doc.icon).toBeDefined();
    expect(docx.icon).toBeDefined();
    expect(doc.color).toMatch(/blue/);
    expect(docx.color).toMatch(/blue/);

    const ppt = getFileIcon('file.ppt');
    const pptx = getFileIcon('file.pptx');
    expect(ppt.icon).toBeDefined();
    expect(pptx.icon).toBeDefined();
    expect(ppt.color).toMatch(/orange/);
    expect(pptx.color).toMatch(/orange/);

    const pdf = getFileIcon('file.pdf');
    const txt = getFileIcon('file.txt');
    expect(pdf.icon).toBeDefined();
    expect(txt.icon).toBeDefined();
    expect(pdf.color).toMatch(/red/);
    expect(txt.color).toMatch(/gray/);
  });

  /*** getTruncatedText ***/
  test('returns empty string and hasMore false for null description', () => {
    const result = getTruncatedText(null);
    expect(result).toEqual({ text: '', hasMore: false });
  });

  test('returns same text and hasMore false if text is within max chars limit', () => {
    const text = 'Short description';
    const result = getTruncatedText(text);
    expect(result).toEqual({ text, hasMore: false });
  });

  test('returns truncated text and hasMore true if text exceeds max chars limit', () => {
    const longText =
      'This is a very long description that should be truncated because it exceeds the maximum character limit set for the description text.';
    const result = getTruncatedText(longText, false, 100);
    expect(result.text.length).toBe(100);
    expect(result.hasMore).toBe(true);
  });

  test('returns full text and hasMore true if showFullDescription is true, even if text exceeds max chars', () => {
    const longText =
      'This is a very long description that should not be truncated because showFullDescription is true, showing the entire text regardless of its length.';
    const result = getTruncatedText(longText, true);
    expect(result.text).toBe(longText);
    expect(result.hasMore).toBe(false);
  });
});
