import {
  Button,
  ButtonProps,
  Flex,
  Tag,
  useControllableState,
} from '@chakra-ui/react';
import type { ParsedUrlQueryInput } from 'querystring';
import React, { useMemo } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import {
  ScrollContainer,
  ScrollContainerProps,
} from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

export interface SearchableItem {
  /** Text shown on the tag. Items are sorted by it. */
  name: string;
  value: string;
  field: string;
  /**
   * Complete query for this item's /search link, used verbatim instead of the
   * default `{ q: 'field:"value"' }`. For links that need more than a single
   * field search, e.g. the Data Collection "Content Type" pills, which OR two
   * fields in `q` and add `tab: 'dc'`.
   */
  query?: ParsedUrlQueryInput;
}

/* `onToggle` and `size` are redefined below, so ScrollArea's versions are
omitted: its `onToggle` is a native event handler, and its `size` sets the
scrollbar thickness rather than the tags'. */
export interface SearchableItemsProps
  extends Omit<ScrollContainerProps, 'onToggle' | 'size'> {
  items: SearchableItem[];
  /** Size of the tags. The toggle button follows it so their text matches. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Tags shown while collapsed. `Infinity` shows every tag and no toggle. */
  itemLimit?: number;
  /** Rendered inline before the tags, e.g. a field label. */
  heading?: React.ReactNode;

  /** Plural noun for the default toggle label: "Show all {itemLabel} (4 more)". */
  itemLabel?: string;
  /**
   * Replaces the default toggle label. `limit` is the number of tags shown and
   * `length` the total, so `limit === length` means the list is expanded.
   */
  generateButtonLabel?: (limit: number, length: number) => string;

  colorPalette?: Tag.RootProps['colorPalette'];
  tagColor?: Tag.RootProps['color'];
  linkColor?: ButtonProps['color'];

  /** Expanded state for controlled mode. Omit it to let the component own it. */
  isExpanded?: boolean;
  /** Called with the next expanded state on every toggle, in either mode. */
  onToggle?: (expanded: boolean) => void;
}

/* The query an item's /search link carries. */
const getItemQuery = (item: SearchableItem): ParsedUrlQueryInput =>
  item.query ?? { q: `${item.field}:"${item.value}"` };

/* An item's identity: two items whose links match are the same tag, both for
deduplication and as a React key. Params are sorted so their order in the
query object doesn't matter. */
const getItemKey = (item: SearchableItem) => {
  const query = getItemQuery(item);
  return JSON.stringify(
    Object.keys(query)
      .sort()
      .map(param => [param, query[param]]),
  );
};

/* Keeps the first item per link and sorts by label. Callers build items fresh
on every render, so this compares keys rather than object identity. */
const getUniqueItems = (items: SearchableItem[] = []) => {
  const itemsByKey = new Map<string, SearchableItem>();
  items.forEach(item => {
    const key = getItemKey(item);
    if (!itemsByKey.has(key)) itemsByKey.set(key, item);
  });

  return Array.from(itemsByKey.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
};

const createButtonLabel =
  (itemLabel: string) => (limit: number, length: number) =>
    limit === length
      ? `Show fewer ${itemLabel}`
      : `Show all ${itemLabel} (${(length - limit).toLocaleString()} more)`;

/**
 * A scrollable, wrapping list of tags, each linking to a /search for its item.
 * Lists longer than `itemLimit` get a show more/fewer toggle.
 *
 * Expansion is uncontrolled by default. Pass `isExpanded` (with `onToggle`) to
 * control it from outside, e.g. to collapse the list when a sibling opens.
 */
export const SearchableItems: React.FC<SearchableItemsProps> = ({
  items,
  size = 'sm',
  itemLimit = 3,
  heading,
  itemLabel = 'items',
  generateButtonLabel,
  colorPalette = 'primary',
  tagColor,
  linkColor,
  isExpanded: isExpandedProp,
  onToggle,
  ...scrollContainerProps
}) => {
  const uniqueItems = useMemo(() => getUniqueItems(items), [items]);

  // Stores a boolean rather than a visible count, so the list stays expanded
  // or collapsed when `items` or `itemLimit` change.
  const [isExpanded, setIsExpanded] = useControllableState({
    value: isExpandedProp,
    defaultValue: false,
    onChange: onToggle,
  });

  if (!uniqueItems.length) return null;

  const isCollapsible = uniqueItems.length > itemLimit;
  const visibleItems = isExpanded
    ? uniqueItems
    : uniqueItems.slice(0, itemLimit);
  const getButtonLabel = generateButtonLabel ?? createButtonLabel(itemLabel);

  return (
    <ScrollContainer maxHeight='300px' {...scrollContainerProps}>
      <Flex flexWrap='wrap' gap={1}>
        {/* Display the heading of the searchable items group */}
        {heading}
        {/* Render each visible searchable item as a tag with a link to its search page */}
        {visibleItems.map(item => (
          <TagWithUrl
            key={getItemKey(item)}
            size={size}
            colorPalette={colorPalette}
            color={tagColor}
            href={{ pathname: '/search', query: getItemQuery(item) }}
            leftIcon={<FaMagnifyingGlass />}
          >
            {item.name}
          </TagWithUrl>
        ))}
        {/* Show more/fewer toggle button */}
        {isCollapsible && (
          <Button
            colorPalette={colorPalette}
            variant='unstyled'
            underline
            textStyle={size}
            color={linkColor}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {getButtonLabel(visibleItems.length, uniqueItems.length)}
          </Button>
        )}
      </Flex>
    </ScrollContainer>
  );
};
