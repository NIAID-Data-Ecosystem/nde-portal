import { FormattedResource } from 'src/utils/api/types';

import {
  buildCustomViewExport,
  exportLinks,
  exportResourceName,
  exportTerms,
  exportText,
} from '../export';
import { DATASET_COLUMNS } from '../tables/datasets';

/*
The XLSX "Custom Result View" export of the Search tables: each cell as the
text (and link) the table shows. That every table's export follows its column
preferences is in search-tables.test.tsx.
*/

const RECORD = {
  _id: 'ds-1',
  id: 'ds-1',
  '@type': 'Dataset',
  name: 'Influenza challenge study',
  date: '2023-04-05T00:00:00',
  conditionsOfAccess: 'Open',
  description: 'A study.',
  includedInDataCatalog: { name: 'ImmPort', url: 'https://www.immport.org' },
  infectiousAgent: [{ name: 'influenza A virus' }],
  sample: { '@type': 'SampleCollection', numberOfItems: { value: 1200 } },
  funding: [
    {
      identifier: 'R01AI000001',
      url: 'https://reporter.nih.gov/R01AI000001',
      funder: [{ name: 'NIAID', identifier: 'https://ror.org/043z4tv69' }],
    },
  ],
  usageInfo: { url: 'https://example.org/terms' },
} as unknown as FormattedResource;

/** Every column of the Datasets export for `record`, by header. */
const exportRow = (
  record: FormattedResource,
  visibleIds = DATASET_COLUMNS.map(c => c.id),
) => {
  const view = buildCustomViewExport({
    sheetName: 'Datasets',
    columns: DATASET_COLUMNS,
    visibleIds,
  });
  const row = view.toRow(record);
  return Object.fromEntries(
    view.columns.map(column => [column.header, column.getEntries(row)]),
  );
};

describe('buildCustomViewExport', () => {
  it('exports each cell as the Datasets table shows it', () => {
    expect(exportRow(RECORD)).toEqual({
      Name: [
        {
          text: 'Influenza challenge study',
          url: 'http://localhost/resources?id=ds-1',
        },
      ],
      Source: [{ text: 'ImmPort', url: 'https://www.immport.org' }],
      // ISO, as the Date column formats it.
      Date: [{ text: '2023-04-05' }],
      Author: [],
      // The badge's label, not the raw value.
      'Conditions of Access': [{ text: 'Open Access' }],
      Description: [{ text: 'A study.' }],
      // Capitalized, as TermsCell shows it.
      Pathogen: [{ text: 'Influenza A virus' }],
      Species: [],
      'Health Condition': [],
      'Measurement Technique': [],
      'Variable Measured': [],
      Samples: [{ text: '1,200 (experimental)' }],
      Funder: [{ text: 'NIAID', url: 'https://ror.org/043z4tv69' }],
      'Funding ID': [
        { text: 'R01AI000001', url: 'https://reporter.nih.gov/R01AI000001' },
      ],
      License: [],
      'Usage Info': [
        { text: 'Usage Agreement', url: 'https://example.org/terms' },
      ],
      'Topic Category': [],
    });
  });

  it('exports only the given columns, in the given order', () => {
    const view = buildCustomViewExport({
      sheetName: 'Datasets',
      columns: DATASET_COLUMNS,
      // An id no column has (e.g. a stale preference) is skipped.
      visibleIds: ['date', 'gone', 'name'],
    });
    expect(view.sheetName).toBe('Datasets');
    expect(view.columns.map(c => c.header)).toEqual(['Date', 'Name']);
  });

  it('exports every author, not just the ten the cell shows', () => {
    const author = Array.from({ length: 12 }, (_, i) => ({
      name: `Author ${i + 1}`,
    }));
    const { Author } = exportRow(
      { ...RECORD, author } as unknown as FormattedResource,
      ['author'],
    );
    expect(Author).toHaveLength(1);
    expect(Author[0].text).toContain('Author 12');
    expect(Author[0].text).not.toContain('et al');
  });
});

describe('export helpers', () => {
  it('exportText drops empty values', () => {
    expect(exportText(['a', '', null, 'b'])).toEqual([
      { text: 'a' },
      { text: 'b' },
    ]);
    expect(exportText(null)).toEqual([]);
  });

  it('exportLinks falls back to the url as label and adds a missing scheme', () => {
    expect(
      exportLinks([
        { label: 'Named', url: null },
        { label: '', url: 'www.example.org' },
        { label: '', url: null },
      ]),
    ).toEqual([
      { text: 'Named', url: null },
      { text: 'www.example.org', url: 'https://www.example.org' },
    ]);
  });

  it('exportTerms formats terms as TermsCell does', () => {
    expect(
      exportTerms([
        'lung',
        true,
        1234,
        { name: 'mouse', url: 'https://example.org/mouse' },
        { '@type': 'QuantitativeValue', value: 5, unitText: 'YEAR' },
        { name: '' },
        null,
      ]),
    ).toEqual([
      { text: 'Lung' },
      { text: 'Yes' },
      { text: '1,234' },
      { text: 'Mouse', url: 'https://example.org/mouse' },
      { text: '5 years' },
    ]);
  });

  it('exportResourceName links the name to its resource page', () => {
    expect(exportResourceName({ label: 'A', id: 'a b' })).toEqual([
      { text: 'A', url: 'http://localhost/resources?id=a%20b' },
    ]);
    expect(exportResourceName({ label: 'A', id: null })).toEqual([
      { text: 'A', url: null },
    ]);
    expect(exportResourceName({ label: '', id: 'a' })).toEqual([]);
  });
});
