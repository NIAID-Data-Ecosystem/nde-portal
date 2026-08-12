import { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useViewMode } from '../useViewMode';
import { getViewModeStorageKey } from '../../config/view-mode';

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('useViewMode', () => {
  describe('defaults', () => {
    it.each(['d', 'ct'] as const)('defaults to card for the %s tab', tabId => {
      const { result } = renderHook(() => useViewMode(tabId));
      expect(result.current[0]).toBe('card');
    });

    it('defaults to table for the dc tab', () => {
      const { result } = renderHook(() => useViewMode('dc'));
      expect(result.current[0]).toBe('table');
    });
  });

  describe('reading persisted preferences', () => {
    it('prefers a valid stored value over the default', () => {
      localStorage.setItem(getViewModeStorageKey('d'), 'table');
      const { result } = renderHook(() => useViewMode('d'));
      expect(result.current[0]).toBe('table');
    });

    it('falls back to the default when the stored value is not a view mode', () => {
      localStorage.setItem(getViewModeStorageKey('dc'), 'grid');
      const { result } = renderHook(() => useViewMode('dc'));
      expect(result.current[0]).toBe('table');
    });
  });

  describe('updating the preference', () => {
    it('updates the returned value and writes it to the tab key', () => {
      const { result } = renderHook(() => useViewMode('ct'));

      act(() => result.current[1]('table'));

      expect(result.current[0]).toBe('table');
      expect(localStorage.getItem(getViewModeStorageKey('ct'))).toBe('table');
    });

    it('keeps preferences for different tabs independent', () => {
      const datasets = renderHook(() => useViewMode('d'));
      const tools = renderHook(() => useViewMode('ct'));

      act(() => datasets.result.current[1]('table'));

      expect(datasets.result.current[0]).toBe('table');
      expect(tools.result.current[0]).toBe('card');
      expect(localStorage.getItem(getViewModeStorageKey('ct'))).toBeNull();
    });
  });
});
