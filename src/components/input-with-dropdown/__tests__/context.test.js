import * as React from 'react';
import { act, fireEvent, renderHook } from '@testing-library/react';
import {
  useDropdownContext,
  InputWithDropdown,
} from 'src/components/input-with-dropdown/';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import { Input } from 'nde-design-system';

describe('useDropdownContext', () => {
  test('should toggle isOpen to true when setIsOpen is called with true', () => {
    const { result } = renderHook(() => useDropdownContext(), {
      wrapper: ({ children }) => (
        <InputWithDropdown>{children}</InputWithDropdown>
      ),
    });
    // Check initial state
    expect(result.current.isOpen).toBe(false);

    // Call the function and check if state changes
    act(() => {
      result.current.setIsOpen(true);
    });

    expect(result.current.isOpen).toBe(true);
  });
  it('should update the input value', () => {
    const { result } = renderHook(() => useDropdownContext(), {
      wrapper: ({ children }) => (
        <InputWithDropdown>{children}</InputWithDropdown>
      ),
    });
    // Call the function and check if state changes
    const value = 'This is my input value';
    act(() => {
      result.current.setInputValue(value);
    });
    // Check initial state
    expect(result.current.inputValue).toBe(value);
  });
  it('should update the cursor value', () => {
    let cursorValue = 0;
    const cursorMax = 5;
    const { result } = renderHook(() => useDropdownContext(), {
      wrapper: ({ children }) => (
        <InputWithDropdown cursor={cursorValue} cursorMax={cursorMax}>
          {children}
        </InputWithDropdown>
      ),
    });
    // Call the function and check if state changes
    expect(result.current.cursor).toBe(cursorValue);

    cursorValue++;

    act(() => {
      result.current.setCursor(cursorValue);
    });
    expect(result.current.cursor).toBe(1);

    // Expect the cursor to reset when it reaches the max value

    act(() => {
      result.current.setCursor(cursorMax);
    });
    expect(result.current.cursor).toBe(-1);

    // Expect the cursor to equal the max value when it is smaller than the min value (-1)
    act(() => {
      result.current.setCursor(-2);
    });
    expect(result.current.cursor).toBe(cursorMax - 1);
  });
});

describe('InputWithDropdown', () => {
  // Mock component to use the context
  function TestComponent() {
    const context = useDropdownContext();
    return (
      <div>
        <Input
          {...context.getInputProps({
            onChange: jest.fn(),
            onKeyDown: jest.fn(),
          })}
        />
        <div data-testid='cursor-position'>{context.cursor}</div>
      </div>
    );
  }

  it('should render children', () => {
    const { getByText } = renderWithClient(
      <InputWithDropdown inputValue='' cursorMax={0}>
        <div>Test child</div>
      </InputWithDropdown>,
    );

    expect(getByText('Test child')).toBeInTheDocument();
  });

  it('should close dropdown on outside click', () => {
    const { getByRole } = renderWithClient(<TestComponent />, {
      wrapper: ({ children }) => (
        <InputWithDropdown inputValue='' cursorMax={0} isOpen={true}>
          {children}
        </InputWithDropdown>
      ),
    });
    const input = getByRole('searchbox');

    // Simulate a click outside of the dropdown
    fireEvent.mouseDown(document);

    // The dropdown should now be closed
    expect(input.isOpen).toBeFalsy();
  });

  it('should update context value when inputValue prop changes', () => {
    const { rerender, getByRole } = renderWithClient(
      <InputWithDropdown inputValue='test1' cursorMax={0}>
        <TestComponent />
      </InputWithDropdown>,
    );

    expect(getByRole('searchbox').value).toBe('test1');

    rerender(
      <InputWithDropdown inputValue='test2' cursorMax={0}>
        <TestComponent />
      </InputWithDropdown>,
    );

    expect(getByRole('searchbox').value).toBe('test2');
  });

  test('useDropdownContext throws error when not wrapped with <InputWithDropdown/>', () => {
    const consoleError = console.error;
    console.error = jest.fn(); // to ignore React error boundary log

    expect(() => renderWithClient(<TestComponent />)).toThrow(
      'useDropdownContext must be wrapped with <InputWithDropdown/>',
    );

    console.error = consoleError;
  });
});
