import { renderHook } from '@testing-library/react';
import React from 'react';

import { TableSizeProvider, useTableSize } from '../hooks/useTableSize';

describe('useTableSize', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TableSizeProvider value='lg'>{children}</TableSizeProvider>
  );

  test('is undefined outside a table', () => {
    const { result } = renderHook(() => useTableSize());
    expect(result.current).toBeUndefined();
  });

  test('inherits the size of the parent table', () => {
    const { result } = renderHook(() => useTableSize(), { wrapper });
    expect(result.current).toEqual('lg');
  });

  test('prefers an explicit size over the inherited one', () => {
    const { result } = renderHook(() => useTableSize('sm'), { wrapper });
    expect(result.current).toEqual('sm');
  });
});
