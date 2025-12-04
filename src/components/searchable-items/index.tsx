import { BoxProps, Button, ButtonProps, FlexProps } from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { Tag } from 'src/components/tag';

interface SearchableItemsProps extends FlexProps {
  items: {
    name: string;
    value: string;
    field: string;
  }[];
  colorPalette?: ButtonProps['colorPalette'];
  generateButtonLabel?: (limit: number, length: number) => string;
  itemLimit?: number;
  name?: React.ReactNode;
  // Props for external state control
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

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

const SearchableItemsList: React.FC<SearchableItemsProps> = ({
  colorPalette = 'primary',
  generateButtonLabel = generateDefaultLabel,
  itemLimit = 3,
  items,
  name,
  isExpanded,
  onToggle,
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
    <>
      {name}
      {uniqueItems.slice(0, currentLimit).map(item => (
        <Tag
          key={item.value}
          colorPalette={colorPalette}
          linkProps={{
            href: {
              pathname: '/search',
              query: {
                q: `${item.field}:"${item.value}"`,
              },
            },
          }}
          m={0.5}
          leftIcon={<FaMagnifyingGlass />}
        >
          {item.name}
        </Tag>
      ))}
      {uniqueItems.length > itemLimit && (
        <Button
          colorPalette={colorPalette}
          size='xs'
          variant='link'
          justifyContent='flex-end'
          m={1}
          px={0}
          onClick={toggleLimit}
        >
          {buttonLabel}
        </Button>
      )}
    </>
  );
};

const SearchableItemsWrapper = (props: BoxProps) => {
  return (
    <ScrollContainer
      maxHeight='300px'
      m={0}
      p={0}
      display='flex'
      flexWrap='wrap'
      {...props}
    />
  );
};

export const SearchableItems = {
  List: SearchableItemsList,
  Wrapper: SearchableItemsWrapper,
};
