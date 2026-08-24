import {
  Accordion,
  Box,
  Flex,
  Icon,
  List,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa6';

import { DEFAULT_COLOR_SCHEME } from '../../constants';
import type { SidebarContent, SidebarDesktopProps } from '../../types';
import { DocumentItem } from './DocumentItem';

export const SidebarDesktop = ({
  loading,
  sections,
  selectedSlug,
  colorPalette = DEFAULT_COLOR_SCHEME,
}: SidebarDesktopProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = (
    loading
      ? [...Array(5)].map((_, i) => ({
          id: i,
          name: 'Loading...',
          items: [
            {
              id: i,
              name: 'Loading...',
              slug: 'loading',
              href: { pathname: '/', query: { q: 'loading' } },
            },
          ],
        }))
      : sections
  ) as SidebarContent[];

  // Find which category contains the selected page
  const getExpandedIndices = useCallback(() => {
    if (!selectedSlug || !categories) return [];

    const expandedIndices: string[] = [];
    categories.forEach(category => {
      const hasSelectedPage = category.items.some(
        item => item.slug === selectedSlug,
      );
      if (hasSelectedPage) {
        expandedIndices.push(`item-${category.id}`);
      }
    });
    return expandedIndices;
  }, [categories, selectedSlug]);

  const [expandedIndices, setExpandedIndices] = useState<string[]>(
    getExpandedIndices(),
  );

  // Update expanded indices when selectedSlug changes
  useEffect(() => {
    const newExpandedIndices = getExpandedIndices();
    setExpandedIndices(newExpandedIndices);

    // Scroll sidebar to top when navigation occurs
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedSlug, getExpandedIndices]);

  return (
    <Accordion.Root
      value={expandedIndices}
      onValueChange={({ value: value }) =>
        (indices => {
          // Allow manual toggling of categories
          setExpandedIndices(Array.isArray(indices) ? indices : [indices]);
        })(value)
      }
      multiple
      minW='350px'
    >
      {categories.map(category => (
        <Accordion.Item
          key={category.id}
          mt={4}
          border='none'
          value={`item-${category.id}`}
        >
          <Accordion.ItemContext>
            {({ expanded }) => (
              <>
                <h2>
                  <Accordion.ItemTrigger
                    p={0}
                    py={2}
                    mb={1}
                    // While loading the category name is hidden by the skeleton,
                    // so give the button an accessible name to satisfy button-name.
                    aria-label={loading ? 'Loading' : undefined}
                  >
                    <SkeletonText
                      loading={loading}
                      width={loading ? '80%' : '100%'}
                      noOfLines={1}
                      height={4}
                      display='flex'
                      alignItems='center'
                      flex={1}
                    >
                      <Flex alignItems='center' flex={1} pl={6}>
                        <Text
                          as='span'
                          textAlign='left'
                          fontSize='xs'
                          color='gray.800'
                          textTransform='uppercase'
                          fontWeight='bold'
                          flex={1}
                        >
                          {category.name}
                        </Text>
                      </Flex>
                    </SkeletonText>
                    <Box
                      w='40px'
                      display='flex'
                      justifyContent='center'
                      alignItems='center'
                      mr={2}
                    >
                      {expanded ? (
                        <Icon boxSize={4} asChild>
                          <FaAngleDown />
                        </Icon>
                      ) : (
                        <Icon boxSize={4} asChild>
                          <FaAngleRight />
                        </Icon>
                      )}
                    </Box>
                  </Accordion.ItemTrigger>
                </h2>
                <Accordion.ItemContent p={0}>
                  <Accordion.ItemBody>
                    <List.Root as='ul' ml={0}>
                      {category.items.map(item => {
                        if (!item?.slug) return null;
                        return (
                          <DocumentItem
                            key={item.id}
                            item={item}
                            selectedSlug={selectedSlug}
                            colorPalette={colorPalette}
                            loading={loading}
                            activePageSlug={selectedSlug}
                          />
                        );
                      })}
                    </List.Root>
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </>
            )}
          </Accordion.ItemContext>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};
