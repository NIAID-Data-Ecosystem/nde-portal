import { renderHook, act } from '@testing-library/react';
import { useTableSort } from '../hooks/useTableSort'; // Update the import path as needed
import { createWrapper } from 'src/__tests__/mocks/utils';

describe('useTableSort', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => useTableSort({ data: [] }), {
      wrapper: createWrapper(),
    });

    expect(result.current[0].data).toEqual([]);
    expect(result.current[0].sortBy).toEqual('ASC');
    expect(result.current[0].orderBy).toBeNull();
  });

  test('sorts data ascending by default', () => {
    const testData = [
      { id: 2, value: 'banana' },
      { id: 1, value: 'apple' },
      { id: 3, value: 'carrot' },
    ];

    const { result } = renderHook(() =>
      useTableSort({
        data: testData,
        orderBy: 'value',
      }),
    );

    expect(result.current[0].data).toEqual([
      { id: 1, value: 'apple' },
      { id: 2, value: 'banana' },
      { id: 3, value: 'carrot' },
    ]);
    expect(result.current[0].sortBy).toEqual('ASC');
    expect(result.current[0].orderBy).toEqual('value');
  });

  test('toggles sort direction', () => {
    const testData = [
      { id: 1, value: 'apple' },
      { id: 2, value: 'banana' },
    ];

    const { result } = renderHook(() =>
      useTableSort({
        data: testData,
        orderBy: 'value',
      }),
    );

    // Initial sort should be ascending
    expect(result.current[0].sortBy).toEqual('ASC');

    // Toggle sort direction
    act(() => {
      result.current[1]('value');
    });

    // After toggling, sort should be descending
    expect(result.current[0].sortBy).toEqual('DESC');
  });
});
