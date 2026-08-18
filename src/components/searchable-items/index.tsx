import React, { useMemo, useState } from 'react';
import { FlexProps, Button, TagProps } from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

export interface SearchableItem {
  name: string;
  value: string;
  field: string;
  /**
   * Complete querystring for this item's search link, used verbatim instead of
   * the default `field:"value"`. For pills that must search more than one field
   * at once such as the Data Collection "Content Type" pills, which OR
   * `about.name` with `exampleOfWork.about.name`.
   */
  query?: string;
}

interface SearchableItemsProps extends Omit<FlexProps, 'onToggle'> {
  items: SearchableItem[];
  /** Extra params merged into every item's /search link, e.g. `{ tab: 'dc' }`. */
  searchParams?: Record<string, string>;
  colorPalette?: TagProps['colorPalette'];
  linkColor?: string;
  tagColor?: TagProps['color'];
  generateButtonLabel?: (limit: number, length: number) => string;
  itemLimit?: number;
  name?: React.ReactNode;
  // Props for external state control
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

const getItemQuery = (item: SearchableItem) =>
  item.query ?? `${item.field}:"${item.value}"`;

const generateDefaultLabel = (limit: number, length: number) => {
  return limit === length
    ? 'Show fewer items'
    : `Show all items (${(length - limit).toLocaleString()} more)`;
};

/*
 * A component that displays a scrollable list of searchable tags.
 * Each tag links to a search query constructed using the specified `fieldName`.
 * Includes a "show more/show fewer" button for toggling the visible item count.
 *
 * The component can work in two modes:
 * 1. Independent mode (default): manages its own state internally
 * 2. Controlled mode: when isExpanded and onToggle are provided, state is managed externally
 */
export const SearchableItems: React.FC<SearchableItemsProps> = ({
  colorPalette = 'primary',
  linkColor = `${colorPalette}.500`,
  tagColor,
  generateButtonLabel = generateDefaultLabel,
  itemLimit = 3,
  items,
  searchParams,
  name,
  isExpanded,
  onToggle,
  ...props
}) => {
  const uniqueItems = useMemo(
    () =>
      Array.from(new Set(items ?? [])).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      ),
    [items],
  );

  // Internal state (used only when not controlled externally)
  const [internalLimit, setInternalLimit] = useState(itemLimit);

  // Determine the work mode (independent or controlled)
  const isControlled = isExpanded !== undefined && onToggle !== undefined;

  // Use external state if controlled, otherwise use internal state
  const currentLimit = isControlled
    ? isExpanded
      ? uniqueItems.length
      : itemLimit
    : internalLimit;

  const toggleLimit = () => {
    if (isControlled) {
      // In controlled mode, call the external handler
      onToggle(!isExpanded);
    } else {
      // In independent mode, update internal state
      setInternalLimit(prev =>
        prev === uniqueItems.length ? itemLimit : uniqueItems.length,
      );
    }
  };

  if (!uniqueItems.length) return null;

  const buttonLabel = generateButtonLabel(currentLimit, uniqueItems.length);

  return (
    <ScrollContainer
      maxHeight='300px'
      m={0}
      p={0}
      display='flex'
      flexWrap='wrap'
      {...props}
    >
      {name}
      {uniqueItems.slice(0, currentLimit).map(item => (
        <TagWithUrl
          key={getItemQuery(item)}
          colorPalette={colorPalette}
          color={tagColor}
          href={{
            pathname: '/search',
            query: {
              q: getItemQuery(item),
              ...searchParams,
            },
          }}
          m={0.5}
          leftIcon={FaMagnifyingGlass}
        >
          {item.name}
        </TagWithUrl>
      ))}
      {uniqueItems.length > itemLimit && (
        <Button
          colorPalette={colorPalette}
          size='xs'
          variant='plain'
          justifyContent='flex-end'
          m={1}
          color={linkColor}
          onClick={toggleLimit}
        >
          {buttonLabel}
        </Button>
      )}
    </ScrollContainer>
  );
};
