import React, { useMemo, useState } from 'react';
import { FlexProps, Button, TagProps } from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

interface SearchableItemsProps extends FlexProps {
  items: {
    name: string;
    value: string;
    field: string;
  }[];
  colorScheme?: TagProps['colorScheme'];
  generateButtonLabel?: (limit: number, length: number) => string;
  itemLimit?: number;
  name?: React.ReactNode;
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
 */
export const SearchableItems: React.FC<SearchableItemsProps> = ({
  colorScheme = 'primary',
  generateButtonLabel = generateDefaultLabel,
  itemLimit = 3,
  items,
  name,
  ...props
}) => {
  const uniqueItems = useMemo(
    () =>
      Array.from(new Set(items ?? [])).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      ),
    [items],
  );

  const [limit, setLimit] = useState(itemLimit);

  const toggleLimit = () => {
    setLimit(prev =>
      prev === uniqueItems.length ? itemLimit : uniqueItems.length,
    );
  };

  if (!uniqueItems.length) return null;

  const buttonLabel = generateButtonLabel(limit, uniqueItems.length);

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
      {uniqueItems.slice(0, limit).map(item => (
        <TagWithUrl
          key={item.value}
          colorScheme={colorScheme}
          href={{
            pathname: '/search',
            query: {
              q: `${item.field}:"${item.value}"`,
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
          colorScheme={colorScheme}
          size='xs'
          variant='link'
          justifyContent='flex-end'
          m={1}
          onClick={toggleLimit}
        >
          {buttonLabel}
        </Button>
      )}
    </ScrollContainer>
  );
};
