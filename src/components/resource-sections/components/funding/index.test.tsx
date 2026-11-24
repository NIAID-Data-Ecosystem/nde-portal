import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import { Funding as FundingType } from 'src/utils/api/types';

import { Funding } from '.';

const FUNDING: FundingType[] = [
  {
    '@type': 'MonetaryGrant',
    identifier: '1R01GM080646-01',
    name: 'PRO: A Protein Ontology',
    url: 'https://reporter.nih.gov/project-details/7255227',
    startDate: '2007-05-01',
    endDate: '2011-04-30',
    funder: [
      {
        '@type': 'Organization',
        identifier: 'https://ror.org/04q48ey07',
        name: 'National Institute of General Medical Sciences',
        alternateName: ['NIGMS'],
        parentOrganization: 'National Institutes of Health',
        employee: [{ name: 'JEAN PATTERSON' }, { name: 'JOHN DOE' }],
      },
    ],
  },
  {
    '@type': 'MonetaryGrant',
    identifier: 'core funds',
    // Nothing but a name: no details to show.
    funder: { '@type': 'Organization', name: 'EMBL' },
  },
];

const renderTable = async (data = FUNDING, loading = false) => {
  const user = userEvent.setup();
  const result = render(<Funding data={data} loading={loading} />);
  // Flush the pager's zag machines (they start in a microtask).
  await act(async () => {});
  return { user, ...result };
};

const getTable = () =>
  screen.getByRole('table', { name: 'Grant and funding information' });

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

describe('Funding', () => {
  it('shows a message instead of a table when there is no funding', async () => {
    await renderTable([]);
    expect(screen.getByText('No funding data available.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows each grant, its funders and its dates as YYYY-MM-DD', async () => {
    await renderTable();
    expect(getBodyRows()).toEqual([
      [
        'PRO: A Protein OntologyFunding ID |1R01GM080646-01',
        'National Institute of General Medical SciencesFunder ID |https://ror.org/04q48ey07More Information',
        '2007-05-01',
        '2011-04-30',
      ],
      [
        'No name providedFunding ID |core funds',
        'EMBL',
        '—No data',
        '—No data',
      ],
    ]);
    // The grant's ID links to its url.
    expect(
      within(getTable()).getByRole('link', { name: /1R01GM080646-01/ }),
    ).toHaveAttribute(
      'href',
      'https://reporter.nih.gov/project-details/7255227',
    );
  });

  it("shows the funders' details under their names when asked", async () => {
    const { user } = await renderTable();
    // Only the funder with details beyond its name has the toggle.
    const toggle = within(getTable()).getByRole('button', {
      name: 'More Information',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const details = document.getElementById(
      toggle.getAttribute('aria-controls')!,
    )!;
    expect(details).not.toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('Less Information');
    expect(details).toBeVisible();
    expect(details).toHaveTextContent('Alternate Name: NIGMS');
    expect(details).toHaveTextContent(
      'Parent Organization: National Institutes of Health',
    );
    expect(details).toHaveTextContent('Employee: JEAN PATTERSON, JOHN DOE');
  });

  it('lists at most five funders, then counts the rest', async () => {
    await renderTable([
      {
        identifier: 'G1',
        funder: Array.from({ length: 7 }, (_, i) => ({
          name: `Funder ${i + 1}`,
        })),
      },
    ]);
    expect(screen.getByText('Funder 5')).toBeInTheDocument();
    expect(screen.queryByText('Funder 6')).not.toBeInTheDocument();
    expect(screen.getByText('and 2 more...')).toBeInTheDocument();
  });

  it('sorts start dates newest first on the first click', async () => {
    const { user } = await renderTable();
    await user.click(
      within(getTable()).getByRole('button', { name: 'Start Date' }),
    );
    expect(getBodyRows().map(row => row[2])).toEqual([
      '2007-05-01',
      '—No data',
    ]);
  });
});
