import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBarWithDropdown } from './index'; // Replace this with the correct import path.
import { useRouter } from 'next/router';
import { renderWithClient } from 'src/__tests__/mocks/utils';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('SearchBarWithDropdown', () => {
  let useRouterMock;

  beforeEach(() => {
    useRouterMock = {
      push: jest.fn(),
      query: {
        q: 'test',
        advancedSearch: 'false',
      },
    };
    (useRouter as jest.Mock).mockReturnValue(useRouterMock);
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('renders without crashing', () => {
    renderWithClient(
      <SearchBarWithDropdown ariaLabel='search' placeholder='search...' />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // Check that the search input is pre-filled with the search term from the router query parameters.
  it('uses search term from query params', () => {
    renderWithClient(
      <SearchBarWithDropdown ariaLabel='search' placeholder='search...' />,
    );
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('updates the search term when typing', async () => {
    renderWithClient(
      <SearchBarWithDropdown ariaLabel='search' placeholder='search...' />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello');

    expect(screen.getByDisplayValue('testhello')).toBeInTheDocument();
  });

  // Check that the router.push function is called when the form is submitted, with the correct parameters.
  it('calls router.push on form submit', async () => {
    renderWithClient(
      <SearchBarWithDropdown ariaLabel='search' placeholder='search...' />,
    );
    const input = screen.getByRole('textbox');
    const form = screen.getByRole('form');
    await userEvent.clear(input);
    await userEvent.type(input, 'hello');

    fireEvent.submit(form);
    expect(useRouterMock.push).toHaveBeenCalledWith({
      pathname: '/search',
      query: { q: 'hello' },
    });
  });

  it('handles and displays search history correctly', async () => {
    const { getByText } = renderWithClient(
      <SearchBarWithDropdown ariaLabel='search' placeholder='search...' />,
    );

    const getByTextContent = (text: string) => {
      return getByText((_, element: any) => {
        const hasText = (element: any) => element.textContent === text;
        const elementHasText = hasText(element);
        const childrenDontHaveText = Array.from(element?.children || []).every(
          child => !hasText(child),
        );
        return elementHasText && childrenDontHaveText;
      });
    };

    const input = screen.getByRole('textbox');
    const form = screen.getByRole('form');

    // Submit a few searches
    await userEvent.clear(input);
    await userEvent.type(input, 'first search');
    fireEvent.submit(form);

    await userEvent.clear(input);
    await userEvent.type(input, 'second search');
    fireEvent.submit(form);

    await userEvent.clear(input);
    await userEvent.type(input, 'third search');
    fireEvent.submit(form);

    // Open search history dropdown
    await userEvent.click(screen.getByLabelText(/toggle search/i));

    const firstSearchItem = getByTextContent('first search');
    const secondSearchItem = getByTextContent('second search');
    const thirdSearchItem = getByTextContent('third search');

    // Verify that the searches are in the dropdown
    expect(firstSearchItem).toBeInTheDocument();
    expect(secondSearchItem).toBeInTheDocument();
    expect(thirdSearchItem).toBeInTheDocument();

    // Verify that the searches are in local storage
    expect(window.localStorage.getItem('basic-searches')).toContain(
      'first search',
    );

    expect(window.localStorage.getItem('basic-searches')).toContain(
      'second search',
    );

    expect(window.localStorage.getItem('basic-searches')).toContain(
      'third search',
    );
  }, 15000);
});
