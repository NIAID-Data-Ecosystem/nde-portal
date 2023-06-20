import * as React from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  useDropdownContext,
  InputWithDropdown,
} from 'src/components/input-with-dropdown/';

describe('useDropdownContext hook', () => {
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
