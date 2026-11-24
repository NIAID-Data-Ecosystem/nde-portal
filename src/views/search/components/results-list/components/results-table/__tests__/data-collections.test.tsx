import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import {
  DATA_COLLECTION_COLUMNS,
  dataCollectionsTable,
} from '../tables/data-collections';

/*
The Data Collections table's own cells. What every Search table shares
(sorting, preferences including its required Name and Source, "No data", the
customizer) is in search-tables.test.tsx.
*/

const RESULTS = [
  {
    _id: 'dc-1',
    id: 'dc-1',
    '@type': 'ResourceCatalog',
    name: 'Imaging collection',
    about: [
      { name: 'tomogram', url: 'https://example.org/tomogram' },
      { name: 'electron micrograph' },
    ],
    exampleOfWork: { about: { name: 'GeneVariant' } },
    isBasedOn: [
      { '@type': 'Action', name: 'Cryo-EM imaging' },
      { '@type': 'Dataset', name: 'Not an action' },
    ],
    collectionSize: [
      { minValue: 1000, unitText: 'SAMPLES' },
      { unitText: 'Donors' },
    ],
  },
] as unknown as FormattedResource[];

const { Table } = dataCollectionsTable;

const setup = async () => {
  render(<Table results={RESULTS} loading={false} onSortChange={jest.fn()} />);
  await act(async () => {});
};

const table = () =>
  screen.getByRole('table', { name: 'Data collection search results' });

const cell = (header: string) => {
  const index = within(table())
    .getAllByRole('columnheader')
    .findIndex(th => th.textContent === header);
  const row = within(table()).getAllByRole('row')[1];
  return within(within(row).getAllByRole('cell')[index]);
};

beforeEach(() => {
  window.localStorage.clear();
  mockRouter.setCurrentUrl('/search?q=imaging&tab=dc');
});

describe('Data Collections table', () => {
  it('shows every column by default, Name and Source first', async () => {
    await setup();
    expect(
      within(table())
        .getAllByRole('columnheader')
        .map(th => th.textContent),
    ).toEqual(DATA_COLLECTION_COLUMNS.map(c => c.header));
  });

  it('merges about and exampleOfWork.about into one sorted, linked content type list', async () => {
    await setup();
    const contentType = cell('Content Type');
    const micrograph = contentType.getByText('Electron Micrograph');
    const variant = contentType.getByText('Gene Variant');
    const tomogram = contentType.getByRole('link', { name: /Tomogram/ });
    expect(tomogram).toHaveAttribute('href', 'https://example.org/tomogram');
    // Sorted by label.
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(micrograph, variant)).toBe(true);
    expect(follows(variant, tomogram)).toBe(true);
  });

  it('lists only the Actions it is based on', async () => {
    await setup();
    expect(cell('Based On').getByText('Cryo-EM imaging')).toBeInTheDocument();
    expect(
      cell('Based On').queryByText('Not an action'),
    ).not.toBeInTheDocument();
  });

  it('shows collection sizes as "N+ unit", either part alone when the other is missing', async () => {
    await setup();
    expect(
      cell('Collection Size').getByText('1000+ samples'),
    ).toBeInTheDocument();
    expect(cell('Collection Size').getByText('donors')).toBeInTheDocument();
  });
});
