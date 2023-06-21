import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import {
  DropdownInput,
  DropdownList,
  DropdownListItem,
  Highlight,
  InputWithDropdown,
} from 'src/components/input-with-dropdown/';
import { act } from 'react-dom/test-utils';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import userEvent from '@testing-library/user-event';

describe('DropdownListItem', () => {
  it('renders properly with provided value and highlights the search term', () => {
    const props = {
      searchTerm: 'term',
      name: 'category',
      value: 'term This term is a term',
      index: 0,
      onMouseOver: jest.fn(),
      onClick: jest.fn(),
    };

    const { getByText, getAllByText } = renderWithClient(
      <InputWithDropdown inputValue={''} cursorMax={4} isOpen={true}>
        <DropdownList>
          <DropdownListItem {...props} />
        </DropdownList>
      </InputWithDropdown>,
    );

    const heading = document.querySelector('h4');

    expect(getByText('category')).toBeInTheDocument();
    expect(heading.textContent.toLowerCase()).toBe('term this term is a term');

    // search terms are highlighted and should be wrapped by <mark></mark>.
    const elements = getAllByText('term');
    elements.forEach(element => {
      expect(element.tagName).toBe('MARK');
    });
  });

  it('responds to mouseover event', async () => {
    const props = {
      name: 'category',
      searchTerm: 'term',
      value: 'This is a term',
      onMouseOver: jest.fn(),
      onClick: jest.fn(),
    };

    const { getAllByRole } = renderWithClient(
      <InputWithDropdown inputValue={''} cursorMax={4} isOpen={true}>
        <DropdownList>
          <DropdownListItem {...props} />
        </DropdownList>
      </InputWithDropdown>,
    );

    const listEl = getAllByRole('listitem').filter(el =>
      el.textContent.includes(props.value),
    )[0];

    await act(async () => {
      await fireEvent.mouseOver(listEl);
    });

    expect(props.onMouseOver).toHaveBeenCalled();
  });

  it('responds to click event', async () => {
    const props = {
      name: 'category',
      searchTerm: 'term',
      value: 'This is a term',
      index: 0,
      onMouseOver: jest.fn(),
      onClick: jest.fn(),
    };

    const { getAllByRole } = renderWithClient(
      <InputWithDropdown inputValue={''} cursorMax={4} isOpen={true}>
        <DropdownList>
          <DropdownListItem {...props} />
        </DropdownList>
      </InputWithDropdown>,
    );

    const listEl = getAllByRole('listitem').filter(el =>
      el.textContent.includes(props.value),
    )[0];
    await act(async () => {
      await userEvent.click(listEl);
    });

    expect(props.onClick).toHaveBeenCalled();
  });
});

describe('Highlight', () => {
  test('renders properly with provided text and highlights the tags', () => {
    const props = {
      tags: ['underlined term'],
      children: 'This is a underlined term',
    };

    const { getByText } = render(<Highlight {...props} />);

    const body = document.querySelector('body');

    expect(body.textContent.toLowerCase()).toBe(props.children.toLowerCase());
    expect(getByText('underlined term')).toHaveClass('underlined-search-term');
  });
});

describe('DropdownInput', () => {
  const mockOnChange = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockGetInputValue = jest.fn();

  const setup = (props = {}) => {
    const utils = renderWithClient(
      <DropdownInput
        id='test-dropdown-input'
        ariaLabel='Test Dropdown Input'
        type='text'
        getInputValue={mockGetInputValue}
        onChange={mockOnChange}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        {...props}
      />,
      {
        wrapper: ({ children }) => (
          <InputWithDropdown>{children}</InputWithDropdown>
        ),
      },
    );
    const input = utils.getByRole('textbox');
    return {
      input,
      ...utils,
    };
  };

  it('renders with correct props', () => {
    const { input, getByLabelText } = setup();
    const label = getByLabelText('Test Dropdown Input');
    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'test-dropdown-input');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('calls onChange prop when input changes', () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(mockOnChange).toHaveBeenCalledWith('Test');
  });

  test('submits the form with correct values when enter key is pressed', async () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.submit(input);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test', -1);
  });

  it('renders a submit button when renderSubmitButton prop is provided', () => {
    const renderSubmitButton = jest
      .fn()
      .mockReturnValue(<button type='submit'>Submit</button>);
    const { getByText } = setup({ renderSubmitButton });
    fireEvent.submit(getByText('Submit'));
    expect(renderSubmitButton).toHaveBeenCalled();
  });

  it('calls getInputValue when onKeyDown event is triggered', () => {
    const { input } = setup();
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(mockGetInputValue).toHaveBeenCalledWith(0);
  });

  it('calls onClose prop when close button is clicked', () => {
    const renderSubmitButton = jest
      .fn()
      .mockReturnValue(<button type='submit'>Submit</button>);
    const { getByRole } = setup({ onClose: mockOnClose, renderSubmitButton });
    fireEvent.click(getByRole('button', { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('is disabled when isDisabled prop is true', () => {
    const { input } = setup({ isDisabled: true });
    expect(input).toBeDisabled();
  });

  it('is loading when isLoading prop is true', () => {
    const { getByText } = setup({ isLoading: true });
    const loadingIndicator = getByText(/loading/i);
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('renders with correct placeholder text', () => {
    const placeholderText = 'Your placeholder text';
    const { getByPlaceholderText } = setup({ placeholder: placeholderText });
    const input = getByPlaceholderText(placeholderText);
    expect(input).toBeInTheDocument();
  });
});
