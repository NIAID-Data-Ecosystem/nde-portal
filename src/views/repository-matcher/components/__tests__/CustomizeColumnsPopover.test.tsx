import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import { CustomizeColumnsPopover } from '../CustomizeColumnsPopover';
import { REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';

describe('CustomizeColumnsPopover', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  // The visible "Customize Columns" label is display:none at the base
  // breakpoint, so the trigger's accessible name collapses to its count.
  const triggerName = /\(\d+\/\d+\)/;

  it('renders the trigger button', () => {
    renderWithClient(<CustomizeColumnsPopover />);
    expect(
      screen.getByRole('button', { name: triggerName }),
    ).toBeInTheDocument();
  });

  it('forwards visibility changes to onVisibleColumnsChange', async () => {
    const onVisibleColumnsChange = jest.fn();
    renderWithClient(
      <CustomizeColumnsPopover
        onVisibleColumnsChange={onVisibleColumnsChange}
      />,
    );

    // The popover resolves visibility from storage and reports it back.
    await waitFor(() => expect(onVisibleColumnsChange).toHaveBeenCalled());
    const lastCall = onVisibleColumnsChange.mock.calls.at(-1)?.[0];
    expect(Array.isArray(lastCall)).toBe(true);
    // Required columns are always included.
    const requiredIds = REPOSITORY_MATCHER_COLUMNS.filter(c => c.required).map(
      c => c.id,
    );
    requiredIds.forEach(id => expect(lastCall).toContain(id));
  });
});
