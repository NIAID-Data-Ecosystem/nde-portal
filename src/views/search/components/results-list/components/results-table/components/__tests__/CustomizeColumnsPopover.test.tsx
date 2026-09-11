import { fireEvent, render, screen } from '@testing-library/react';
import { CustomizeColumnsPopover } from '../CustomizeColumnsPopover';

describe('CustomizeColumnsPopover', () => {
  const columns = [
    { id: 'name', title: 'Name' },
    { id: 'source', title: 'Source' },
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('labels a clearAllFallbackIds column as "shown by default" and keeps it toggleable', () => {
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

    fireEvent.click(screen.getByRole('button', { name: /customize columns/i }));

    expect(screen.getByText('(shown by default)')).toBeInTheDocument();

    const nameCheckbox = screen.getByRole('checkbox', { name: /^name/i });
    expect(nameCheckbox).toBeEnabled();
    expect(nameCheckbox).toBeChecked();
  });

  it('does not label a required column as "shown by default"', () => {
    render(
      <CustomizeColumnsPopover
        columnsList={columns}
        storageKeyVisible='test-visible-samples'
        storageKeyOrder='test-order-samples'
        defaultVisibleIds={['name', 'source']}
        requiredIds={['name']}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /customize columns/i }));

    expect(screen.queryByText('(shown by default)')).not.toBeInTheDocument();

    const nameCheckbox = screen.getByRole('checkbox', { name: /^name/i });
    expect(nameCheckbox).toBeDisabled();
  });
});
