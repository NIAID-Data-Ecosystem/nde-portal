import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import { DATASET_COLUMNS, DatasetResultsTable } from '.';

// The shared mock keeps only an object href's pathname; keep its query too,
// to check the referrer the name link carries. (`as` is Next's display URL.)
jest.mock('next/link', () => {
  const { forwardRef } = jest.requireActual('react');
  const { format } = jest.requireActual('url');
  return {
    __esModule: true,
    default: forwardRef(
      ({ href, children, prefetch, as, ...rest }: any, ref: any) => (
        <a
          ref={ref}
          href={typeof href === 'string' ? href : format(href)}
          data-as={as}
          {...rest}
        >
          {children}
        </a>
      ),
    ),
  };
});

const STORAGE_KEY = 'nde:table:search-datasets:v1';

const RESULTS = [
  {
    _id: 'ds-1',
    id: 'ds-1',
    '@type': 'Dataset',
    name: 'Influenza challenge study',
    date: '2023-04-05T00:00:00',
    conditionsOfAccess: 'Open',
    description: 'A study.',
    includedInDataCatalog: {
      name: 'ImmPort',
      url: 'https://www.immport.org',
    },
    infectiousAgent: [{ name: 'influenza A virus' }],
    sample: {
      '@type': 'SampleCollection',
      numberOfItems: { value: 1200 },
    },
  },
  {
    _id: 'ds-2',
    id: 'ds-2',
    '@type': 'Dataset',
    name: 'Untitled survey',
    // Everything else missing.
  },
] as unknown as FormattedResource[];

const setup = async (
  props: Partial<React.ComponentProps<typeof DatasetResultsTable>> = {},
) => {
  const user = userEvent.setup();
  const onSortChange = jest.fn();
  render(
    <DatasetResultsTable
      results={RESULTS}
      loading={false}
      onSortChange={onSortChange}
      {...props}
    />,
  );
  await act(async () => {});
  return { user, onSortChange };
};

const table = () =>
  screen.getByRole('table', { name: 'Dataset search results' });
const header = (name: RegExp) =>
  within(table()).getByRole('columnheader', { name });
const headerTitles = () =>
  within(table())
    .getAllByRole('columnheader')
    .map(th => th.textContent);
const firstRow = () => within(table()).getAllByRole('row')[1];
const secondRow = () => within(table()).getAllByRole('row')[2];

beforeEach(() => {
  window.localStorage.clear();
  mockRouter.setCurrentUrl('/search?q=flu&tab=d');
});

describe('DatasetResultsTable', () => {
  it('shows every column by default, in the card’s order', async () => {
    await setup();
    expect(headerTitles()).toEqual(DATASET_COLUMNS.map(c => c.header));
  });

  it('reports a header sort as the API field and direction', async () => {
    const { user, onSortChange } = await setup();

    await user.click(
      within(header(/^name/i)).getByRole('button', { name: 'Name' }),
    );
    expect(onSortChange).toHaveBeenLastCalledWith('name.raw', true);

    // Dates sort newest first on the first click.
    await user.click(
      within(header(/^date/i)).getByRole('button', { name: 'Date' }),
    );
    expect(onSortChange).toHaveBeenLastCalledWith('date', false);

    await user.click(
      within(header(/^source/i)).getByRole('button', { name: 'Source' }),
    );
    expect(onSortChange).toHaveBeenLastCalledWith(
      'includedInDataCatalog.name',
      true,
    );
  });

  it('shows the current API sort on its column and flips it on click', async () => {
    const { user, onSortChange } = await setup({ currentSort: '-date' });
    expect(header(/^date/i)).toHaveAttribute('aria-sort', 'descending');
    expect(header(/^name/i)).not.toHaveAttribute('aria-sort');

    await user.click(
      within(header(/^date/i)).getByRole('button', { name: 'Date' }),
    );
    expect(onSortChange).toHaveBeenLastCalledWith('date', true);
  });

  it('marks no column as sorted for "Best match"', async () => {
    await setup({ currentSort: '_score' });
    within(table())
      .getAllByRole('columnheader')
      .forEach(th => expect(th).not.toHaveAttribute('aria-sort'));
  });

  it('only offers sorting on the columns the API can sort', async () => {
    await setup();
    const sortable = within(table())
      .getAllByRole('columnheader')
      .filter(th => within(th).queryByRole('button'))
      .map(th => th.textContent);
    expect(sortable).toEqual([
      'Name',
      'Source',
      'Date',
      'Conditions of Access',
    ]);
  });

  it('links the name to its resource page, with the search as referrer', async () => {
    await setup();
    const link = within(firstRow()).getByRole('link', {
      name: 'Influenza challenge study',
    });
    const href = new URL(link.getAttribute('href')!, 'http://x');
    expect(href.pathname).toBe('/resources/');
    expect(href.searchParams.get('id')).toBe('ds-1');
    expect(href.searchParams.get('referrerPath')).toBe('/search?q=flu&tab=d');
    expect(link).toHaveAttribute('data-as', '/resources?id=ds-1');
  });

  it('renders the shaped values: ISO date, access badge, terms, sample count', async () => {
    await setup();
    const row = within(firstRow());
    expect(row.getByText('2023-04-05')).toBeInTheDocument();
    expect(row.getByText('Open Access')).toBeInTheDocument();
    expect(row.getByRole('link', { name: /ImmPort/ })).toHaveAttribute(
      'href',
      'https://www.immport.org',
    );
    expect(row.getByText('Influenza A virus')).toBeInTheDocument();
    expect(row.getByText('1,200 (experimental)')).toBeInTheDocument();
  });

  it('shows "No data" for missing values', async () => {
    await setup();
    // Every column but Name is missing on the second row.
    expect(within(secondRow()).getAllByText('No data')).toHaveLength(
      DATASET_COLUMNS.length - 1,
    );
  });

  it('shows skeleton rows while the first results load', async () => {
    await setup({ results: [], loading: true });
    expect(table()).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });

  describe('column preferences', () => {
    it('migrates the pre-DataTable visible and order keys', async () => {
      window.localStorage.setItem(
        'search-visible-dataset-columns',
        JSON.stringify(['name', 'date', 'source']),
      );
      window.localStorage.setItem(
        'search-dataset-column-order',
        JSON.stringify([
          'date',
          'name',
          'source',
          ...DATASET_COLUMNS.map(c => c.id).filter(
            id => !['date', 'name', 'source'].includes(id),
          ),
        ]),
      );
      await setup();
      expect(headerTitles()).toEqual(['Date', 'Name', 'Source']);
    });

    it('falls back to the defaults for an empty legacy selection', async () => {
      window.localStorage.setItem(
        'search-visible-dataset-columns',
        JSON.stringify([]),
      );
      await setup();
      expect(headerTitles()).toHaveLength(DATASET_COLUMNS.length);
    });

    it('reads the v1 key', async () => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          v: 1,
          visible: ['description', 'name'],
          order: [
            'description',
            'name',
            ...DATASET_COLUMNS.map(c => c.id).filter(
              id => !['description', 'name'].includes(id),
            ),
          ],
          pinned: false,
        }),
      );
      await setup();
      expect(headerTitles()).toEqual(['Description', 'Name']);
    });
  });
});
