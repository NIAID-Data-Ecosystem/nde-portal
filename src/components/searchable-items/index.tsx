import React, { useMemo, useState } from 'react';
import {
  Flex,
  FlexProps,
  Icon,
  Text,
  Button,
  TagProps,
} from '@chakra-ui/react';
import { FaMagnifyingGlass, FaInfo } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { TagWithUrl } from 'src/components/tag-with-url';
import Tooltip from 'src/components/tooltip';

interface SearchableItemsProps extends FlexProps {
  items: string[] | null | undefined;
  itemLimit?: number;
  fieldName: string;
  itemLabel?: string;
  generateButtonLabel?: (limit: number, length: number) => string;
  customizeButtonLabel?: (
    limit: number,
    length: number,
    itemLabel: string,
  ) => string;
  colorScheme?: TagProps['colorScheme'];
  title?: string;
  tooltipText?: string;
  showTooltip?: boolean;
  utilizeFlexContainer?: boolean;
}

const generateDefaultLabel = (
  limit: number,
  length: number,
  itemLabel: string,
) => {
  return limit === length
    ? `Show fewer ${itemLabel}`
    : `Show all ${itemLabel} (${length - limit} more)`;
};

/*
 * A component that displays a scrollable list of searchable tags.
 * Each tag links to a search query constructed using the specified `fieldName`.
 * Includes a "show more/show fewer" button for toggling the visible item count.
 */
export const SearchableItems: React.FC<SearchableItemsProps> = ({
  items,
  itemLimit = 3,
  fieldName,
  itemLabel = 'items',
  generateButtonLabel = generateDefaultLabel,
  customizeButtonLabel,
  colorScheme = 'primary',
  title,
  tooltipText,
  showTooltip = false,
  utilizeFlexContainer = false,
  ...props
}) => {
  const uniqueItems = useMemo(
    () =>
      Array.from(new Set(items ?? [])).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
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

  const buttonLabel = customizeButtonLabel
    ? customizeButtonLabel(limit, uniqueItems.length, itemLabel)
    : generateButtonLabel(limit, uniqueItems.length, itemLabel);

  const content = (
    <>
      {uniqueItems.slice(0, limit).map(item => (
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
      ))}
      {uniqueItems.length > itemLimit && (
        <Button
          size='xs'
          variant='link'
          justifyContent='flex-end'
          m={1}
          onClick={toggleLimit}
        >
          {buttonLabel}
        </Button>
      )}
    </>
  );

  return (
    <ScrollContainer maxHeight='300px' m={0} p={0}>
      {utilizeFlexContainer ? (
        <Flex
          flexWrap='wrap'
          my={0}
          py={1}
          borderBottom='1px solid'
          borderBottomColor='gray.200'
          {...props}
        >
          {title && (
            <Tooltip label={tooltipText}>
              <Text fontSize='xs' color='gray.800' mr={1} userSelect='none'>
                {title}
                {showTooltip && (
                  <Icon
                    as={FaInfo}
                    boxSize={3.5}
                    border='1px solid'
                    borderRadius='full'
                    p={0.5}
                    mx={1}
                    color='gray.800!important'
                  />
                )}
                :
              </Text>
            </Tooltip>
          )}
          {content}
        </Flex>
      ) : (
        content
      )}
    </ScrollContainer>
  );
};
