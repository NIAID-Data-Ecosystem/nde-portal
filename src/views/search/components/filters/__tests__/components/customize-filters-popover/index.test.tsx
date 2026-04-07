import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CustomizeFiltersPopover } from '../../../components/customize-filters-popover';

describe('customize-filters-popover', () => {
  const filters = [
    {
      id: 'a',
      name: 'Date',
      property: 'date',
      queryType: 'histogram',
      description: '',
      category: 'Shared',
    },
    {
      id: 'b',
      name: 'Host Species',
      property: 'species',
      queryType: 'facet',
      description: '',
      category: 'Dataset',
    },
  ] as any;

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads defaults when no storage value exists and emits visible ids', async () => {
    const onVisibleFiltersChange = jest.fn();
    render(
      <CustomizeFiltersPopover
        filtersList={filters}
        onVisibleFiltersChange={onVisibleFiltersChange}
      />,
    );

    await waitFor(() => {
      expect(onVisibleFiltersChange).toHaveBeenCalledWith(['a', 'b']);
    });
  });

  it('loads valid ids from localStorage and supports search + select all toggle', async () => {
    window.localStorage.setItem(
      'search-visible-filters',
      JSON.stringify(['a']),
    );
    const onVisibleFiltersChange = jest.fn();
    render(
      <CustomizeFiltersPopover
        filtersList={filters}
        onVisibleFiltersChange={onVisibleFiltersChange}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /customize search filters/i }),
    );
    fireEvent.change(screen.getByPlaceholderText(/search filters/i), {
      target: { value: 'host' },
    });
    expect(screen.getByText('Host Species')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /select all/i }));
    await waitFor(() =>
      expect(onVisibleFiltersChange).toHaveBeenLastCalledWith(['a', 'b']),
    );
  });

  it('falls back to defaults on invalid localStorage payload', async () => {
    window.localStorage.setItem('search-visible-filters', '{bad json');
    const onVisibleFiltersChange = jest.fn();
    render(
      <CustomizeFiltersPopover
        filtersList={filters}
        onVisibleFiltersChange={onVisibleFiltersChange}
      />,
    );
    await waitFor(() => {
      expect(onVisibleFiltersChange).toHaveBeenCalledWith(['a', 'b']);
    });
  });
});
