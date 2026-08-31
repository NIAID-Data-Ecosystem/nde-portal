import { Box, Flex, Icon, IconButton, List } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa6';

import type { TocItemProps } from '../../types';

export const TocItem = ({
  tocItem,
  pageSlug,
  indent,
  parentTocItems = [],
  isParentSelected = false,
  activePageSlug,
}: TocItemProps) => {
  // Expand sections when parent page is selected
  const [isExpanded, setIsExpanded] = useState(isParentSelected);

  // Update expansion state when parent selection changes or active page changes
  useEffect(() => {
    setIsExpanded(isParentSelected);
  }, [isParentSelected, activePageSlug]);

  // Find child items (subsections)
  const currentIndex = parentTocItems.findIndex(
    item => item.hash === tocItem.hash,
  );

  const childItems = [];
  if (currentIndex !== -1) {
    // Get all items after current
    const itemsAfter = parentTocItems.slice(currentIndex + 1);

    // Find direct children (depth = current + 1) until same or shallower depth is reached
    for (const item of itemsAfter) {
      if (item.depth <= tocItem.depth) {
        // Stop when same or shallower level is hit
        break;
      }
      if (item.depth === tocItem.depth + 1) {
        // Direct child
        childItems.push(item);
      }
    }
  }

  const hasChildren = childItems.length > 0;

  return (
    <List.Item w='100%' display='flex' flexDirection='column'>
      <Flex w='100%' alignItems='center'>
        <Box
          asChild
          flex={1}
          fontSize='sm'
          pl={8 + indent}
          pr={2}
          py={1}
          lineHeight='tall'
          color='text.body'
          bg='transparent'
          cursor='pointer'
          _hover={{
            bg: 'blackAlpha.50',
            borderRadius: 'base',
            transition: 'fast',
          }}
        >
          <NextLink
            style={{ display: 'flex', flex: 1 }}
            href={`/knowledge-center/${pageSlug}#${tocItem.hash}`}
          >
            {tocItem.title}
          </NextLink>
        </Box>
        <Box
          w='40px'
          display='flex'
          justifyContent='center'
          alignItems='center'
          mr={2}
        >
          {hasChildren && (
            <IconButton
              aria-label={
                isExpanded ? 'Collapse subsections' : 'Expand subsections'
              }
              size='sm'
              variant='ghost'
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon as={isExpanded ? FaAngleDown : FaAngleRight} boxSize={4} />
            </IconButton>
          )}
        </Box>
      </Flex>
      {/* Child TOC Items (subsections) */}
      {hasChildren && isExpanded && (
        <List.Root as='ul' ml={0} mt={1}>
          {childItems.map((childItem, idx) => (
            <List.Item key={idx} w='100%' display='flex' alignItems='center'>
              <Box
                asChild
                flex={1}
                fontSize='sm'
                pl={8 + indent + 4}
                pr={2}
                py={1}
                lineHeight='tall'
                color='text.body'
                bg='transparent'
                cursor='pointer'
                _hover={{
                  bg: 'blackAlpha.50',
                  borderRadius: 'base',
                  transition: 'fast',
                }}
              >
                <NextLink
                  style={{ display: 'flex', flex: 1 }}
                  href={`/knowledge-center/${pageSlug}#${childItem.hash}`}
                >
                  {childItem.title}
                </NextLink>
              </Box>
              <Box w='40px' />
            </List.Item>
          ))}
        </List.Root>
      )}
    </List.Item>
  );
};
