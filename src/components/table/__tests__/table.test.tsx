import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../index';
import { RowWithDrawer } from '../components/row'; // Adjust the import path accordingly
import { TablePagination } from '../components/pagination';

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
        isLoading={false}
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
        isLoading={false}
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
        isLoading={false}
        numRows={[5, 10]}
      />,
    );

    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await userEvent.click(nextPageButton);

    // Check if the table now shows data for the next page
    expect(screen.getByText('Person 6')).toBeInTheDocument();
  });

  /*** Table expandable row ***/
  describe('Table Row', () => {
    test('renders without crashing', () => {
      render(<RowWithDrawer />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('More');
    });

    test('toggles display of children on click', () => {
      const testMessage = 'Test Child';
      render(<RowWithDrawer>{testMessage}</RowWithDrawer>);
      const button = screen.getByRole('button');
      expect(screen.queryByText(testMessage)).not.toBeInTheDocument();

      // Click the button to expand
      fireEvent.click(button);
      expect(screen.getByText(testMessage)).toBeInTheDocument();

      // Click again to collapse
      fireEvent.click(button);
      expect(screen.queryByText(testMessage)).not.toBeInTheDocument();
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
    isLoading: false,
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

  test('updates the page when a new page is selected from the dropdown', async () => {
    renderComponent({ setSize, setFrom });
    const select = screen.getByLabelText('Select page');
    await user.selectOptions(select, '2'); // Selecting page 3 (option value is zero-based index)
    expect(setFrom).toHaveBeenCalledWith(2);
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
