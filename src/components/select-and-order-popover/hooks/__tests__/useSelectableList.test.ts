import { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useSelectableList } from '../useSelectableList';
import { PopoverItem } from '../../types';

const ITEMS: PopoverItem[] = [
  { id: 'a', title: 'Alpha' },
  { id: 'b', title: 'Beta' },
  { id: 'c', title: 'Gamma' },
  { id: 'd', title: 'Delta' },
];

const ALL_IDS = ITEMS.map(i => i.id);

const storageKey = 'test-visible';
const orderKey = 'test-order';

const renderBasic = (overrides = {}) =>
  renderHook(() =>
    useSelectableList({
      items: ITEMS,
      storageKeyVisible: null,
      ...overrides,
    }),
  );

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('useSelectableList', () => {
  describe('initial state', () => {
    it('is ready after hydration', () => {
      const { result } = renderBasic();
      expect(result.current.isReady).toBe(true);
    });

    it('selects all items by default when no defaultVisibleIds are provided', () => {
      const { result } = renderBasic();
      expect(result.current.selectedIds).toEqual(
        expect.arrayContaining(ALL_IDS),
      );
      expect(result.current.selectedIds).toHaveLength(ALL_IDS.length);
    });

    it('respects defaultVisibleIds', () => {
      const { result } = renderBasic({ defaultVisibleIds: ['a', 'b'] });
      expect(result.current.selectedIds).toEqual(
        expect.arrayContaining(['a', 'b']),
      );
      expect(result.current.selectedIds).toHaveLength(2);
    });

    it('does not expose order when enableOrdering is false', () => {
      const { result } = renderBasic();
      expect(result.current.order).toBeUndefined();
    });

    it('exposes order when enableOrdering is true', () => {
      const { result } = renderBasic({
        enableOrdering: true,
        storageKeyOrder: null,
      });
      expect(result.current.order).toEqual(ALL_IDS);
    });
  });

  describe('requiredIds', () => {
    it('always includes required IDs even when not in defaultVisibleIds', () => {
      const { result } = renderBasic({
        requiredIds: ['c'],
        defaultVisibleIds: ['a', 'b'],
      });
      expect(result.current.selectedIds).toContain('c');
    });

    it('cannot toggle off a required ID', () => {
      const { result } = renderBasic({ requiredIds: ['a'] });
      act(() => result.current.toggle('a', false));
      expect(result.current.selectedIds).toContain('a');
    });

    it('pins required IDs to the front of the order', () => {
      const { result } = renderBasic({
        requiredIds: ['c'],
        enableOrdering: true,
        storageKeyOrder: null,
      });
      expect(result.current.order![0]).toBe('c');
    });
  });

  describe('toggle', () => {
    it('adds an ID when toggled on', () => {
      const { result } = renderBasic({ defaultVisibleIds: ['a'] });
      act(() => result.current.toggle('b', true));
      expect(result.current.selectedIds).toContain('b');
    });

    it('removes an ID when toggled off', () => {
      const { result } = renderBasic();
      act(() => result.current.toggle('a', false));
      expect(result.current.selectedIds).not.toContain('a');
    });

    it('duplicates an ID when toggled on while already selected', () => {
      // toggle(id, true) appends unconditionally => callers are responsible for
      // only calling it when the item is not already selected (e.g., via a
      // checkbox onChange which only fires when the value changes).
      const { result } = renderBasic({ defaultVisibleIds: ['a'] });
      act(() => result.current.toggle('a', true));
      const count = result.current.selectedIds.filter(id => id === 'a').length;
      expect(count).toBe(2);
    });
  });

  describe('setAll', () => {
    it('replaces the entire selected set', () => {
      const { result } = renderBasic();
      act(() => result.current.setAll(['b', 'c']));
      expect(result.current.selectedIds).toEqual(
        expect.arrayContaining(['b', 'c']),
      );
      expect(result.current.selectedIds).toHaveLength(2);
    });

    it('re-pins required IDs when setAll is called without them', () => {
      const { result } = renderBasic({ requiredIds: ['a'] });
      act(() => result.current.setAll(['b']));
      expect(result.current.selectedIds).toContain('a');
    });
  });

  describe('toggleAll', () => {
    it('selects all items when not all are selected', () => {
      const { result } = renderBasic({ defaultVisibleIds: ['a'] });
      act(() => result.current.toggleAll());
      expect(result.current.selectedIds).toEqual(
        expect.arrayContaining(ALL_IDS),
      );
      expect(result.current.selectedIds).toHaveLength(ALL_IDS.length);
    });

    it('deselects all non-required items when all are selected', () => {
      const { result } = renderBasic({ requiredIds: ['a'] });
      act(() => result.current.toggleAll()); // all => clear
      expect(result.current.selectedIds).toEqual(['a']);
    });

    it('keeps required IDs selected after a clear-all', () => {
      const { result } = renderBasic({ requiredIds: ['a', 'b'] });
      act(() => result.current.toggleAll()); // all => clear
      expect(result.current.selectedIds).toContain('a');
      expect(result.current.selectedIds).toContain('b');
    });
  });

  describe('localStorage persistence', () => {
    it('persists selectedIds to localStorage on toggle', () => {
      const { result } = renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: storageKey,
          defaultVisibleIds: ['a'],
        }),
      );
      act(() => result.current.toggle('b', true));
      const stored = JSON.parse(localStorage.getItem(storageKey)!);
      expect(stored).toContain('b');
    });

    it('hydrates selectedIds from localStorage on mount', () => {
      localStorage.setItem(storageKey, JSON.stringify(['c', 'd']));
      const { result } = renderHook(() =>
        useSelectableList({ items: ITEMS, storageKeyVisible: storageKey }),
      );
      expect(result.current.selectedIds).toEqual(
        expect.arrayContaining(['c', 'd']),
      );
      expect(result.current.selectedIds).toHaveLength(2);
    });

    it('falls back to defaults when stored IDs are all invalid', () => {
      localStorage.setItem(storageKey, JSON.stringify(['x', 'y']));
      const { result } = renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: storageKey,
          defaultVisibleIds: ['a'],
        }),
      );
      expect(result.current.selectedIds).toEqual(expect.arrayContaining(['a']));
    });

    it('filters out stale IDs that are no longer in items', () => {
      localStorage.setItem(storageKey, JSON.stringify(['a', 'stale-id']));
      const { result } = renderHook(() =>
        useSelectableList({ items: ITEMS, storageKeyVisible: storageKey }),
      );
      expect(result.current.selectedIds).not.toContain('stale-id');
    });

    it('does not write to localStorage when storageKeyVisible is null', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem');
      const { result } = renderBasic();
      act(() => result.current.toggle('a', false));
      expect(spy).not.toHaveBeenCalled();
    });

    it('persists order to localStorage on moveUp', () => {
      const { result } = renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: null,
          storageKeyOrder: orderKey,
          enableOrdering: true,
        }),
      );
      act(() => result.current.moveUp!('b'));
      const stored = JSON.parse(localStorage.getItem(orderKey)!);
      expect(stored.indexOf('b')).toBeLessThan(stored.indexOf('a'));
    });
  });

  describe('moveUp / moveDown', () => {
    const renderOrdered = (overrides = {}) =>
      renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: null,
          storageKeyOrder: null,
          enableOrdering: true,
          ...overrides,
        }),
      );

    it('moveUp shifts an item one position earlier', () => {
      const { result } = renderOrdered();
      act(() => result.current.moveUp!('b'));
      expect(result.current.order!.indexOf('b')).toBeLessThan(
        result.current.order!.indexOf('a'),
      );
    });

    it('moveDown shifts an item one position later', () => {
      const { result } = renderOrdered();
      act(() => result.current.moveDown!('a'));
      expect(result.current.order!.indexOf('a')).toBeGreaterThan(
        result.current.order!.indexOf('b'),
      );
    });

    it('moveUp does nothing when the item is already first among movable items', () => {
      const { result } = renderOrdered();
      const before = [...result.current.order!];
      act(() => result.current.moveUp!('a'));
      expect(result.current.order).toEqual(before);
    });

    it('moveDown does nothing when the item is already last', () => {
      const { result } = renderOrdered();
      const before = [...result.current.order!];
      act(() => result.current.moveDown!('d'));
      expect(result.current.order).toEqual(before);
    });

    it('moveUp cannot move an item above a required ID', () => {
      const { result } = renderOrdered({ requiredIds: ['a'] });
      // 'b' is the first movable item => attempting to move it up should be a no-op
      const before = [...result.current.order!];
      act(() => result.current.moveUp!('b'));
      expect(result.current.order).toEqual(before);
    });

    it('required IDs remain at the top after moveDown on the item below them', () => {
      const { result } = renderOrdered({ requiredIds: ['a'] });
      act(() => result.current.moveDown!('b'));
      expect(result.current.order![0]).toBe('a');
    });

    it('does not expose moveUp / moveDown when enableOrdering is false', () => {
      const { result } = renderBasic();
      expect(result.current.moveUp).toBeUndefined();
      expect(result.current.moveDown).toBeUndefined();
    });
  });

  describe('handleDragEnd', () => {
    const renderOrdered = () =>
      renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: null,
          storageKeyOrder: null,
          enableOrdering: true,
        }),
      );

    it('reorders items when dragged to a new position', () => {
      const { result } = renderOrdered();
      act(() =>
        result.current.handleDragEnd!({
          active: { id: 'a' },
          over: { id: 'c' },
        }),
      );
      expect(result.current.order!.indexOf('a')).toBeGreaterThan(
        result.current.order!.indexOf('b'),
      );
    });

    it('does nothing when dropped on the same item', () => {
      const { result } = renderOrdered();
      const before = [...result.current.order!];
      act(() =>
        result.current.handleDragEnd!({
          active: { id: 'a' },
          over: { id: 'a' },
        }),
      );
      expect(result.current.order).toEqual(before);
    });

    it('does nothing when over is null', () => {
      const { result } = renderOrdered();
      const before = [...result.current.order!];
      act(() =>
        result.current.handleDragEnd!({ active: { id: 'a' }, over: null }),
      );
      expect(result.current.order).toEqual(before);
    });

    it('re-pins required IDs after a drag', () => {
      const { result } = renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: null,
          storageKeyOrder: null,
          enableOrdering: true,
          requiredIds: ['a'],
        }),
      );
      act(() =>
        result.current.handleDragEnd!({
          active: { id: 'b' },
          over: { id: 'd' },
        }),
      );
      expect(result.current.order![0]).toBe('a');
    });

    it('does not expose handleDragEnd when enableOrdering is false', () => {
      const { result } = renderBasic();
      expect(result.current.handleDragEnd).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles an empty items array without errors', () => {
      const { result } = renderHook(() =>
        useSelectableList({ items: [], storageKeyVisible: null }),
      );
      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.isReady).toBe(true);
    });

    it('handles malformed localStorage JSON gracefully', () => {
      localStorage.setItem(storageKey, 'not-valid-json');
      const { result } = renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: storageKey,
          defaultVisibleIds: ['a'],
        }),
      );
      expect(result.current.selectedIds).toEqual(expect.arrayContaining(['a']));
    });

    it('handles localStorage containing a non-array value gracefully', () => {
      localStorage.setItem(storageKey, JSON.stringify({ id: 'a' }));
      const { result } = renderHook(() =>
        useSelectableList({
          items: ITEMS,
          storageKeyVisible: storageKey,
          defaultVisibleIds: ['a'],
        }),
      );
      expect(result.current.selectedIds).toEqual(expect.arrayContaining(['a']));
    });
  });
});
