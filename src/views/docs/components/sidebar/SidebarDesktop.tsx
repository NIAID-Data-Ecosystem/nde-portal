import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Flex,
  Icon,
  SkeletonText,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa6';
import { DocumentItem } from './DocumentItem';
import { SidebarDesktopProps, SidebarContent } from './types';

export const SidebarDesktop = ({
  isLoading,
  sections,
  selectedSlug,
  colorScheme = 'niaid',
}: SidebarDesktopProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = (
    isLoading
      ? [...Array(5)].map((_, i) => {
          return {
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
          };
        })
      : sections
  ) as SidebarContent[];

  // Find which category contains the selected page
  const getExpandedIndices = () => {
    if (!selectedSlug || !categories) return [];

    const expandedIndices: number[] = [];
    categories.forEach((category, index) => {
      const hasSelectedPage = category.items.some(
        item => item.slug === selectedSlug,
      );
      if (hasSelectedPage) {
        expandedIndices.push(index);
      }
    });
    return expandedIndices;
  };

  const [expandedIndices, setExpandedIndices] = useState<number[]>(
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
  }, [selectedSlug]);

  return (
    <Accordion
      index={expandedIndices}
      onChange={indices => {
        // Allow manual toggling of categories
        setExpandedIndices(Array.isArray(indices) ? indices : [indices]);
      }}
      allowMultiple
      minW='350px'
    >
      {categories.map(category => {
        return (
          <AccordionItem key={category.id} mt={4} border='none'>
            {({ isExpanded }) => {
              return (
                <>
                  <h2>
                    <AccordionButton p={0} py={2} mb={1}>
                      <SkeletonText
                        isLoaded={!isLoading}
                        width={isLoading ? '80%' : '100%'}
                        noOfLines={1}
                        skeletonHeight={4}
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
                        {isExpanded ? (
                          <Icon as={FaAngleDown} boxSize={4} />
                        ) : (
                          <Icon as={FaAngleRight} boxSize={4} />
                        )}
                      </Box>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel p={0}>
                    <UnorderedList ml={0}>
                      {category.items.map(item => {
                        if (!item?.slug) return null;
                        return (
                          <DocumentItem
                            key={item.id}
                            item={item}
                            selectedSlug={selectedSlug}
                            colorScheme={colorScheme}
                            isLoading={isLoading}
                            activePageSlug={selectedSlug}
                          />
                        );
                      })}
                    </UnorderedList>
                  </AccordionPanel>
                </>
              );
            }}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
