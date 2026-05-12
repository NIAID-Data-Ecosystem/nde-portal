import { act } from 'react';
import { renderHook } from '@testing-library/react';
import { usePopoverSearch } from '../usePopoverSearch';
import { PopoverItem } from '../../types';

const ITEMS: PopoverItem[] = [
  { id: '1', title: 'Alpha' },
  { id: '2', title: 'Beta' },
  { id: '3', title: 'Gamma' },
  { id: '4', title: 'Alpha Beta' },
];

describe('usePopoverSearch', () => {
  describe('initial state', () => {
    it('starts with an empty search term', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      expect(result.current.searchTerm).toBe('');
    });

    it('is not searching initially', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      expect(result.current.isSearching).toBe(false);
    });

    it('returns all items unfiltered when search term is empty', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      expect(result.current.filteredItems).toEqual(ITEMS);
    });

    it('returns all items as a single group when items have no groupKey', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      expect(result.current.filteredGroups).toHaveLength(1);
      expect(result.current.filteredGroups[0].groupKey).toBe('');
      expect(result.current.filteredGroups[0].items).toEqual(ITEMS);
    });
  });

  describe('setSearchTerm', () => {
    it('updates the search term', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('Alpha'));
      expect(result.current.searchTerm).toBe('Alpha');
    });

    it('sets isSearching to true when term is non-empty', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('Alpha'));
      expect(result.current.isSearching).toBe(true);
    });

    it('sets isSearching to false when term is only whitespace', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('   '));
      expect(result.current.isSearching).toBe(false);
    });

    it('sets isSearching to false when term is cleared', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('Alpha'));
      act(() => result.current.setSearchTerm(''));
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('filteredItems', () => {
    it('filters items by an exact-match search term', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('Gamma'));
      expect(result.current.filteredItems).toEqual([
        { id: '3', title: 'Gamma' },
      ]);
    });

    it('filters items case-insensitively', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('alpha'));
      expect(result.current.filteredItems).toEqual([
        { id: '1', title: 'Alpha' },
        { id: '4', title: 'Alpha Beta' },
      ]);
    });

    it('matches items whose title contains the search term as a substring', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('eta'));
      // "Beta" and "Alpha Beta" both contain "eta"
      expect(result.current.filteredItems).toEqual([
        { id: '2', title: 'Beta' },
        { id: '4', title: 'Alpha Beta' },
      ]);
    });

    it('returns an empty array when no items match', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('zzz'));
      expect(result.current.filteredItems).toEqual([]);
    });

    it('ignores leading and trailing whitespace in the search term', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('  Beta  '));
      expect(result.current.filteredItems).toEqual([
        { id: '2', title: 'Beta' },
        { id: '4', title: 'Alpha Beta' },
      ]);
    });

    it('returns all items when the search term is cleared', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: ITEMS }));
      act(() => result.current.setSearchTerm('Alpha'));
      act(() => result.current.setSearchTerm(''));
      expect(result.current.filteredItems).toEqual(ITEMS);
    });
  });

  describe('filteredGroups', () => {
    const GROUPED_ITEMS: PopoverItem[] = [
      { id: '1', title: 'Alpha', groupKey: 'Greek' },
      { id: '2', title: 'Beta', groupKey: 'Greek' },
      { id: '3', title: 'One', groupKey: 'Numbers' },
      { id: '4', title: 'Two', groupKey: 'Numbers' },
    ];

    it('groups items by groupKey when not searching', () => {
      const { result } = renderHook(() =>
        usePopoverSearch({ items: GROUPED_ITEMS }),
      );
      expect(result.current.filteredGroups).toHaveLength(2);
      expect(result.current.filteredGroups[0].groupKey).toBe('Greek');
      expect(result.current.filteredGroups[1].groupKey).toBe('Numbers');
    });

    it('preserves insertion order of groups', () => {
      const { result } = renderHook(() =>
        usePopoverSearch({ items: GROUPED_ITEMS }),
      );
      const keys = result.current.filteredGroups.map(g => g.groupKey);
      expect(keys).toEqual(['Greek', 'Numbers']);
    });

    it('filters groups by search term and omits empty groups', () => {
      const { result } = renderHook(() =>
        usePopoverSearch({ items: GROUPED_ITEMS }),
      );
      act(() => result.current.setSearchTerm('Alpha'));
      expect(result.current.filteredGroups).toHaveLength(1);
      expect(result.current.filteredGroups[0].groupKey).toBe('Greek');
      expect(result.current.filteredGroups[0].items).toEqual([
        { id: '1', title: 'Alpha', groupKey: 'Greek' },
      ]);
    });

    it('returns an empty groups array when no items match the search', () => {
      const { result } = renderHook(() =>
        usePopoverSearch({ items: GROUPED_ITEMS }),
      );
      act(() => result.current.setSearchTerm('zzz'));
      expect(result.current.filteredGroups).toEqual([]);
    });

    it('handles a mix of items with and without groupKey', () => {
      const mixed: PopoverItem[] = [
        { id: '1', title: 'Alpha', groupKey: 'Greek' },
        { id: '2', title: 'One' }, // no groupKey => falls into '' bucket
      ];
      const { result } = renderHook(() => usePopoverSearch({ items: mixed }));
      const keys = result.current.filteredGroups.map(g => g.groupKey);
      expect(keys).toContain('Greek');
      expect(keys).toContain('');
    });
  });

  describe('edge cases', () => {
    it('handles an empty items array', () => {
      const { result } = renderHook(() => usePopoverSearch({ items: [] }));
      expect(result.current.filteredItems).toEqual([]);
      expect(result.current.filteredGroups).toEqual([]);
    });

    it('reacts to an updated items prop', () => {
      const initial: PopoverItem[] = [{ id: '1', title: 'Alpha' }];
      const updated: PopoverItem[] = [
        { id: '1', title: 'Alpha' },
        { id: '2', title: 'Beta' },
      ];

      const { result, rerender } = renderHook(
        ({ items }) => usePopoverSearch({ items }),
        { initialProps: { items: initial } },
      );

      expect(result.current.filteredItems).toHaveLength(1);
      rerender({ items: updated });
      expect(result.current.filteredItems).toHaveLength(2);
    });

    it('re-applies an active search term after items are updated', () => {
      const initial: PopoverItem[] = [{ id: '1', title: 'Alpha' }];
      const updated: PopoverItem[] = [
        { id: '1', title: 'Alpha' },
        { id: '2', title: 'Alpha Two' },
      ];

      const { result, rerender } = renderHook(
        ({ items }) => usePopoverSearch({ items }),
        { initialProps: { items: initial } },
      );

      act(() => result.current.setSearchTerm('Alpha'));
      expect(result.current.filteredItems).toHaveLength(1);

      rerender({ items: updated });
      expect(result.current.filteredItems).toHaveLength(2);
    });
  });
});
