import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { CheckboxList, CheckboxListProps } from './index';

interface TestOption {
  name: string;
  value: string;
}

const options: TestOption[] = [
  { name: 'Option 1', value: 'option1' },
  { name: 'Option 2', value: 'option2' },
  { name: 'Option 3', value: 'option3' },
];

const renderComponent = (
  props: Partial<CheckboxListProps<TestOption>> = {},
) => {
  const defaultProps: CheckboxListProps<TestOption> = {
    label: 'Test Label',
    options,
    handleChange: jest.fn(),
    selectedOptions: [],
    ...props,
  };

  return render(<CheckboxList {...defaultProps} />);
};

describe('CheckboxList', () => {
  test('renders the label', () => {
    renderComponent();
    const button = screen.getByRole('button', { name: 'Test Label' });
    expect(button).toBeInTheDocument();
  });

  test('renders the options', () => {
    const { getByText } = renderComponent();
    options.forEach(option => {
      expect(getByText(option.name)).toBeInTheDocument();
    });
  });

  test('calls handleChange when an option is selected', () => {
    const handleChange = jest.fn();
    const { getByLabelText } = renderComponent({ handleChange });

    fireEvent.click(getByLabelText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith([
      { name: 'Option 1', value: 'option1' },
    ]);
  });

  test('calls handleChange when an option is deselected', () => {
    const handleChange = jest.fn();
    const { getByLabelText } = renderComponent({
      handleChange,
      selectedOptions: [{ name: 'Option 1', value: 'option1' }],
    });

    fireEvent.click(getByLabelText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  test('selects all options when "Select all" is clicked', () => {
    const handleChange = jest.fn();
    const { getByText } = renderComponent({
      handleChange,
      showSelectAll: true,
    });

    fireEvent.click(getByText('Select all'));
    expect(handleChange).toHaveBeenCalledWith(options);
  });

  test('clears all options when "Clear all" is clicked', () => {
    const handleChange = jest.fn();
    const { getByText } = renderComponent({
      handleChange,
      showSelectAll: true,
      selectedOptions: options,
    });

    fireEvent.click(getByText('Clear all'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
