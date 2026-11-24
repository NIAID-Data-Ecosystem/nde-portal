import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { SampleAggregate, SampleCollection } from 'src/utils/api/types';

import { useSampleCollectionItems } from '../../hooks/useSampleCollectionItems';
import { SampleCollectionItemsTable } from '.';

jest.mock('../../hooks/useSampleCollectionItems', () => ({
  useSampleCollectionItems: jest.fn(),
}));
const mockUseSampleCollectionItems = useSampleCollectionItems as jest.Mock;

// The collection's own item list, used when no samples could be fetched.
const FALLBACK = {
  '@type': 'SampleCollection',
  itemListElement: [
    { identifier: 'SAMN2', url: 'https://example.com/samn2' },
    { identifier: 'SAMN1' },
  ],
  aggregateElement: {
    '@type': 'Sample',
    cellType: [{ name: 'Immune' }, { name: 'Water' }],
  },
} as unknown as SampleCollection;

// Fetched samples: sex differs between them, so it gets a column; species is
// the same for both, so it's hidden.
const SAMPLES = [
  {
    identifier: 'GSM2',
    url: 'https://example.com/gsm2',
    sex: 'male',
    species: [{ name: 'mus musculus' }],
  },
  {
    identifier: 'GSM1',
    sex: 'female',
    species: [{ name: 'mus musculus' }],
  },
] as unknown as SampleAggregate[];

const renderTable = async (
  hook: { data?: SampleAggregate[]; isLoading: boolean },
  fallbackSampleCollection?: SampleCollection,
) => {
  mockUseSampleCollectionItems.mockReturnValue(hook);
  const result = render(
    <SampleCollectionItemsTable
      parentIdentifier='parent-xyz'
      fallbackSampleCollection={fallbackSampleCollection}
    />,
  );
  // Flush the pager's zag machines (they start in a microtask).
  await act(async () => {});
  return result;
};

/** Body rows' cell text, in order. */
const getBodyRows = (label: string) =>
  within(screen.getByRole('table', { name: label }))
    .getAllByRole('row')
    .slice(1)
    .map(row =>
      within(row)
        .getAllByRole('cell')
        .map(cell => cell.textContent),
    );

describe('SampleCollectionItemsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the samples of the given parent', async () => {
    await renderTable({ data: [], isLoading: false });
    expect(mockUseSampleCollectionItems).toHaveBeenCalledWith(
      'parent-xyz',
      true,
    );
  });

  it('renders skeleton placeholders and no table while loading', async () => {
    const { container } = await renderTable(
      { data: undefined, isLoading: true },
      FALLBACK,
    );
    expect(container.querySelectorAll('.chakra-skeleton').length).toBe(4);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it.each([
    ['no samples', []],
    ['an undefined result', undefined],
  ])('renders nothing for %s and no fallback', async (_, data) => {
    const { container } = await renderTable({ data, isLoading: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the fallback has no items', async () => {
    const { container } = await renderTable({ data: [], isLoading: false }, {
      ...FALLBACK,
      itemListElement: [],
    } as SampleCollection);
    expect(container).toBeEmptyDOMElement();
  });

  describe('without fetched samples, with a fallback collection', () => {
    it.each([
      ['no samples', []],
      ['an undefined result', undefined],
    ])(
      'shows its items, each with the aggregate properties, sorted by Sample ID (%s)',
      async (_, data) => {
        await renderTable({ data, isLoading: false }, FALLBACK);
        expect(getBodyRows('Sample Collection List')).toEqual([
          ['SAMN1', 'ImmuneWater'],
          ['SAMN2', 'ImmuneWater'],
        ]);
        expect(screen.getByRole('link', { name: /SAMN2/ })).toHaveAttribute(
          'href',
          'https://example.com/samn2',
        );
      },
    );
  });

  describe('with fetched samples', () => {
    it('shows a row per sample, sorted by Sample ID, with the columns that differ', async () => {
      await renderTable({ data: SAMPLES, isLoading: false }, FALLBACK);
      const label = '2 samples in this collection';
      expect(
        within(screen.getByRole('table', { name: label }))
          .getAllByRole('columnheader')
          .map(header => header.textContent),
      ).toEqual(['Sample ID', 'Sex']);
      expect(getBodyRows(label)).toEqual([
        ['GSM1', 'Female'],
        ['GSM2', 'Male'],
      ]);
      expect(screen.getByRole('link', { name: /GSM2/ })).toHaveAttribute(
        'href',
        'https://example.com/gsm2',
      );
    });

    it.each([
      [1, '1 sample in this collection'],
      [3, '3 samples in this collection'],
    ])('names the table after its %i sample(s)', async (count, label) => {
      const samples = Array.from({ length: count }, (_, i) => ({
        identifier: `S${i}`,
      })) as unknown as SampleAggregate[];
      await renderTable({ data: samples, isLoading: false });
      expect(screen.getByRole('table', { name: label })).toBeInTheDocument();
    });
  });
});
