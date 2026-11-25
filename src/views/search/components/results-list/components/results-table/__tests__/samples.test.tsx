import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import { SAMPLE_COLUMNS, samplesTable } from '../tables/samples';

/*
The Samples table's own cells and defaults. What every Search table shares
(sorting, preferences including its required Identifier, "No data", the
customizer) is in search-tables.test.tsx.
*/

const RESULTS = [
  {
    _id: '_abc123',
    id: 'abc123',
    '@type': 'Sample',
    identifier: 'SAMN001',
    url: 'https://www.ncbi.nlm.nih.gov/biosample/SAMN001',
    name: 'stool sample from donor 4',
    includedInDataCatalog: [
      { name: 'NCBI BioSample', url: 'https://www.ncbi.nlm.nih.gov/biosample' },
      { name: 'ImmPort', archivedAt: 'https://www.immport.org/s/1' },
    ],
    sex: 'female',
    species: [{ name: 'Homo sapiens', url: 'https://example.org/9606' }],
    sampleType: [{ name: 'stool' }],
  },
  {
    _id: '_def456',
    id: 'def456',
    '@type': 'Sample',
    // An array identifier isn't shown; the `_id` stands in.
    identifier: ['x', 'y'],
    name: 'blood sample',
  },
] as unknown as FormattedResource[];

const { Table } = samplesTable;

const setup = async () => {
  render(<Table results={RESULTS} loading={false} onSortChange={jest.fn()} />);
  await act(async () => {});
};

const table = () =>
  screen.getByRole('table', { name: 'Sample search results' });
const headerTitles = () =>
  within(table())
    .getAllByRole('columnheader')
    .map(th => th.textContent);

const cell = (header: string, row = 1) => {
  const index = headerTitles().indexOf(header);
  const tr = within(table()).getAllByRole('row')[row];
  return within(within(tr).getAllByRole('cell')[index]);
};

beforeEach(() => {
  window.localStorage.clear();
  mockRouter.setCurrentUrl('/search?q=stool&tab=s');
});

describe('Samples table', () => {
  it('shows its ten default columns, Identifier first', async () => {
    await setup();
    expect(headerTitles()).toEqual([
      'Identifier',
      'Name',
      'Date',
      'Source',
      'Description',
      'Host Species',
      'Conditions of Access',
      'Sex',
      'Funder',
      'Funding ID',
    ]);
    // The rest are offered in Customize Columns.
    expect(SAMPLE_COLUMNS).toHaveLength(28);
  });

  it('links the identifier to the sample at its source, falling back to the _id', async () => {
    await setup();
    expect(
      cell('Identifier').getByRole('link', { name: /SAMN001/ }),
    ).toHaveAttribute('href', 'https://www.ncbi.nlm.nih.gov/biosample/SAMN001');
    // No url: plain text.
    expect(cell('Identifier', 2).getByText('DEF456')).toBeInTheDocument();
    expect(cell('Identifier', 2).queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the name as plain text, capitalized', async () => {
    await setup();
    expect(
      cell('Name').getByText('Stool sample from donor 4'),
    ).toBeInTheDocument();
    expect(cell('Name').queryByRole('link')).not.toBeInTheDocument();
  });

  it('lists every catalog the sample is in, preferring archived URLs', async () => {
    await setup();
    const source = cell('Source');
    expect(
      source.getByRole('link', { name: /NCBI BioSample/ }),
    ).toHaveAttribute('href', 'https://www.ncbi.nlm.nih.gov/biosample');
    expect(source.getByRole('link', { name: /ImmPort/ })).toHaveAttribute(
      'href',
      'https://www.immport.org/s/1',
    );
  });

  it('shows term values as the other search tables do', async () => {
    await setup();
    expect(cell('Sex').getByText('Female')).toBeInTheDocument();
    expect(
      cell('Host Species').getByRole('link', { name: /Homo sapiens/ }),
    ).toHaveAttribute('href', 'https://example.org/9606');
  });
});
