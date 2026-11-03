import userEvent from '@testing-library/user-event';
import { act, render, screen } from 'src/__tests__/utils/render';

import { CustomizeColumnsPopover } from '../CustomizeColumnsPopover';

describe('CustomizeColumnsPopover', () => {
  const columns = [
    { id: 'name', title: 'Name' },
    { id: 'source', title: 'Source' },
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  // The popover is `lazyMount`, so its content only exists once opened. zag
  // drops a click dispatched before its machine has started, hence the tick.
  const openPopover = async () => {
    await act(async () => {});
    await userEvent.click(
      screen.getByRole('button', { name: /customize columns/i }),
    );
  };

  it('labels a clearAllFallbackIds column as "shown by default" and keeps it toggleable', async () => {
    render(
      <CustomizeColumnsPopover
        columnsList={columns}
        storageKeyVisible='test-visible-dataset'
        storageKeyOrder='test-order-dataset'
        defaultVisibleIds={['name', 'source']}
        requiredIds={[]}
        clearAllFallbackIds={['name']}
      />,
    );

    await openPopover();

    expect(await screen.findByText('(shown by default)')).toBeInTheDocument();

    const nameCheckbox = screen.getByRole('checkbox', { name: /^name/i });
    expect(nameCheckbox).toBeEnabled();
    expect(nameCheckbox).toBeChecked();
  });

  it('does not label a required column as "shown by default"', async () => {
    render(
      <CustomizeColumnsPopover
        columnsList={columns}
        storageKeyVisible='test-visible-samples'
        storageKeyOrder='test-order-samples'
        defaultVisibleIds={['name', 'source']}
        requiredIds={['name']}
      />,
    );

    await openPopover();

    const nameCheckbox = await screen.findByRole('checkbox', {
      name: /^name/i,
    });
    expect(nameCheckbox).toBeDisabled();
    expect(screen.queryByText('(shown by default)')).not.toBeInTheDocument();
  });
});
