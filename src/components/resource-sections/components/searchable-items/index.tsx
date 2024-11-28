import React, { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { Button } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';

interface SearchableItemsProps {
  searchableItems: string[];
  itemType: string;
}

export const SearchableItems: React.FC<SearchableItemsProps> = ({
  searchableItems,
  itemType,
}) => {
  const DEFAULT_LIMIT = 20;
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const buttonText =
    limit === searchableItems.length
      ? 'Show fewer items'
      : `Show all items (${formatNumber(searchableItems.length - limit)} more)`;
  return (
    <>
      <ScrollContainer maxHeight='300px'>
        {searchableItems &&
          searchableItems.slice(0, limit).map((item, idx) => {
            return (
              <TagWithUrl
                key={idx + item}
                colorScheme='primary'
                href={{
                  pathname: '/search',
                  query: {
                    q: `${itemType}:"${item.trim().toLowerCase()}"`,
                  },
                }}
                m={0.5}
                leftIcon={FaMagnifyingGlass}
              >
                {item}
              </TagWithUrl>
            );
          })}
        {searchableItems && searchableItems?.length > DEFAULT_LIMIT && (
          <Button
            size='xs'
            variant='link'
            justifyContent='flex-end'
            m={1}
            onClick={() => {
              setLimit(prev => {
                if (prev === searchableItems.length) {
                  return DEFAULT_LIMIT;
                }
                return searchableItems.length;
              });
            }}
          >
            {buttonText}
          </Button>
        )}
      </ScrollContainer>
    </>
  );
};
