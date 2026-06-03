/**
 * A single item managed by a selectable / orderable popover.
 *
 * `groupKey` is optional and, when provided, the shared list component will
 * bucket items under a labelled section heading.
 */
export interface PopoverItem {
  /** Stable, unique identifier used for state tracking and localStorage persistence. */
  id: string;
  /** Human-readable label rendered in the list. */
  title: string;
  /** Optional group bucket.  Items with the same key are rendered together. */
  groupKey?: string;
}

/**
 * A resolved group produced by `groupItems`.
 */
export interface PopoverItemGroup {
  groupKey: string;
  items: PopoverItem[];
}
