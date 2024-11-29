import React, { useMemo, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Button, TagProps } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

interface SearchableItemsProps {
  colorScheme?: TagProps['colorScheme'];
  fieldName: string;
  generateButtonLabel?: (limit: number, length: number) => string;
  limit?: number;
  searchableItems: string[];
}

// Generates the default label for the "show more/show fewer" button.
const generateDefaultLabel = (limit: number, length: number) => {
  return limit === length
    ? 'Show fewer items'
    : `Show all items (${formatNumber(length - limit)} more)`;
};

/**
 * A component that displays a scrollable list of searchable tags.
 * Each tag links to a search query constructed using the specified `fieldName`.
 * Includes a "show more/show fewer" button for toggling the visible item count.
 */
export const SearchableItems: React.FC<SearchableItemsProps> = ({
  colorScheme = 'primary',
  generateButtonLabel = generateDefaultLabel,
  fieldName,
  limit: DEFAULT_LIMIT = 20,
  searchableItems,
}) => {
  // Remove possible duplicates from the list of searchable items
  const uniqueSearchableItems = useMemo(
    () => Array.from(new Set(searchableItems)),
    [searchableItems],
  );

  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const toggleLimit = () => {
    setLimit(prev =>
      prev === uniqueSearchableItems.length
        ? DEFAULT_LIMIT
        : uniqueSearchableItems.length,
    );
  };

  return (
    <ScrollContainer maxHeight='300px'>
      {uniqueSearchableItems.slice(0, limit).map((item, idx) => {
        return (
          <TagWithUrl
            key={item}
            colorScheme={colorScheme}
            href={{
              pathname: '/search',
              query: {
                q: `${fieldName}:"${item.trim().toLowerCase()}"`,
              },
            }}
            m={0.5}
            leftIcon={FaMagnifyingGlass}
          >
            {item}
          </TagWithUrl>
        );
      })}
      {uniqueSearchableItems?.length > DEFAULT_LIMIT && (
        <Button
          size='xs'
          variant='link'
          justifyContent='flex-end'
          m={1}
          onClick={toggleLimit}
        >
          {generateButtonLabel(limit, uniqueSearchableItems.length)}
        </Button>
      )}
    </ScrollContainer>
  );
};
