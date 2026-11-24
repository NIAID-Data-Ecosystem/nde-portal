import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { CitedBy } from 'src/utils/api/types';

import { CitedByTable } from '.';

const citation = (overrides: Partial<CitedBy>): CitedBy => ({
  '@type': null,
  abstract: null,
  citation: null,
  datePublished: null,
  description: null,
  doi: null,
  identifier: null,
  name: null,
  pmid: null,
  url: null,
  journalName: null,
  journalNameAbbrev: null,
  issueNumber: null,
  ...overrides,
});

const CITATIONS: CitedBy[] = [
  citation({
    '@type': 'ScholarlyArticle',
    name: 'Older article',
    url: 'https://example.com/older',
    identifier: 'PMID:1',
    pmid: '1',
    journalName: 'Journal A',
    datePublished: '2019-05-01',
  }),
  citation({
    '@type': 'Dataset',
    name: 'Newer dataset',
    doi: '10.1/abc',
    datePublished: '2023-10-17',
  }),
  // Nothing to show at all.
  citation({}),
];

const renderTable = async (data = CITATIONS, loading = false) => {
  const user = userEvent.setup();
  const result = render(
    <CitedByTable
      data={data}
      loading={loading}
      title='Cited By'
      subtitle='Works that cite this one.'
    />,
  );
  // Flush the pager's zag machines (they start in a microtask).
  await act(async () => {});
  return { user, ...result };
};

const getTable = () =>
  screen.getByRole('table', { name: 'Cited by information' });

/** Body rows' cell text, in order. */
const getBodyRows = () =>
  within(getTable())
    .getAllByRole('row')
    .slice(1)
    .map(row =>
      within(row)
        .getAllByRole('cell')
        .map(cell => cell.textContent),
    );

describe('CitedByTable', () => {
  it('shows a message instead of a table when nothing cites the work', async () => {
    await renderTable([]);
    expect(screen.getByText('No data available.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the title, then each work in the order given', async () => {
    await renderTable();
    expect(
      screen.getByRole('heading', { name: 'Cited By' }),
    ).toBeInTheDocument();
    expect(getBodyRows()).toEqual([
      [
        'Older articleID |PMID:1PMID |1',
        'ScholarlyArticle',
        'Journal A',
        '2019-05-01',
      ],
      ['Newer datasetDOI |10.1/abc', 'Dataset', '—No data', '2023-10-17'],
      ['—No data', '—No data', '—No data', '—No data'],
    ]);
  });

  it('links a titled work to its url, opening in a new tab', async () => {
    await renderTable();
    const link = within(getTable()).getByRole('link', {
      name: /Older article/,
    });
    expect(link).toHaveAttribute('href', 'https://example.com/older');
    expect(link).toHaveAttribute('target', '_blank');
    // Without a url, the title is text.
    expect(
      within(getTable()).queryByRole('link', { name: /Newer dataset/ }),
    ).not.toBeInTheDocument();
  });

  it('sorts by date, newest first, on the first click', async () => {
    const { user } = await renderTable();
    await user.click(
      within(getTable()).getByRole('button', { name: 'Date Published' }),
    );
    expect(getBodyRows().map(row => row[3])).toEqual([
      '2023-10-17',
      '2019-05-01',
      '—No data',
    ]);
  });
});
