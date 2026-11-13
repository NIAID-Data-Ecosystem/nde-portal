import '@testing-library/jest-dom/extend-expect';

import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen } from 'src/__tests__/utils/render';

import { CheckboxMenu, CheckboxMenuProps } from './index';

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
  props: Partial<CheckboxMenuProps<TestOption>> = {},
) => {
  const defaultProps: CheckboxMenuProps<TestOption> = {
    id: 'test-label',
    label: 'Test Label',
    options,
    handleChange: jest.fn(),
    selectedOptions: [],
    ...props,
  };

  return render(<CheckboxMenu {...defaultProps} />);
};

// The menu content only mounts once opened. zag drops a click dispatched before
// its machine has started, hence the tick before opening.
const openMenu = async () => {
  await act(async () => {});
  await userEvent.click(screen.getByRole('button', { name: 'Test Label' }));
};

describe('CheckboxMenu', () => {
  test('renders the label', () => {
    renderComponent();
    const button = screen.getByRole('button', { name: 'Test Label' });
    expect(button).toBeInTheDocument();
  });

  test('renders the options', async () => {
    renderComponent();
    await openMenu();
    for (const option of options) {
      expect(await screen.findByText(option.name)).toBeInTheDocument();
    }
  });

  test('calls handleChange when an option is selected', async () => {
    const handleChange = jest.fn();
    renderComponent({ handleChange });
    await openMenu();

    await userEvent.click(await screen.findByLabelText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith([
      { name: 'Option 1', value: 'option1' },
    ]);
  });

  test('calls handleChange when an option is deselected', async () => {
    const handleChange = jest.fn();
    renderComponent({
      handleChange,
      selectedOptions: [{ name: 'Option 1', value: 'option1' }],
    });
    await openMenu();

    await userEvent.click(await screen.findByLabelText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  test('selects all options when "Select all" is clicked', async () => {
    const handleChange = jest.fn();
    renderComponent({
      handleChange,
      showSelectAll: true,
    });
    await openMenu();

    await userEvent.click(await screen.findByText('Select all'));
    expect(handleChange).toHaveBeenCalledWith(options);
  });

  test('clears all options when "Clear all" is clicked', async () => {
    const handleChange = jest.fn();
    renderComponent({
      handleChange,
      showSelectAll: true,
      selectedOptions: options,
    });
    await openMenu();

    await userEvent.click(await screen.findByText('Clear all'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });
});
