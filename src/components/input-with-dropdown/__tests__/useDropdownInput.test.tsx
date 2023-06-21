import { act, renderHook } from '@testing-library/react';
import { useDropdownInput } from '../hooks/useDropdownInput'; // replace with your actual file name

describe('useDropdownInput', () => {
  it('should update isOpen and inputValue on input change', () => {
    const { result } = renderHook(() =>
      useDropdownInput({
        cursor: 0,
        cursorMax: 0,
        inputValue: 'test',
        isOpen: false,
      }),
    );

    act(() => {
      result.current.getInputProps({ onChange: () => {} }).onChange({
        currentTarget: { value: 'new-test' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toBe('new-test');
    expect(result.current.isOpen).toBeTruthy();
  });

  it('should update cursor on input keydown (arrow down/arrowup)', () => {
    const { result } = renderHook(() =>
      useDropdownInput({
        cursor: 0,
        cursorMax: 2,
        inputValue: '',
        isOpen: false,
      }),
    );

    // ArrowDown key press should set cursor to 1.
    act(() => {
      result.current.getInputProps({ onKeyDown: () => {} }).onKeyDown({
        key: 'ArrowDown',
        currentTarget: {} as HTMLInputElement,
      } as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.cursor).toBe(1);

    // ArrowUp key press should set cursor to 0.
    act(() => {
      result.current.getInputProps({ onKeyDown: () => {} }).onKeyDown({
        key: 'ArrowUp',
        currentTarget: {} as HTMLInputElement,
      } as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.cursor).toBe(0);
  });

  it('should update isOpen on listItem click', () => {
    const { result } = renderHook(() =>
      useDropdownInput({
        cursor: 0,
        cursorMax: 0,
        inputValue: 'test',
        isOpen: true,
      }),
    );
    const event = { stopPropagation: () => {} } as React.MouseEvent<
      HTMLLIElement,
      MouseEvent
    >;

    act(() => {
      result.current
        .getListItemProps({ index: 0, isSelected: true })
        .onClick(event);
    });

    expect(result.current.isOpen).toBeFalsy();
  });

  it('should update cursor on listItem mouseOver', () => {
    const { result } = renderHook(() =>
      useDropdownInput({
        cursor: 0,
        cursorMax: 5,
        inputValue: '',
        isOpen: false,
      }),
    );

    const props = result.current.getListItemProps({
      index: 4,
      isSelected: false,
      onClick: jest.fn(),
      onMouseOver: jest.fn(),
    });

    const event = { stopPropagation: () => {} } as React.MouseEvent<
      HTMLLIElement,
      MouseEvent
    >;
    act(() => {
      props.onMouseOver(event);
    });

    expect(result.current.cursor).toBe(4);
  });
});
