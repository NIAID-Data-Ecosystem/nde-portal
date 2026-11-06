import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import RepositoryMatcher from 'src/pages/repository-matcher';
import { useRepositoryMatcherData } from 'src/views/repository-matcher/hooks/useRepositoryMatcherData';

jest.mock('src/views/repository-matcher/hooks/useRepositoryMatcherData');

// PageContainer mounts the navigation bar (and its AuthProvider dependency),
// which is irrelevant here — stub it to a passthrough wrapper.
jest.mock('src/components/page-container', () => ({
  getPageSeoConfig: () => ({}),
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockUseData = useRepositoryMatcherData as jest.Mock;

const makeRow = (overrides: Record<string, unknown>) => ({
  healthCondition: [],
  infectiousAgent: [],
  species: [],
  'meas-technique': [],
  topic: [],
  temporalCoverage: undefined,
  license: '',
  description: '',
  researchDomain: [],
  ...overrides,
});

const rows = [
  makeRow({
    _id: '1',
    _search: 'beta repo controlled generalist',
    name: { label: 'Beta Repo', url: '', _id: '1' },
    description: 'Beta description',
    researchDomain: ['Generalist'],
    coa: 'Controlled Access',
    type: ['Dataset Repository'],
  }),
  makeRow({
    _id: '2',
    _search: 'alpha repo open iid',
    name: { label: 'Alpha Repo', url: '', _id: '2' },
    description: 'Alpha description',
    researchDomain: ['IID'],
    coa: 'Open Access',
    type: ['Resource Catalog'],
  }),
];

const setData = ({
  data = rows,
  loading = false,
  error = null,
}: { data?: any[]; loading?: boolean; error?: unknown } = {}) => {
  mockUseData.mockReturnValue({ data, loading, error });
};

const TABLE_NAME = /repositories and resource catalogs/i;

const renderPage = async () => {
  const user = userEvent.setup();
  const result = renderWithClient(<RepositoryMatcher />);
  // zag machines start in a microtask; let them before interacting.
  await act(async () => {});
  return { user, ...result };
};

const table = () => screen.getByRole('table', { name: TABLE_NAME });
const rowNames = () =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .map(row => within(row).getAllByRole('cell')[0].textContent);
// The visible label only (each header also holds its hidden description).
const headers = () =>
  within(table())
    .getAllByRole('columnheader')
    .map(th => th.querySelector('.nde-header-label')?.textContent);

const openCustomizer = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /customize columns/i }));
  return screen.findByRole('dialog', { name: 'Customize Columns' });
};

describe('RepositoryMatcher page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    setData();
  });

  it('renders the heading, intro, result count and a named table', async () => {
    await renderPage();
    expect(
      screen.getByRole('heading', { name: 'Repository Matcher', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Find a suitable repository/i)).toBeInTheDocument();
    expect(screen.getByText('2 results')).toBeInTheDocument();
    expect(table()).toBeInTheDocument();
  });

  it('starts sorted by name, ascending, and toggles with one header button', async () => {
    const { user } = await renderPage();
    const nameHeader = screen.getByRole('columnheader', { name: /^name/i });
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(rowNames()).toEqual(['Alpha Repo', 'Beta Repo']);

    const sortButton = within(nameHeader).getByRole('button');
    expect(sortButton).toHaveAccessibleName(/^name$/i);
    await user.click(sortButton);
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    expect(rowNames()).toEqual(['Beta Repo', 'Alpha Repo']);
    expect(screen.getByText(/sorted by name, descending/i)).toBeInTheDocument();

    // Another column starts at its own default and the old one clears.
    const accessHeader = screen.getByRole('columnheader', { name: /access/i });
    await user.click(
      within(accessHeader).getByRole('button', { name: /^access$/i }),
    );
    expect(accessHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(nameHeader).not.toHaveAttribute('aria-sort');
    expect(rowNames()).toEqual(['Beta Repo', 'Alpha Repo']);
  });

  it('describes headers from an info button, separate from sorting', async () => {
    await renderPage();
    const access = screen.getByRole('columnheader', { name: /access/i });
    expect(
      within(access).getByRole('button', { name: /^access$/i }),
    ).toBeInTheDocument();
    expect(
      within(access).getByRole('button', { name: 'About Access' }),
    ).toHaveAccessibleDescription(/access-level definitions/i);
    expect(access).not.toHaveAttribute('aria-sort');
  });

  it('hides a column, persists it, and restores the defaults', async () => {
    const { user } = await renderPage();
    expect(headers()).toContain('Description');
    const dialog = await openCustomizer(user);

    await user.click(within(dialog).getByText('Description'));
    await waitFor(() => expect(headers()).not.toContain('Description'));
    expect(
      JSON.parse(
        window.localStorage.getItem('nde:table:repository-matcher:v1')!,
      ).visible,
    ).not.toContain('description');

    await user.click(
      within(dialog).getByRole('button', { name: /reset to defaults/i }),
    );
    await waitFor(() => expect(headers()).toContain('Description'));
  });

  it('keeps the name column visible and first', async () => {
    const { user } = await renderPage();
    const dialog = await openCustomizer(user);
    // Clear All leaves the required name column.
    await user.click(
      within(dialog).getByRole('button', { name: /clear all/i }),
    );
    await waitFor(() => expect(headers()).toEqual(['Name']));
  });

  it('reorders columns from the customizer', async () => {
    const { user } = await renderPage();
    const dialog = await openCustomizer(user);
    expect(headers().slice(0, 3)).toEqual([
      'Name',
      'Description',
      'Research Domain',
    ]);
    await user.click(
      within(dialog).getByRole('button', { name: 'Move Description down' }),
    );
    await waitFor(() =>
      expect(headers().slice(0, 3)).toEqual([
        'Name',
        'Research Domain',
        'Description',
      ]),
    );
  });

  it('pins the first column from the customizer and remembers it', async () => {
    const { user, unmount } = await renderPage();
    const root = () => table().closest('.nde-data-table')!;
    expect(root()).not.toHaveAttribute('data-pinned');

    const dialog = await openCustomizer(user);
    await user.click(within(dialog).getByText('Pin first column'));
    await waitFor(() => expect(root()).toHaveAttribute('data-pinned'));

    unmount();
    await renderPage();
    expect(root()).toHaveAttribute('data-pinned');
  });

  it('migrates column choices saved by the old popover', async () => {
    window.localStorage.setItem(
      'repository-matcher-visible-columns',
      JSON.stringify(['name', 'type']),
    );
    await renderPage();
    expect(headers()).toEqual(['Name', 'Type']);
  });

  it('filters rows with the search box', async () => {
    const { user } = await renderPage();
    await user.type(
      screen.getByRole('textbox', { name: /search repositories/i }),
      'iid',
    );
    await waitFor(() =>
      expect(screen.getByText('1 results')).toBeInTheDocument(),
    );
    expect(rowNames()).toEqual(['Alpha Repo']);
  });

  it('shows skeleton rows and marks the table busy while loading', async () => {
    setData({ data: [], loading: true });
    await renderPage();
    expect(screen.getByText('0 results')).toBeInTheDocument();
    expect(table()).toHaveAttribute('aria-busy', 'true');
    // 10 skeleton rows under the header.
    expect(within(table()).getAllByRole('row')).toHaveLength(11);
  });

  it('shows the empty state when there are no matching rows', async () => {
    setData({ data: [] });
    await renderPage();
    expect(screen.getByText('No repositories match')).toBeInTheDocument();
  });

  it('shows an error instead of the empty state when loading fails', async () => {
    setData({ data: [], error: new Error('boom') });
    await renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/i);
    expect(screen.queryByText('No repositories match')).not.toBeInTheDocument();
  });
});
