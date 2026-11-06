import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { ColumnDef } from '../types';

type ColumnMeta = Pick<ColumnDef<any>, 'id' | 'hideable' | 'defaultVisible'>;

export interface UseColumnPreferencesOptions {
  /**
   * Unique per table. Preferences persist in localStorage under
   * `nde:table:<tableId>:v1`.
   */
  tableId: string;
  /** The table's columns. Keep the array stable (e.g. a module constant). */
  columns: ColumnMeta[];
  /**
   * Restored by "Clear All" so the table never has zero columns. Unlike
   * non-hideable columns these stay individually hideable and movable.
   * Defaults to the non-hideable columns. Keep the array stable.
   */
  fallbackIds?: string[];
  /**
   * Pre-v1 localStorage keys to migrate from on first read. Legacy values are
   * read until the user first changes a preference, which writes the v1 key
   * and removes them.
   */
  legacyKeys?: { visible?: string; order?: string };
}

export interface ColumnPreferences {
  /** Visible column ids, in display order. */
  visibleIds: string[];
  /** Every column id (visible or not), in display order. */
  order: string[];
  /** Whether the user pinned the first visible column. */
  pinned: boolean;
  requiredIds: string[];
  fallbackIds: string[];
  setVisible: (id: string, visible: boolean) => void;
  /** Show every column, or (when all are shown) only the fallback ones. */
  toggleAll: () => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  /** Move `activeId` to where `overId` is (drag and drop). */
  move: (activeId: string, overId: string) => void;
  setPinned: (pinned: boolean) => void;
  /** Back to the table's defaults: default columns, default order, unpinned. */
  reset: () => void;
}

interface StoredPreferences {
  visible?: unknown;
  order?: unknown;
  pinned?: unknown;
  /** Set on values synthesized from pre-v1 keys. */
  legacy?: boolean;
}

/* ------------------------------------------------------------------------- */
/* localStorage store                                                         */
/* ------------------------------------------------------------------------- */

const storageKey = (tableId: string) => `nde:table:${tableId}:v1`;

const listeners = new Map<string, Set<() => void>>();

const notify = (key: string) => listeners.get(key)?.forEach(fn => fn());

const subscribeTo = (key: string) => (callback: () => void) => {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(callback);
  // Other tabs.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === key) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.get(key)?.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
};

const getItem = (key?: string) => {
  if (!key) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const parseArray = (raw: string | null) => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The stored preferences as a string, so `useSyncExternalStore` can compare
 * snapshots by value. Falls back to a value synthesized from the legacy keys.
 */
const readRaw = (
  key: string,
  legacyKeys?: UseColumnPreferencesOptions['legacyKeys'],
): string | null => {
  const current = getItem(key);
  if (current) return current;
  const visible = parseArray(getItem(legacyKeys?.visible));
  const order = parseArray(getItem(legacyKeys?.order));
  if (!visible && !order) return null;
  return JSON.stringify({ legacy: true, visible, order });
};

const write = (
  key: string,
  value: { visible: string[]; order: string[]; pinned: boolean },
  legacyKeys?: UseColumnPreferencesOptions['legacyKeys'],
) => {
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: 1, ...value }));
    if (legacyKeys?.visible) window.localStorage.removeItem(legacyKeys.visible);
    if (legacyKeys?.order) window.localStorage.removeItem(legacyKeys.order);
  } catch {
    // Quota exceeded or storage disabled: keep the in-memory state only.
  }
  notify(key);
};

/* ------------------------------------------------------------------------- */
/* Reconciling stored values with the current columns                        */
/* ------------------------------------------------------------------------- */

interface Resolved {
  visibleIds: string[];
  order: string[];
  pinned: boolean;
}

const moveItem = (list: string[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Non-hideable columns always lead, in their own relative order. */
const pinRequired = (order: string[], requiredIds: string[]) => [
  ...order.filter(id => requiredIds.includes(id)),
  ...order.filter(id => !requiredIds.includes(id)),
];

/**
 * Inserts columns the stored order doesn't know (added since the user saved)
 * right after their nearest preceding column in the default order, instead of
 * dumping them at the end.
 */
const withNewColumns = (stored: string[], allIds: string[]) => {
  const order = [...stored];
  allIds.forEach((id, index) => {
    if (order.includes(id)) return;
    const previous = allIds
      .slice(0, index)
      .reverse()
      .find(prev => order.includes(prev));
    order.splice(previous ? order.indexOf(previous) + 1 : 0, 0, id);
  });
  return order;
};

const reconcile = (
  raw: string | null,
  columns: ColumnMeta[],
  requiredIds: string[],
): Resolved => {
  const allIds = columns.map(c => c.id);
  const defaults = columns
    .filter(c => c.defaultVisible !== false || c.hideable === false)
    .map(c => c.id);
  const fromDefaults = (): Resolved => ({
    visibleIds: pinRequired(defaults, requiredIds),
    order: pinRequired(allIds, requiredIds),
    pinned: false,
  });

  let stored: StoredPreferences | null = null;
  try {
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null;
  }
  if (!stored || typeof stored !== 'object') return fromDefaults();

  const valid = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((id): id is string => allIds.includes(id))
      : undefined;

  // A legacy value without an order means the old popover never tracked one:
  // treat every current column as known, so hidden columns stay hidden.
  const knownOrder = valid(stored.order) ?? (stored.legacy ? allIds : []);
  const order = pinRequired(withNewColumns(knownOrder, allIds), requiredIds);
  const newIds = allIds.filter(id => !knownOrder.includes(id));

  const storedVisible = valid(stored.visible);
  let visible = storedVisible
    ? [
        ...storedVisible,
        ...newIds.filter(
          id => columns.find(c => c.id === id)?.defaultVisible !== false,
        ),
      ]
    : defaults;
  if (visible.length === 0) visible = defaults;
  visible = [...visible, ...requiredIds.filter(id => !visible.includes(id))];

  return {
    visibleIds: order.filter(id => visible.includes(id)),
    order,
    pinned: stored.pinned === true,
  };
};

/* ------------------------------------------------------------------------- */

const getServerSnapshot = () => null;

/**
 * A table's column visibility, order and first-column pinning, persisted per
 * table in localStorage. Every component that calls it with the same
 * `tableId` shares one state, so the customizer and the table never drift.
 * The server snapshot is the defaults, so a static export hydrates without a
 * mismatch and then switches to the stored preferences.
 */
export const useColumnPreferences = ({
  tableId,
  columns,
  fallbackIds: fallbackOption,
  legacyKeys,
}: UseColumnPreferencesOptions): ColumnPreferences => {
  const key = storageKey(tableId);
  const subscribe = useMemo(() => subscribeTo(key), [key]);
  const legacyVisible = legacyKeys?.visible;
  const legacyOrder = legacyKeys?.order;
  const legacy = useMemo(
    () => ({ visible: legacyVisible, order: legacyOrder }),
    [legacyVisible, legacyOrder],
  );

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key, legacy),
    getServerSnapshot,
  );

  const requiredIds = useMemo(
    () => columns.filter(c => c.hideable === false).map(c => c.id),
    [columns],
  );
  const fallbackIds = useMemo(
    () => fallbackOption ?? requiredIds,
    [fallbackOption, requiredIds],
  );
  const state = useMemo(
    () => reconcile(raw, columns, requiredIds),
    [raw, columns, requiredIds],
  );

  // Every action re-reads storage, so two updates in one tick don't overwrite
  // each other with a stale render's state.
  const update = useCallback(
    (fn: (current: Resolved) => Partial<Resolved>) => {
      const current = reconcile(readRaw(key, legacy), columns, requiredIds);
      const next = { ...current, ...fn(current) };
      write(
        key,
        {
          visible: next.order.filter(id => next.visibleIds.includes(id)),
          order: next.order,
          pinned: next.pinned,
        },
        legacy,
      );
    },
    [key, legacy, columns, requiredIds],
  );

  const actions = useMemo(() => {
    const move = (id: string, delta: -1 | 1) =>
      update(({ order }) => {
        const movable = order.filter(i => !requiredIds.includes(i));
        const index = movable.indexOf(id);
        const target = index + delta;
        if (index === -1 || target < 0 || target >= movable.length) return {};
        return { order: [...requiredIds, ...moveItem(movable, index, target)] };
      });

    return {
      setVisible: (id: string, visible: boolean) =>
        update(({ visibleIds }) => ({
          visibleIds:
            visible || requiredIds.includes(id)
              ? [...visibleIds, id]
              : visibleIds.filter(v => v !== id),
        })),
      toggleAll: () =>
        update(({ visibleIds, order }) => ({
          visibleIds:
            visibleIds.length === order.length
              ? [...new Set([...requiredIds, ...fallbackIds])]
              : order,
        })),
      moveUp: (id: string) => move(id, -1),
      moveDown: (id: string) => move(id, 1),
      move: (activeId: string, overId: string) =>
        update(({ order }) => {
          const from = order.indexOf(activeId);
          const to = order.indexOf(overId);
          if (from === -1 || to === -1 || from === to) return {};
          return { order: pinRequired(moveItem(order, from, to), requiredIds) };
        }),
      setPinned: (pinned: boolean) => update(() => ({ pinned })),
      reset: () =>
        update(() => {
          const defaults = reconcile(null, columns, requiredIds);
          return defaults;
        }),
    };
  }, [update, requiredIds, fallbackIds, columns]);

  return useMemo(
    () => ({ ...state, requiredIds, fallbackIds, ...actions }),
    [state, requiredIds, fallbackIds, actions],
  );
};
