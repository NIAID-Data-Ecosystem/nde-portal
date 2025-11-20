import {
  Accordion,
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Heading,
  Icon,
  Portal,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaFilter } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

import { useSearchTabsContext } from '../../../context/search-tabs-context';
import { FilterConfig, SelectedFilterType } from '../types';
import { getCommonFilterProperties } from '../utils/tab-filter-utils';

export interface FiltersContainerProps {
  title?: string;
  isDisabled?: boolean;
  selectedFilters: SelectedFilterType;
  removeAllFilters: () => void;
  error: Error | null;
  filtersList: FilterConfig[];
  children: React.ReactNode;
}

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  title,
  error,
  children,
  selectedFilters,
  filtersList,
  isDisabled = false,
  removeAllFilters,
}) => {
  // State for managing which sections are open per tab
  // It allows tab-specific filters to maintain their open/closed state
  // when switching between tabs
  const [tabSpecificOpenSections, setTabSpecificOpenSections] = useState<
    Record<string, Set<string>>
  >({});

  // State for managing which common sections are open
  // Common filters persist their state across all tabs
  const [commonOpenSections, setCommonOpenSections] = useState<Set<string>>(
    new Set(),
  );

  // Prevent accordion state initialization on every render
  const [isInitialized, setIsInitialized] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const { selectedTab } = useSearchTabsContext();
  const screenSize = useBreakpointValue(
    {
      base: 'mobile',
      sm: 'tablet',
      md: 'tablet',
      lg: 'desktop',
    },
    { fallback: 'lg' },
  );

  const [innerHeight, setInnerHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 100,
  );

  const windowResizeHandler = () => {
    if (typeof window !== 'undefined') {
      setInnerHeight(window.innerHeight);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', windowResizeHandler);
      return () => {
        window.removeEventListener('resize', windowResizeHandler);
      };
    }
  }, []);

  // Get list of filter properties that are common across all tabs
  const commonFilters = useMemo(() => {
    return getCommonFilterProperties();
  }, []);

  // Get open sections for the current tab
  const currentTabSpecificOpenSections = useMemo(() => {
    return tabSpecificOpenSections[selectedTab.id] || new Set<string>();
  }, [tabSpecificOpenSections, selectedTab.id]);

  // Combine common and tab-specific open sections for the selected tab
  const allCurrentOpenSections = useMemo(() => {
    const combined = new Set([
      ...commonOpenSections,
      ...currentTabSpecificOpenSections,
    ]);
    return combined;
  }, [commonOpenSections, currentTabSpecificOpenSections]);

  /**
   * Initialize accordion state based on:
   * 1. Currently selected filters (auto-open sections with active filters)
   * 2. Filter configs marked as default open
   */
  useEffect(() => {
    if (!isInitialized) {
      const newCommonOpenSections = new Set<string>();

      setTabSpecificOpenSections(prev => {
        const tabId = selectedTab.id;
        const updated = { ...prev };
        if (!updated[tabId]) {
          updated[tabId] = new Set<string>();
        }
        const newTabSpecificOpenSections = new Set<string>();

        if (selectedFilters) {
          Object.entries(selectedFilters)
            .filter(([_, v]) => v.length > 0)
            .forEach(([property]) => {
              if (commonFilters.includes(property)) {
                newCommonOpenSections.add(property);
              } else {
                newTabSpecificOpenSections.add(property);
              }
            });
        }

        filtersList.forEach(config => {
          if (config.isDefaultOpen) {
            if (commonFilters.includes(config.property)) {
              newCommonOpenSections.add(config.property);
            } else {
              newTabSpecificOpenSections.add(config.property);
            }
          }
        });

        updated[tabId] = newTabSpecificOpenSections;
        return updated;
      });

      setCommonOpenSections(newCommonOpenSections);
      setIsInitialized(true);
    }
  }, [
    selectedFilters,
    filtersList,
    selectedTab.id,
    commonFilters,
    isInitialized,
  ]);

  // Convert open section properties to accordion indices
  const accordionIndices = useMemo(() => {
    return Array.from(allCurrentOpenSections)
      .map(property => {
        const filterListIndex = filtersList.findIndex(
          config => config.property === property,
        );
        return String(filterListIndex);
      })
      .filter(index => index !== '-1')
      .sort((a, b) => +a - +b);
  }, [allCurrentOpenSections, filtersList]);

  /**
   * Handle accordion section expand/collapse
   * Separate common filters from tab-specific filters to maintain
   * appropriate state persistence
   */
  const handleAccordionChange = (value: string | string[]) => {
    const expandedIndex = value;
    const string_indices = Array.isArray(expandedIndex)
      ? expandedIndex
      : [expandedIndex];

    const newCommonOpenProperties = new Set<string>();
    const newTabSpecificOpenProperties = new Set<string>();

    // Categorize each opened section as common or tab-specific
    string_indices.forEach(str => {
      const index = +str;
      if (index >= 0 && index < filtersList.length) {
        const property = filtersList[index].property;
        if (commonFilters.includes(property)) {
          newCommonOpenProperties.add(property);
        } else {
          newTabSpecificOpenProperties.add(property);
        }
      }
    });

    setCommonOpenSections(newCommonOpenProperties);

    setTabSpecificOpenSections(prev => {
      const updated = { ...prev };
      updated[selectedTab.id] = newTabSpecificOpenProperties;
      return updated;
    });
  };

  const content = error ? (
    <Flex p={4} bg='error.light'>
      <Heading size='sm' color='red.600' fontWeight='normal'>
        Something went wrong, unable to load filters. <br />
        Try reloading the page.
      </Heading>
    </Flex>
  ) : (
    <Accordion.Root
      bg='white'
      multiple
      value={accordionIndices}
      onValueChange={e => handleAccordionChange(e.value)}
    >
      {children}
    </Accordion.Root>
  );

  return screenSize && screenSize !== 'desktop' ? (
    <>
      <Drawer.Root
        placement='start'
        closeOnEscape={true}
        size={screenSize === 'mobile' ? 'full' : 'sm'}
      >
        <Drawer.Trigger asChild>
          <Button
            ref={btnRef}
            variant='solid'
            bg='accent.400'
            position='fixed'
            zIndex='docked'
            left={4}
            bottom={50}
            boxShadow='high'
            w='3.5rem'
            h='3.5rem'
            p={0}
            transition='0.3s ease-in-out !important'
            overflow='hidden'
            justifyContent='flex-start'
            _hover={{
              width: '12rem',
            }}
          >
            <Flex
              w='3.5rem'
              minW='3.5rem'
              h='3.5rem'
              alignItems='center'
              justifyContent='center'
            >
              <Icon as={FaFilter} boxSize={5} ml={1} mr={2} />
            </Flex>
            <Text color='white' fontWeight='normal' fontSize='lg'>
              {title || 'Filters'}
            </Text>
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content height={`${innerHeight}px`} pt={8} zIndex={2000}>
              <Drawer.Header>
                {title && <Drawer.Title>{title}</Drawer.Title>}
                <Button
                  colorScheme='secondary'
                  variant='outline'
                  size='xs'
                  onClick={removeAllFilters}
                  disabled={isDisabled}
                >
                  Clear All
                </Button>
              </Drawer.Header>
              <Drawer.CloseTrigger asChild>
                <CloseButton size='sm' />
              </Drawer.CloseTrigger>
              <ScrollContainer>
                <Drawer.Body>
                  {error ? (
                    <Flex p={4} bg='error.light'>
                      <Heading size='sm' color='red.600' fontWeight='normal'>
                        Something went wrong, unable to load filters. <br />
                        Try reloading the page.
                      </Heading>
                    </Flex>
                  ) : (
                    content
                  )}
                </Drawer.Body>
              </ScrollContainer>

              <Drawer.Footer borderTopWidth='1px'>
                <Drawer.ActionTrigger asChild>
                  <Button colorScheme='secondary' size='md'>
                    Submit and Close
                  </Button>
                </Drawer.ActionTrigger>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  ) : (
    <Box width='100%'>{content}</Box>
  );
};
