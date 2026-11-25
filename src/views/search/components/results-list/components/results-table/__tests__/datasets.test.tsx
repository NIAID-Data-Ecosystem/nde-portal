import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import { DATASET_COLUMNS, datasetsTable } from '../tables/datasets';

/*
The Datasets table's cells. What every Search table shares (sorting,
preferences, "No data", the customizer) is in search-tables.test.tsx.
*/

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
    funding: [
      {
        identifier: 'R01AI000001',
        url: 'https://reporter.nih.gov/R01AI000001',
        funder: [{ name: 'NIAID', identifier: 'https://ror.org/043z4tv69' }],
      },
    ],
    usageInfo: { url: 'https://example.org/terms' },
  },
] as unknown as FormattedResource[];

const { Table } = datasetsTable;

const setup = async () => {
  render(<Table results={RESULTS} loading={false} onSortChange={jest.fn()} />);
  await act(async () => {});
};

const cell = (header: string) => {
  const table = screen.getByRole('table', { name: 'Dataset search results' });
  const index = within(table)
    .getAllByRole('columnheader')
    .findIndex(th => th.textContent === header);
  const row = within(table).getAllByRole('row')[1];
  return within(within(row).getAllByRole('cell')[index]);
};

beforeEach(() => {
  window.localStorage.clear();
  mockRouter.setCurrentUrl('/search?q=flu&tab=d');
});

describe('Datasets table', () => {
  it('shows every column by default, in the card’s order', async () => {
    await setup();
    const table = screen.getByRole('table', { name: 'Dataset search results' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map(th => th.textContent),
    ).toEqual(DATASET_COLUMNS.map(c => c.header));
  });

  it('links the name to its resource page, with the search as referrer', async () => {
    await setup();
    const link = cell('Name').getByRole('link', {
      name: 'Influenza challenge study',
    });
    const href = new URL(link.getAttribute('href')!, 'http://x');
    expect(href.pathname).toBe('/resources/');
    expect(href.searchParams.get('id')).toBe('ds-1');
    expect(href.searchParams.get('referrerPath')).toBe('/search?q=flu&tab=d');
    expect(link).toHaveAttribute('data-as', '/resources?id=ds-1');
  });

  it('shows the shaped values', async () => {
    await setup();
    expect(cell('Date').getByText('2023-04-05')).toBeInTheDocument();
    expect(
      cell('Conditions of Access').getByText('Open Access'),
    ).toBeInTheDocument();
    expect(
      cell('Source').getByRole('link', { name: /ImmPort/ }),
    ).toHaveAttribute('href', 'https://www.immport.org');
    expect(cell('Pathogen').getByText('Influenza A virus')).toBeInTheDocument();
    expect(
      cell('Samples').getByText('1,200 (experimental)'),
    ).toBeInTheDocument();
    expect(cell('Funder').getByRole('link', { name: /NIAID/ })).toHaveAttribute(
      'href',
      'https://ror.org/043z4tv69',
    );
    expect(
      cell('Funding ID').getByRole('link', { name: /R01AI000001/ }),
    ).toHaveAttribute('href', 'https://reporter.nih.gov/R01AI000001');
    // A usage entry with no name reads "Usage Agreement", as on the card.
    expect(
      cell('Usage Info').getByRole('link', { name: /Usage Agreement/ }),
    ).toHaveAttribute('href', 'https://example.org/terms');
  });
});
