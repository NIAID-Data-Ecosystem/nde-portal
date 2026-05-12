import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { PopoverItem } from '../types';

export interface UseSelectableListOptions {
  /** Full list of items the popover manages. */
  items: PopoverItem[];

  /**
   * IDs that must always remain selected and, when ordering is enabled,
   * pinned to the top of the list.  The hook guarantees these are never
   * unchecked or moved below any non-required item.
   */
  requiredIds?: string[];

  /**
   * When `true` the hook exposes `order`, `moveUp`, `moveDown`, and
   * `handleDragEnd` for drag-and-drop / keyboard reordering.
   */
  enableOrdering?: boolean;

  /**
   * localStorage key used to persist the selected-IDs array.
   * Pass `null` to opt out of persistence entirely.
   */
  storageKeyVisible: string | null;

  /**
   * localStorage key used to persist the column-order array.
   * Only meaningful when `enableOrdering` is `true`.
   * Pass `null` to opt out of persistence entirely.
   */
  storageKeyOrder?: string | null;

  /**
   * IDs that should be selected by default when no persisted value exists.
   * Defaults to all item IDs.
   */
  defaultVisibleIds?: string[];
}

export interface UseSelectableListResult {
  /** IDs of currently selected (visible) items. */
  selectedIds: string[];

  /**
   * Current display order of ALL item IDs (selected + unselected).
   * Only present when `enableOrdering` is `true`.
   */
  order?: string[];

  /** Whether the hook has finished reading from localStorage. */
  isReady: boolean;

  /** Toggle a single item on or off. */
  toggle: (id: string, checked: boolean) => void;

  /**
   * Replace the entire selected-IDs array at once.
   * Required IDs are automatically re-pinned.  Persists to localStorage.
   */
  setAll: (ids: string[]) => void;

  toggleAll: () => void;

  moveUp?: (id: string) => void;

  moveDown?: (id: string) => void;

  handleDragEnd?: (event: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) => void;
}

const readFromStorage = (key: string | null): string[] | null => {
  if (!key || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const writeToStorage = (key: string | null, value: string[]): void => {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private browsing.
  }
};

/**
 * Pin required IDs to the front of an ordered array,
 * preserving the relative order of the remaining items.
 */
const pinRequired = (ids: string[], requiredIds: string[]): string[] => [
  ...requiredIds.filter(id => ids.includes(id)),
  ...ids.filter(id => !requiredIds.includes(id)),
];

/**
 * Ensure required IDs are always present in the visible set.
 */
const ensureRequired = (
  ids: string[],
  requiredIds: string[],
  allIds: string[],
): string[] => [
  ...requiredIds.filter(id => allIds.includes(id) && !ids.includes(id)),
  ...ids,
];

export const useSelectableList = ({
  items,
  requiredIds = [],
  enableOrdering = false,
  storageKeyVisible,
  storageKeyOrder = null,
  defaultVisibleIds,
}: UseSelectableListOptions): UseSelectableListResult => {
  const allIds = useMemo(() => items.map(i => i.id), [items]);
  const defaults = useMemo(
    () => defaultVisibleIds ?? allIds,
    [defaultVisibleIds, allIds],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const storedVisible = readFromStorage(storageKeyVisible);
    let resolvedVisible: string[];

    if (storedVisible) {
      const valid = storedVisible.filter(id => allIds.includes(id));
      resolvedVisible =
        valid.length > 0 ? valid : defaults.filter(id => allIds.includes(id));
    } else {
      resolvedVisible = defaults.filter(id => allIds.includes(id));
    }

    setSelectedIds(ensureRequired(resolvedVisible, requiredIds, allIds));

    if (enableOrdering) {
      const storedOrder = readFromStorage(storageKeyOrder ?? null);
      let resolvedOrder: string[];

      if (storedOrder) {
        const valid = storedOrder.filter(id => allIds.includes(id));
        const missing = allIds.filter(id => !valid.includes(id));
        resolvedOrder = [...valid, ...missing];
      } else {
        resolvedOrder = allIds;
      }

      setOrder(pinRequired(resolvedOrder, requiredIds));
    }

    setIsReady(true);
    // Intentionally run only on mount (dependencies are stable on first render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds(prev => {
        const next = checked ? [...prev, id] : prev.filter(v => v !== id);
        const pinned = ensureRequired(next, requiredIds, allIds);
        writeToStorage(storageKeyVisible, pinned);
        return pinned;
      });
    },
    [requiredIds, allIds, storageKeyVisible],
  );

  const setAll = useCallback(
    (ids: string[]) => {
      const pinned = ensureRequired(ids, requiredIds, allIds);
      setSelectedIds(pinned);
      writeToStorage(storageKeyVisible, pinned);
    },
    [requiredIds, allIds, storageKeyVisible],
  );

  const toggleAll = useCallback(() => {
    setSelectedIds(prev => {
      const allSelected = prev.length === allIds.length;
      const next = allSelected
        ? requiredIds.filter(id => allIds.includes(id))
        : [...allIds];
      writeToStorage(storageKeyVisible, next);
      return next;
    });
  }, [allIds, requiredIds, storageKeyVisible]);

  // Ordering actions (only wired when enableOrdering is true)
  const moveUp = useCallback(
    (id: string) => {
      setOrder(prev => {
        const pinnedRequired = requiredIds.filter(i => prev.includes(i));
        const movable = prev.filter(i => !requiredIds.includes(i));
        const idx = movable.indexOf(id);
        if (idx <= 0) return prev;
        const next = [...pinnedRequired, ...arrayMove(movable, idx, idx - 1)];
        writeToStorage(storageKeyOrder ?? null, next);
        return next;
      });
    },
    [requiredIds, storageKeyOrder],
  );

  const moveDown = useCallback(
    (id: string) => {
      setOrder(prev => {
        const pinnedRequired = requiredIds.filter(i => prev.includes(i));
        const movable = prev.filter(i => !requiredIds.includes(i));
        const idx = movable.indexOf(id);
        if (idx === -1 || idx >= movable.length - 1) return prev;
        const next = [...pinnedRequired, ...arrayMove(movable, idx, idx + 1)];
        writeToStorage(storageKeyOrder ?? null, next);
        return next;
      });
    },
    [requiredIds, storageKeyOrder],
  );

  const handleDragEnd = useCallback(
    (event: {
      active: { id: string | number };
      over: { id: string | number } | null;
    }) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setOrder(prev => {
        const oldIdx = prev.indexOf(active.id as string);
        const newIdx = prev.indexOf(over.id as string);
        if (oldIdx === -1 || newIdx === -1) return prev;
        const next = pinRequired(arrayMove(prev, oldIdx, newIdx), requiredIds);
        writeToStorage(storageKeyOrder ?? null, next);
        return next;
      });
    },
    [requiredIds, storageKeyOrder],
  );

  // Expose ordering-specific fields only when the feature is enabled.
  const orderingProps = enableOrdering
    ? { order, moveUp, moveDown, handleDragEnd }
    : {};

  return {
    selectedIds,
    isReady,
    toggle,
    setAll,
    toggleAll,
    ...orderingProps,
  };
};
