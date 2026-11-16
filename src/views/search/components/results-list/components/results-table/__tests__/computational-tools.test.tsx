import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import {
  COMPUTATIONAL_TOOL_COLUMNS,
  computationalToolsTable,
} from '../tables/computational-tools';

/*
The Computational Tools table's own cells. What every Search table shares
(sorting, preferences, "No data", the customizer, and the shared columns such
as Name and Source) is in search-tables.test.tsx and datasets.test.tsx.
*/

const RESULTS = [
  {
    _id: 'ct-1',
    id: 'ct-1',
    '@type': 'ComputationalTool',
    name: 'Seq toolkit',
    applicationCategory: ['command-line tool', 'library'],
    programmingLanguage: ['python'],
    operatingSystem: ['Linux', 'Mac'],
    softwareVersion: ['3.306'],
    // Array names, despite their declared string type.
    input: [{ name: ['FASTA', 'FASTQ'], url: 'https://edamontology.org/x' }],
    featureList: [{ name: 'alignment' }],
    softwareHelp: [
      { name: ['General'], url: 'https://example.org/docs' },
      { url: 'https://example.org/faq' },
      { name: 'No link' },
    ],
    license: 'https://opensource.org/licenses/MIT',
  },
] as unknown as FormattedResource[];

const { Table } = computationalToolsTable;

const setup = async () => {
  render(<Table results={RESULTS} loading={false} onSortChange={jest.fn()} />);
  await act(async () => {});
};

const table = () =>
  screen.getByRole('table', { name: 'Computational tool search results' });

const cell = (header: string) => {
  const index = within(table())
    .getAllByRole('columnheader')
    .findIndex(th => th.textContent === header);
  const row = within(table()).getAllByRole('row')[1];
  return within(within(row).getAllByRole('cell')[index]);
};

beforeEach(() => {
  window.localStorage.clear();
  mockRouter.setCurrentUrl('/search?q=python&tab=ct');
});

describe('Computational Tools table', () => {
  it('shows every column by default, in the card’s order', async () => {
    await setup();
    expect(
      within(table())
        .getAllByRole('columnheader')
        .map(th => th.textContent),
    ).toEqual(COMPUTATIONAL_TOOL_COLUMNS.map(c => c.header));
  });

  it('lists string values one per line, capitalized as the card does', async () => {
    await setup();
    expect(
      cell('Application Categories').getByText('Command-line tool'),
    ).toBeInTheDocument();
    expect(
      cell('Application Categories').getByText('Library'),
    ).toBeInTheDocument();
    expect(
      cell('Programming Languages').getByText('Python'),
    ).toBeInTheDocument();
    expect(cell('Operating System').getByText('Mac')).toBeInTheDocument();
    expect(cell('Software Version').getByText('3.306')).toBeInTheDocument();
  });

  it('joins array term names and links terms with a url', async () => {
    await setup();
    expect(
      cell('Input').getByRole('link', { name: /FASTA, FASTQ/ }),
    ).toHaveAttribute('href', 'https://edamontology.org/x');
    expect(cell('Feature List').getByText('Alignment')).toBeInTheDocument();
  });

  it('links software help by name, falling back to the url, and drops entries without one', async () => {
    await setup();
    const help = cell('Software Help');
    expect(help.getByRole('link', { name: /General/ })).toHaveAttribute(
      'href',
      'https://example.org/docs',
    );
    expect(
      help.getByRole('link', { name: /example\.org\/faq/ }),
    ).toHaveAttribute('href', 'https://example.org/faq');
    expect(help.queryByText('No link')).not.toBeInTheDocument();
  });

  it('links the license', async () => {
    await setup();
    expect(cell('License').getByRole('link')).toHaveAttribute(
      'href',
      'https://opensource.org/licenses/MIT',
    );
  });
});
