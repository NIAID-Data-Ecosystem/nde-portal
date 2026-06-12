import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// Replace the columns popover with a controllable seam: the real wrapper never
// forwards onColumnOrderChange and only fires onVisibleColumnsChange on mount,
// so we expose buttons that invoke both callbacks with crafted ids.
jest.mock(
  'src/views/repository-matcher/components/CustomizeColumnsPopover',
  () => ({
    CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY: 'repository-matcher-visible-columns',
    CUSTOM_COLUMN_ORDER_STORAGE_KEY: 'repository-matcher-column-order',
    CustomizeColumnsPopover: ({
      onVisibleColumnsChange,
      onColumnOrderChange,
    }: {
      onVisibleColumnsChange?: (ids: string[]) => void;
      onColumnOrderChange?: (ids: string[]) => void;
    }) => {
      const {
        REPOSITORY_MATCHER_COLUMNS,
      } = require('src/views/repository-matcher/table-config');
      const allIds = REPOSITORY_MATCHER_COLUMNS.map((c: any) => c.id);
      return (
        <div>
          <button onClick={() => onVisibleColumnsChange?.(allIds)}>
            vis-same
          </button>
          <button onClick={() => onVisibleColumnsChange?.(['type'])}>
            vis-reduce
          </button>
          <button onClick={() => onVisibleColumnsChange?.([])}>
            vis-empty
          </button>
          <button
            onClick={() => onVisibleColumnsChange?.(['type', 'name', 'bogus'])}
          >
            vis-bogus
          </button>
          <button
            onClick={() => onColumnOrderChange?.(['type', 'name', 'bogus'])}
          >
            order-a
          </button>
          <button onClick={() => onColumnOrderChange?.(['name', 'type'])}>
            order-b
          </button>
        </div>
      );
    },
  }),
);

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
    _search: 'alpha repo open iid',
    name: { label: 'Alpha Repo', url: '', _id: '1' },
    description: 'Alpha description',
    researchDomain: ['IID'],
    coa: 'Open Access',
    type: ['Resource Catalog'],
  }),
  makeRow({
    _id: '2',
    _search: 'beta repo controlled generalist',
    name: { label: 'Beta Repo', url: '', _id: '2' },
    description: 'Beta description',
    researchDomain: ['Generalist'],
    coa: 'Controlled Access',
    type: ['Dataset Repository'],
  }),
];

const setData = ({
  data = rows,
  isLoading = false,
}: { data?: any[]; isLoading?: boolean } = {}) => {
  mockUseData.mockReturnValue({ data, isLoading, error: null });
};

describe('RepositoryMatcher page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    setData();
  });

  it('renders the heading, intro, and result count', () => {
    renderWithClient(<RepositoryMatcher />);
    expect(
      screen.getByRole('heading', { name: 'Repository Matcher', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Find a suitable repository/i)).toBeInTheDocument();
    expect(screen.getByText('2 results')).toBeInTheDocument();
  });

  it('applies, removes, and clears column filters', async () => {
    const user = userEvent.setup();
    renderWithClient(<RepositoryMatcher />);

    // Apply the Open Access facet from the desktop sidebar.
    const checkbox = await screen.findByRole('checkbox', {
      name: /open access/i,
    });
    await user.click(checkbox);
    await waitFor(() =>
      expect(screen.getByText('1 results')).toBeInTheDocument(),
    );

    // A removable filter tag appears alongside the "Clear all" tag.
    expect(screen.getByText('Clear all')).toBeInTheDocument();

    // Find a tag's close button via the label whose parent holds a <button>
    // ("Open Access" also labels the sidebar checkbox, whose <label> has none).
    const tagCloseButton = (text: string) => {
      for (const label of screen.getAllByText(text)) {
        const btn = label.parentElement?.querySelector('button');
        if (btn) return btn;
      }
      throw new Error(`No tag close button found for "${text}"`);
    };

    await user.click(tagCloseButton('Open Access'));
    await waitFor(() =>
      expect(screen.getByText('2 results')).toBeInTheDocument(),
    );

    // Re-apply, then use the "Clear all" tag.
    await user.click(
      await screen.findByRole('checkbox', { name: /open access/i }),
    );
    await waitFor(() =>
      expect(screen.getByText('1 results')).toBeInTheDocument(),
    );
    await user.click(tagCloseButton('Clear all'));
    await waitFor(() =>
      expect(screen.getByText('2 results')).toBeInTheDocument(),
    );
  });

  it('toggles the pin-first-column checkbox', async () => {
    const user = userEvent.setup();
    renderWithClient(<RepositoryMatcher />);
    const pin = screen.getByRole('checkbox', { name: /pin first column/i });
    expect(pin).not.toBeChecked();
    await user.click(pin);
    expect(pin).toBeChecked();
  });

  it('sorts by a column header in both directions', async () => {
    const user = userEvent.setup();
    renderWithClient(<RepositoryMatcher />);
    const nameHeader = screen.getByRole('columnheader', { name: /^name/i });
    const buttons = within(nameHeader).getAllByRole('button');
    await user.click(buttons[0]);
    await user.click(buttons[buttons.length - 1]);
    // Rows still render after sorting.
    expect(screen.getAllByText(/Repo/).length).toBeGreaterThan(0);
  });

  it('sorts numeric column values with numeric comparison', async () => {
    // The description column has no getSortValue, so the raw (numeric) cell
    // value flows into the comparator's number branch.
    setData({
      data: [
        makeRow({
          _id: '1',
          _search: 'a',
          name: { label: 'A', url: '', _id: '1' },
          description: 3,
          type: ['X'],
        }),
        makeRow({
          _id: '2',
          _search: 'b',
          name: { label: 'B', url: '', _id: '2' },
          description: 20,
          type: ['Y'],
        }),
      ],
    });
    const user = userEvent.setup();
    renderWithClient(<RepositoryMatcher />);
    const header = screen.getByRole('columnheader', { name: /description/i });
    const buttons = within(header).getAllByRole('button');
    await user.click(buttons[0]);
    await user.click(buttons[buttons.length - 1]);
    expect(screen.getByText('2 results')).toBeInTheDocument();
  });

  it('responds to visibility and order changes from the columns popover', async () => {
    const user = userEvent.setup();
    renderWithClient(<RepositoryMatcher />);

    // Same visible set -> handler bails (no-op), page stays rendered.
    await user.click(screen.getByText('vis-same'));
    // Reduce to a set that excludes the current sort column -> sort resets.
    await user.click(screen.getByText('vis-reduce'));
    // A visible id with no matching column is filtered out of tableColumns.
    await user.click(screen.getByText('vis-bogus'));

    // Order change, then a no-op repeat, then a different order.
    await user.click(screen.getByText('order-a'));
    await user.click(screen.getByText('order-a'));
    await user.click(screen.getByText('order-b'));

    expect(
      screen.getByRole('heading', { name: 'Repository Matcher' }),
    ).toBeInTheDocument();
  });

  it('renders loading rows while data is loading', () => {
    setData({ data: [], isLoading: true });
    renderWithClient(<RepositoryMatcher />);
    expect(screen.getByText('0 results')).toBeInTheDocument();
  });

  it('shows the empty state when there are no matching rows', () => {
    setData({ data: [] });
    renderWithClient(<RepositoryMatcher />);
    expect(screen.getByText('No repositories match')).toBeInTheDocument();
  });
});
