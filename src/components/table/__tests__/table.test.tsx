import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from 'src/__tests__/utils/render';

import { TablePagination } from '../components/pagination';
import { RowWithDrawer } from '../components/row'; // Adjust the import path accordingly
import { Table } from '../index';

describe('Table', () => {
  test('renders with data', () => {
    const columns = [{ title: 'Name', property: 'name' }];
    const data = [{ name: 'John Doe' }];

    render(
      <Table
        ariaLabel='Test Table'
        caption='Test Caption'
        columns={columns}
        data={data}
        getCells={({ column, data }) => <span>{data[column.property]}</span>}
      />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('sorts data correctly', async () => {
    const user = userEvent.setup();
    const columns = [
      { title: 'Fruit', property: 'fruit', isSortable: true },
      { title: 'Count', property: 'count', isSortable: true },
    ];
    const data = [
      { fruit: 'apple', count: 3 },
      { fruit: 'grape', count: 18 },
      { fruit: 'orange', count: 6 },
    ];

    const table = render(
      <Table
        ariaLabel='Sortable Table'
        caption='Sorting Test'
        columns={columns}
        data={data}
        getCells={({ column, data }) => <span>{data[column.property]}</span>}
        hasPagination={false}
        loading={false}
      />,
    );

    const tableHeader = screen.getByRole('columnheader', { name: /fruit/i });
    const [ascButtonFruits, descButtonFruits] =
      within(tableHeader).getAllByRole('button');

    await user.click(ascButtonFruits);

    // Verify the order has changed based on sorting logic
    const firstRowAfterSortASC = screen.getAllByRole('cell')[0];
    expect(firstRowAfterSortASC).toHaveTextContent('apple');

    await user.click(descButtonFruits);
    const firstRowAfterSortDESC = screen.getAllByRole('cell')[0];
    expect(firstRowAfterSortDESC).toHaveTextContent('orange');

    // Check that the count column sorts correctly
    const countHeader = screen.getByRole('columnheader', { name: /count/i });
    const [ascButtonCount, descButtonCount] =
      within(countHeader).getAllByRole('button');

    await user.click(ascButtonCount);
    const firstRowAfterSortASCCount = screen.getAllByRole('cell');
    expect(firstRowAfterSortASCCount[0]).toHaveTextContent('apple');
    expect(firstRowAfterSortASCCount[1]).toHaveTextContent('3');

    await user.click(descButtonCount);
    const firstRowAfterSortDESCCount = screen.getAllByRole('cell');
    expect(firstRowAfterSortDESCCount[0]).toHaveTextContent('grape');
    expect(firstRowAfterSortDESCCount[1]).toHaveTextContent('18');

    table.unmount();

    // sorts data correctly when null values exist
    const nullData = [{ fruit: null }, { fruit: 'orange' }];
    const tableWithNullValues = render(
      <Table
        ariaLabel='Sortable Table'
        caption='Sorting Test'
        columns={columns}
        data={nullData}
        getCells={({ column, data }) => <span>{data[column.property]}</span>}
        hasPagination={false}
        loading={false}
      />,
    );

    const tableHeaderNull = screen.getByRole('columnheader', {
      name: /fruit/i,
    });
    const [ascButtonNull, descButtonNull] =
      within(tableHeaderNull).getAllByRole('button');

    await user.click(ascButtonNull);

    const firstRowAfterSortASCNull = screen.getAllByRole('cell')[0];
    expect(firstRowAfterSortASCNull).toHaveTextContent('');

    await user.click(descButtonNull);
    const firstRowAfterSortDESCNull = screen.getAllByRole('cell')[0];
    expect(firstRowAfterSortDESCNull).toHaveTextContent('orange');
    tableWithNullValues.unmount();
  });

  test('handles pagination', async () => {
    const columns = [{ title: 'Name', property: 'name' }];
    const data = new Array(20)
      .fill(null)
      .map((_, index) => ({ name: `Person ${index + 1}` }));
    render(
      <Table
        ariaLabel='Paginated Table'
        caption='Pagination Test'
        columns={columns}
        data={data}
        getCells={({ column, data }) => <span>{data[column.property]}</span>}
        hasPagination={true}
        loading={false}
        numRows={[5, 10]}
      />,
    );

    /*
    The arrow buttons are `display={['none', 'flex']}` and jsdom reports the
    base breakpoint, so they are hidden here (and a hidden node has no
    accessible name). Pagination is driven through the page combobox, which is
    the only page control the small-viewport layout shows anyway.
    */
    const user = userEvent.setup();
    await act(async () => {});

    await user.click(screen.getByLabelText('Select page'));
    await user.click(await screen.findByRole('option', { name: /^Page 2/ }));

    // Check if the table now shows data for the next page
    expect(await screen.findByText('Person 6')).toBeInTheDocument();
  });

  /*** Table expandable row ***/
  describe('Table Row', () => {
    test('renders without crashing', () => {
      render(<RowWithDrawer />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('More');
    });

    test('toggles display of children on click', async () => {
      /*
      The panel is mounted through zag's presence machine, so the body is not in
      the DOM synchronously after the click, and the accordion only responds to
      a real pointer sequence — `fireEvent.click` leaves it closed.
      */
      const user = userEvent.setup();
      const testMessage = 'Test Child';
      render(<RowWithDrawer>{testMessage}</RowWithDrawer>);
      const button = screen.getByRole('button');
      expect(screen.queryByText(testMessage)).not.toBeInTheDocument();

      // Click the button to expand
      await user.click(button);
      expect(await screen.findByText(testMessage)).toBeInTheDocument();

      // Click again to collapse
      await user.click(button);
      await waitFor(() =>
        expect(screen.queryByText(testMessage)).not.toBeInTheDocument(),
      );
    });
  });
});

/*** Table Pagination ***/
describe('Table Pagination', () => {
  const user = userEvent.setup();
  let setFrom: jest.Mock = jest.fn();
  let setSize: jest.Mock = jest.fn();
  const defaultProps = {
    total: 100,
    size: 10,
    from: 0,
    setFrom,
    setSize,
    pageSizeOptions: [5, 10, 15],
    loading: false,
  };

  const renderComponent = (props = {}) => {
    const combinedProps = { ...defaultProps, ...props };
    return render(<TablePagination {...combinedProps} />);
  };

  test('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText(/rows per page:/i)).toBeInTheDocument();
  });

  test('correctly changes page size', () => {
    renderComponent({ setSize, setFrom });

    fireEvent.change(screen.getByLabelText(/select number of rows per page/i), {
      target: { value: 15 },
    });
    expect(setSize).toHaveBeenCalledWith(15);
    expect(setFrom).toHaveBeenCalledWith(0);
  });

  test('navigates to the next page when next page button is clicked', async () => {
    await renderComponent({ setSize, setFrom });
    await user.click(screen.getByLabelText(/go to next page/i));
    expect(setFrom).toHaveBeenCalledWith(1);
  });

  test('navigates to the previous page when previous page button is clicked', async () => {
    await renderComponent({ setSize, setFrom });

    await user.click(screen.getByLabelText(/go to previous page/i));
    expect(setFrom).toHaveBeenCalledWith(0); // Should go back to the first page
  });

  test('navigates to the first page when first page button is clicked', async () => {
    await renderComponent({ setSize, setFrom });

    await user.click(screen.getByLabelText(/go to first page/i));
    expect(setFrom).toHaveBeenCalledWith(0); // Should go back to the very first page
  });

  test('navigates to the last page when last page button is clicked', async () => {
    const totalPages = Math.ceil(defaultProps.total! / defaultProps.size!);
    await renderComponent({ setSize, setFrom });

    await user.click(screen.getByLabelText(/go to last page/i));
    expect(setFrom).toHaveBeenCalledWith(totalPages - 1); // Should navigate to the last page
  });

  test('updates the page when a page is picked from the combobox', async () => {
    const onSetFrom = jest.fn();
    renderComponent({ setFrom: onSetFrom });
    // Let the combobox's state machine start before interacting.
    await act(async () => {});

    await user.click(screen.getByLabelText('Select page'));
    await user.click(await screen.findByRole('option', { name: /^Page 2/ }));

    // PageCombobox reports 1-based pages; `from` is a 0-based index.
    await waitFor(() => expect(onSetFrom).toHaveBeenCalledWith(1));
  });

  test('updates the page when a page number is typed into the combobox', async () => {
    const onSetFrom = jest.fn();
    renderComponent({ setFrom: onSetFrom });
    await act(async () => {});

    const input = screen.getByLabelText('Select page');
    await user.clear(input);
    await user.type(input, '7');
    await act(async () => {});
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onSetFrom).toHaveBeenCalledWith(6));
  });

  test('reverts a page number past the last page instead of navigating', async () => {
    const onSetFrom = jest.fn();
    renderComponent({ setFrom: onSetFrom });
    await act(async () => {});

    const input = screen.getByLabelText('Select page');
    await user.clear(input);
    await user.type(input, '99');
    await act(async () => {});
    await user.keyboard('{Enter}');

    // Only 10 pages exist, so nothing matches and zag restores the current page.
    await waitFor(() => expect(input).toHaveValue('1'));
    expect(onSetFrom).not.toHaveBeenCalled();
  });

  test('displays correct total pages and current page information', async () => {
    renderComponent({ total: 45, size: 10 }); // Should result in 5 total pages
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  test('first and previous page buttons are disabled on the first page', async () => {
    renderComponent({ from: 0 }); // On the first page
    expect(screen.getByLabelText(/first page/i)).toBeDisabled();
    expect(screen.getByLabelText(/previous page/i)).toBeDisabled();
  });

  test('next and last page buttons are disabled on the last page', async () => {
    renderComponent({ from: 9, total: 100, size: 10 }); // On the last page (page 10 of 10)
    expect(screen.getByLabelText(/next page/i)).toBeDisabled();
    expect(screen.getByLabelText(/last page/i)).toBeDisabled();
  });

  test('renders all pageSizeOptions correctly', () => {
    renderComponent();
    const pageSizeSelect = screen.getByLabelText(
      /select number of rows per page/i,
    );
    const options = within(pageSizeSelect).getAllByRole('option');
    expect(options).toHaveLength(defaultProps.pageSizeOptions.length);
    defaultProps.pageSizeOptions.forEach((size, index) => {
      expect(options[index]).toHaveTextContent(String(size));
    });
  });
});
