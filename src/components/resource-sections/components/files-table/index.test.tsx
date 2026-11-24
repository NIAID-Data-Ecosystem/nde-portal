import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { Distribution } from 'src/utils/api/types';

import FilesTable from '.';

const file = (overrides: Partial<Distribution>): Distribution => ({
  encodingFormat: null,
  contentSize: null,
  contentUrl: null,
  dateCreated: null,
  dateModified: null,
  datePublished: null,
  description: null,
  name: null,
  '@id': null,
  ...overrides,
});

const FILES: Distribution[] = [
  file({
    name: 'Beta.csv',
    contentUrl: 'https://example.com/beta.csv',
    encodingFormat: 'text/csv',
    contentSize: 1234567,
    dateModified: '2023-10-25T12:00:00Z',
    description: 'The beta file.',
  }),
  file({
    name: 'Alpha.pdf',
    contentUrl: 'https://example.com/alpha.pdf',
    encodingFormat: ['pdf', 'zip'],
    dateCreated: '2020-01-02',
  }),
  // Only a URL.
  file({ contentUrl: 'https://example.com/gamma' }),
];

const renderTable = async (distribution = FILES, loading = false) => {
  const user = userEvent.setup();
  const result = render(
    <FilesTable loading={loading} distribution={distribution} />,
  );
  // Flush the pager's zag machines (they start in a microtask).
  await act(async () => {});
  return { user, ...result };
};

const getTable = () =>
  screen.getByRole('table', { name: 'List of downloadable files' });

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

describe('FilesTable', () => {
  it('shows a message instead of a table when there are no files', async () => {
    await renderTable([]);
    expect(screen.getByText('No results found.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('starts sorted by name, with dates as YYYY-MM-DD and "No data" for missing values', async () => {
    await renderTable();
    expect(getBodyRows()).toEqual([
      [
        'Alpha.pdf',
        'https://example.com/alpha.pdf',
        '—No data',
        'pdfzip',
        '2020-01-02',
        '—No data',
        '—No data',
      ],
      [
        'Beta.csv',
        'https://example.com/beta.csv',
        'The beta file.',
        'text/csvsize:  1,234,567',
        '—No data',
        '2023-10-25',
        '—No data',
      ],
      // A file with no name sorts last.
      [
        '—No data',
        'https://example.com/gamma',
        '—No data',
        '—No data',
        '—No data',
        '—No data',
        '—No data',
      ],
    ]);
    expect(
      within(getTable()).getByRole('columnheader', { name: /^Name/ }),
    ).toHaveAttribute('aria-sort', 'ascending');
  });

  it('links each download, opening in a new tab', async () => {
    await renderTable();
    const link = within(getTable()).getByRole('link', {
      name: /beta\.csv/,
    });
    expect(link).toHaveAttribute('href', 'https://example.com/beta.csv');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('sorts dates newest first on the first click', async () => {
    const { user } = await renderTable();
    await user.click(
      within(getTable()).getByRole('button', { name: 'Date Modified' }),
    );
    expect(getBodyRows().map(row => row[5])).toEqual([
      '2023-10-25',
      '—No data',
      '—No data',
    ]);
  });

  it('pages the files, five at a time', async () => {
    await renderTable(
      Array.from({ length: 7 }, (_, i) => file({ name: `File ${i + 1}` })),
    );
    expect(getBodyRows()).toHaveLength(5);
    expect(screen.getByText('7 items')).toBeInTheDocument();
  });
});
