import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  act,
  render,
  screen,
  waitFor,
  within,
} from 'src/__tests__/utils/render';
import { useUserData } from 'src/hooks/useUserData';
import { SavedQuery } from 'src/hooks/useUserData/types';

import {
  formatTableData,
  SAVED_QUERY_COLUMNS,
  SAVED_QUERY_INITIAL_SORT,
  SAVED_RESOURCE_COLUMNS,
  SAVED_RESOURCE_INITIAL_SORT,
} from '../table-config';
import { SavedResourceItem } from '../types';
import { SavedTableSection } from './saved-table-section';

jest.mock('src/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));
const mockUseUserData = useUserData as jest.Mock;

const RESOURCES: SavedResourceItem[] = [
  {
    dataset_id: 'zenodo_2',
    name: 'Beta study',
    saved_at: '2026-05-21T20:52:22.978Z',
    type: 'ComputationalTool',
    source: ['bio.tools', 'Zenodo'],
    dateModified: '2026-01-14T00:00:00Z',
  },
  {
    dataset_id: 'figshare_1',
    name: '"Alpha" dataset',
    saved_at: '2026-05-27T20:52:16.714Z',
    type: 'Dataset',
    source: ['Figshare'],
    dateModified: '2024-01-26',
  },
  // Not hydrated (yet): only what the user saved.
  {
    dataset_id: 'figshare_3',
    name: 'Gamma',
    saved_at: '2026-05-23T10:00:00Z',
  },
];

const QUERIES: SavedQuery[] = [
  {
    total: 12085524,
    query: '__all__',
    name: 'All Results',
    filters: { date: ['2000-01-01', '2026-12-31'] },
    saved_at: '2026-06-30T19:59:21.733Z',
  },
  {
    total: 500,
    query: 'asthma',
    name: 'Asthma',
    filters: {},
    saved_at: '2026-06-09T16:21:22+00:00',
  },
];

const getResourceRowId = (item: SavedResourceItem) => item.dataset_id;
const getQueryRowId = (item: SavedQuery) =>
  item.query + JSON.stringify(item.filters);

const userData = (overrides = {}) => ({
  savedDatasets: RESOURCES,
  savedQueries: QUERIES,
  addSavedDataset: jest.fn(),
  removeSavedDataset: jest.fn(),
  addSavedQuery: jest.fn(),
  removeSavedQuery: jest.fn(),
  ...overrides,
});

const COMMON_PROPS = {
  title: 'Saved Things',
  description: 'Things you saved.',
  unit: { singular: 'item', plural: 'items' },
  searchPlaceholder: 'Search saved things',
  searchAriaLabel: 'Search saved things',
};

const renderResources = async (data = RESOURCES) => {
  const user = userEvent.setup();
  const result = render(
    <SavedTableSection
      {...COMMON_PROPS}
      label='Saved resources'
      columns={SAVED_RESOURCE_COLUMNS}
      initialSort={SAVED_RESOURCE_INITIAL_SORT}
      data={data}
      getRowId={getResourceRowId}
    />,
  );
  // Flush the pager's zag machines (they start in a microtask).
  await act(async () => {});
  return { user, ...result };
};

const renderQueries = async (data = QUERIES) => {
  const user = userEvent.setup();
  const result = render(
    <SavedTableSection
      {...COMMON_PROPS}
      label='Saved queries'
      columns={SAVED_QUERY_COLUMNS}
      initialSort={SAVED_QUERY_INITIAL_SORT}
      data={data}
      getRowId={getQueryRowId}
    />,
  );
  await act(async () => {});
  return { user, ...result };
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

describe('SavedTableSection', () => {
  beforeEach(() => {
    mockUseUserData.mockReturnValue(userData());
  });

  describe('saved resources', () => {
    it('starts sorted by name (ignoring leading quotes) and formats each column', async () => {
      await renderResources();
      expect(getBodyRows('Saved resources')).toEqual([
        [
          '"Alpha" datasetID: figshare_1',
          'Dataset',
          'Figshare',
          '2024-01-26',
          '2026-05-27',
        ],
        [
          'Beta studyID: zenodo_2',
          'Computational Tool',
          'bio.tools, Zenodo',
          '2026-01-14',
          '2026-05-21',
        ],
        // Metadata not fetched yet: "No data", not a blank or a fallback.
        [
          'GammaID: figshare_3',
          '—No data',
          '—No data',
          '—No data',
          '2026-05-23',
        ],
      ]);
      expect(
        screen.getByRole('columnheader', { name: 'Name' }),
      ).toHaveAttribute('aria-sort', 'ascending');
      expect(screen.getByRole('link', { name: 'Beta study' })).toHaveAttribute(
        'href',
        '/resources?id=zenodo_2',
      );
      // The count beside the heading (the pager repeats it).
      expect(screen.getByText('Saved Things')).toHaveTextContent(
        'Saved Things3 items',
      );
    });

    it('sorts dates newest first on the first click', async () => {
      const { user } = await renderResources();
      await user.click(screen.getByRole('button', { name: 'Updated On' }));
      expect(getBodyRows('Saved resources').map(cells => cells[3])).toEqual([
        '2026-01-14',
        '2024-01-26',
        // Empty values always sort last.
        '—No data',
      ]);
    });

    it('removes a saved resource, and re-saves it as it was saved', async () => {
      const removeSavedDataset = jest.fn();
      const addSavedDataset = jest.fn();
      mockUseUserData.mockReturnValue(
        userData({
          removeSavedDataset,
          addSavedDataset,
          // Gamma has already been removed in this visit.
          savedDatasets: RESOURCES.slice(0, 2),
        }),
      );
      const { user } = await renderResources();
      const rows = within(
        screen.getByRole('table', { name: 'Saved resources' }),
      ).getAllByRole('row');

      await user.click(
        within(rows[1]).getByRole('button', { name: 'Remove from saved' }),
      );
      expect(removeSavedDataset).toHaveBeenCalledWith('figshare_1');

      await user.click(
        within(rows[3]).getByRole('button', { name: 'Save this resource' }),
      );
      // The saved item itself, without the table's row id or search text.
      expect(addSavedDataset).toHaveBeenCalledWith(RESOURCES[2]);
    });

    it('pages the rows five at a time', async () => {
      const many = Array.from({ length: 6 }, (_, i) => ({
        dataset_id: `id_${i + 1}`,
        name: `Resource ${i + 1}`,
      }));
      const { user } = await renderResources(many);
      expect(getBodyRows('Saved resources')).toHaveLength(5);
      await user.click(await screen.findByLabelText(/go to next page/i));
      expect(getBodyRows('Saved resources').map(cells => cells[0])).toEqual([
        'Resource 6ID: id_6',
      ]);
    });

    it('says nothing is saved when there is no data at all', async () => {
      await renderResources([]);
      expect(screen.getByText('Nothing saved yet')).toBeInTheDocument();
    });
  });

  describe('saved queries', () => {
    it('starts in ascending order of Total, which has no sort button', async () => {
      await renderQueries();
      expect(getBodyRows('Saved queries')).toEqual([
        ['500', 'Asthma', '—No data', '2026-06-09'],
        [
          '12,085,524',
          'All Results',
          'Date: From 2000-01-01 to 2026-12-31',
          '2026-06-30',
        ],
      ]);
      const total = screen.getByRole('columnheader', { name: 'Total' });
      expect(total).toHaveAttribute('aria-sort', 'ascending');
      expect(within(total).queryByRole('button')).not.toBeInTheDocument();
    });

    it('links each query to its search, filters included', async () => {
      await renderQueries();
      expect(screen.getByRole('link', { name: 'All Results' })).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/search\?q=__all__&filters=.+2000-01-01/),
      );
    });

    it('searches every column and says when nothing matches', async () => {
      const { user } = await renderQueries();
      const search = screen.getByRole('textbox', {
        name: 'Search saved things',
      });

      // The applied filters' text.
      await user.type(search, 'date: from');
      await waitFor(() =>
        expect(getBodyRows('Saved queries').map(cells => cells[1])).toEqual([
          'All Results',
        ]),
      );

      // Dates match as shown.
      await user.clear(search);
      await user.type(search, '2026-06-09');
      await waitFor(() =>
        expect(getBodyRows('Saved queries').map(cells => cells[1])).toEqual([
          'Asthma',
        ]),
      );

      await user.clear(search);
      await user.type(search, 'zzz-no-match');
      expect(await screen.findByText('No matches')).toBeInTheDocument();
    });

    it('toggles a saved query by its query and filters', async () => {
      const removeSavedQuery = jest.fn();
      mockUseUserData.mockReturnValue(userData({ removeSavedQuery }));
      const { user } = await renderQueries();
      const rows = within(
        screen.getByRole('table', { name: 'Saved queries' }),
      ).getAllByRole('row');
      await user.click(
        within(rows[1]).getByRole('button', { name: 'Remove saved query' }),
      );
      expect(removeSavedQuery).toHaveBeenCalledWith(QUERIES[1]);
    });
  });
});

describe('formatTableData', () => {
  it('dedupes rows by id and indexes every column for search', () => {
    const rows = formatTableData(
      [...QUERIES, QUERIES[0]],
      SAVED_QUERY_COLUMNS,
      getQueryRowId,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].item).toBe(QUERIES[0]);
    expect(rows[0]._search).toBe(
      '12085524 all results __all__ date: from 2000-01-01 to 2026-12-31 2026-06-30',
    );
  });
});
