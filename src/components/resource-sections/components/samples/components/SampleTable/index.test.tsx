import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';

import type { SampleColumn } from '../../helpers';
import { SampleTable } from '.';

const COLUMNS: SampleColumn[] = [
  {
    title: 'Sample ID',
    property: '_identifierSort',
    valueProperty: 'identifier',
    isSortable: true,
  },
  { title: 'Species', property: 'species' },
  { title: 'Sample Quantity', property: 'sampleQuantity' },
  { title: 'Sex', property: 'sex' },
];

const ROWS = [
  {
    identifier: { identifier: 'S2', url: 'https://example.com/s2' },
    _identifierSort: 'S2',
    species: [
      { name: 'homo sapiens', url: 'https://example.com/human' },
      { name: 'mus musculus' },
    ],
    sampleQuantity: {
      '@type': 'QuantitativeValue',
      value: 5,
      unitText: 'year',
    },
  },
  {
    identifier: { identifier: 'S1', url: '' },
    _identifierSort: 'S1',
    species: 'rat',
    sex: 'female',
  },
];

const renderTable = async (
  props: Partial<React.ComponentProps<typeof SampleTable>> = {},
) => {
  const user = userEvent.setup();
  const result = render(
    <SampleTable
      label='Sample properties'
      columns={COLUMNS}
      rows={ROWS}
      {...props}
    />,
  );
  // Flush the pager's zag machines when paginated (they start in a microtask).
  await act(async () => {});
  return { user, ...result };
};

const getTable = () => screen.getByRole('table', { name: 'Sample properties' });

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

describe('SampleTable', () => {
  it('renders header title and optional description', async () => {
    await renderTable({
      header: {
        title: 'Header Title',
        description: 'This is my descriptive text.',
      },
    });

    expect(screen.getByText('Header Title')).toBeInTheDocument();
    expect(
      screen.getByText('This is my descriptive text.'),
    ).toBeInTheDocument();
  });

  it('does not render a heading when header is missing', async () => {
    await renderTable();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('names the table with its label and shows a header per column', async () => {
    await renderTable();
    expect(
      within(getTable())
        .getAllByRole('columnheader')
        .map(header => header.textContent),
    ).toEqual(['Sample ID', 'Species', 'Sample Quantity', 'Sex']);
  });

  it('shows terms (linked when they have a url), quantities and "No data" for missing values', async () => {
    await renderTable();
    expect(getBodyRows()).toEqual([
      ['S2', 'Homo sapiensMus musculus', '5 years', '—No data'],
      ['S1', 'Rat', '—No data', 'Female'],
    ]);
    expect(
      within(getTable()).getByRole('link', { name: /S2/ }),
    ).toHaveAttribute('href', 'https://example.com/s2');
    expect(
      within(getTable()).getByRole('link', { name: /Homo sapiens/ }),
    ).toHaveAttribute('href', 'https://example.com/human');
  });

  it('starts with the given sort, and sorts Sample ID on its plain identifier', async () => {
    const { user } = await renderTable({
      initialSort: { columnId: '_identifierSort', direction: 'asc' },
    });
    expect(getBodyRows().map(row => row[0])).toEqual(['S1', 'S2']);

    await user.click(
      within(getTable()).getByRole('button', { name: 'Sample ID' }),
    );
    expect(getBodyRows().map(row => row[0])).toEqual(['S2', 'S1']);
  });

  it('only lets sortable columns sort', async () => {
    await renderTable();
    expect(
      within(getTable())
        .getAllByRole('button')
        .map(b => b.textContent),
    ).toEqual(['Sample ID']);
  });

  it('pages the rows when asked', async () => {
    const rows = Array.from({ length: 7 }, (_, i) => ({
      identifier: { identifier: `S${i + 1}`, url: '' },
      _identifierSort: `S${i + 1}`,
    }));
    await renderTable({ rows, pagination: true });
    expect(getBodyRows()).toHaveLength(5);
    expect(screen.getByText('7 items')).toBeInTheDocument();
  });
});
