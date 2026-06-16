import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useBreakpointValue } from '@chakra-ui/react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import { Filters } from '../Filters';
import { FILTERABLE_REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';

jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return { ...actual, useBreakpointValue: jest.fn() };
});

const mockUseBreakpointValue = useBreakpointValue as jest.Mock;

// Give the access (`coa`) column a single distinct term so we can assert the
// columnId passed back through onChange.
const coaColumn = FILTERABLE_REPOSITORY_MATCHER_COLUMNS.find(
  c => c.id === 'coa',
)!;
const termsByColumnId = FILTERABLE_REPOSITORY_MATCHER_COLUMNS.reduce(
  (acc, col) => {
    acc[col.id] =
      col.id === 'coa' ? [{ term: 'Open Access', label: 'Open Access' }] : [];
    return acc;
  },
  {} as Record<string, { term: string; label: string }[]>,
);

const baseProps = {
  termsByColumnId: termsByColumnId as any,
  selected: {},
  onChange: jest.fn(),
  onClearAll: jest.fn(),
  isLoading: false,
};

describe('Filters (desktop)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBreakpointValue.mockReturnValue(false);
  });

  it('renders the desktop sidebar with a Filters heading', () => {
    renderWithClient(<Filters {...baseProps} />);
    expect(
      screen.getByRole('heading', { name: 'Filters' }),
    ).toBeInTheDocument();
  });

  it('calls onChange with the column id when a term is selected', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    renderWithClient(<Filters {...baseProps} onChange={onChange} />);

    const checkbox = await screen.findByRole('checkbox', {
      name: /open access/i,
    });
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(coaColumn.id, ['Open Access']);
  });

  it('renders with no terms and no selection (fallback to empty lists)', () => {
    renderWithClient(
      <Filters
        {...baseProps}
        termsByColumnId={{} as any}
        selected={{} as any}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Filters' }),
    ).toBeInTheDocument();
  });
});

describe('Filters (mobile)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBreakpointValue.mockReturnValue(true);
  });

  it('opens a drawer and wires up Reset and Done', async () => {
    const onClearAll = jest.fn();
    const user = userEvent.setup();
    renderWithClient(
      <Filters
        {...baseProps}
        selected={{ coa: ['Open Access'] }}
        onClearAll={onClearAll}
      />,
    );

    // Collapsed state: a trigger button, no dialog yet.
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: /reset/i }));
    expect(onClearAll).toHaveBeenCalledTimes(1);

    await user.click(within(dialog).getByRole('button', { name: /done/i }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('renders the Reset button in its neutral state with no selection', async () => {
    const user = userEvent.setup();
    renderWithClient(<Filters {...baseProps} selected={{}} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = await screen.findByRole('dialog');
    // With no filters selected the Reset control still renders.
    expect(
      within(dialog).getByRole('button', { name: /reset/i }),
    ).toBeInTheDocument();
  });
});
