import {
  Accordion,
  Box,
  Flex,
  Icon,
  List,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
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
  // Memoised so the effect below only fires when the inputs change. Built
  // inline, the placeholder list is a new array every render, which re-ran the
  // effect, set a new `[]`, and re-rendered in a loop for as long as the
  // sidebar was loading.
  const categories = useMemo(
    () =>
      (loading
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
        : sections) as SidebarContent[],
    [loading, sections],
  );

  // Find which category contains the selected page
  const selectedCategoryValues = useMemo(() => {
    if (!selectedSlug || !categories) return [];

    return categories
      .filter(category =>
        category.items.some(item => item.slug === selectedSlug),
      )
      .map(category => `item-${category.id}`);
  }, [categories, selectedSlug]);

  const [expandedValues, setExpandedValues] = useState<string[]>(
    selectedCategoryValues,
  );

  // Re-expand the selected page's category on navigation, and once the
  // categories have loaded.
  useEffect(() => {
    setExpandedValues(selectedCategoryValues);
  }, [selectedCategoryValues]);

  return (
    <Accordion.Root
      value={expandedValues}
      // Allow manual toggling of categories
      onValueChange={({ value }) => setExpandedValues(value)}
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
                      rootProps={{ flex: 1 }}
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
                      <Icon boxSize={4}>
                        {expanded ? <FaAngleDown /> : <FaAngleRight />}
                      </Icon>
                    </Box>
                  </Accordion.ItemTrigger>
                </h2>
                <Accordion.ItemContent>
                  {/* v2's AccordionPanel had no padding; v3's body pads by default. */}
                  <Accordion.ItemBody p={0}>
                    <List.Root ps={0}>
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
