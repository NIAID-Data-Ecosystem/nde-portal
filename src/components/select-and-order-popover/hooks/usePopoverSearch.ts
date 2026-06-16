import { useMemo, useState } from 'react';
import { PopoverItem, PopoverItemGroup } from '../types';

export interface UsePopoverSearchOptions {
  /** Full ordered list of items to filter. */
  items: PopoverItem[];
}

export interface UsePopoverSearchResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching: boolean;
  /** Items filtered by the current search term. */
  filteredItems: PopoverItem[];
  /** Items grouped by `groupKey` and filtered by the current search term. */
  filteredGroups: PopoverItemGroup[];
}

/**
 * Manages the search-input state for a popover list and derives both a flat
 * filtered list and a grouped filtered list.
 */
export const usePopoverSearch = ({
  items,
}: UsePopoverSearchOptions): UsePopoverSearchResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const isSearching = searchTerm.trim().length > 0;
  const normalised = searchTerm.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!isSearching) return items;
    return items.filter(item => item.title.toLowerCase().includes(normalised));
  }, [items, isSearching, normalised]);

  const filteredGroups = useMemo<PopoverItemGroup[]>(() => {
    const source = isSearching ? filteredItems : items;

    // Preserve insertion order of first occurrence of each groupKey.
    const groupMap = new Map<string, PopoverItem[]>();
    source.forEach(item => {
      const key = item.groupKey ?? '';
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(item);
    });

    return Array.from(groupMap.entries()).map(([groupKey, groupItems]) => ({
      groupKey,
      items: groupItems,
    }));
  }, [items, filteredItems, isSearching]);

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    filteredItems,
    filteredGroups,
  };
};
