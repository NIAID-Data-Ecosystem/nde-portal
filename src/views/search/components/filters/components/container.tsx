import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Accordion,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Heading,
  Text,
  useDisclosure,
  useBreakpointValue,
  Icon,
  Box,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import { FilterConfig, SelectedFilterType } from '../types';
import { ScrollContainer } from 'src/components/scroll-container';
import { useSearchTabsContext } from '../../../context/search-tabs-context';
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

const DrawerContentMemo: React.FC<{
  content: React.ReactNode;
  onClose: () => void;
  screenSize: string;
  innerHeight: number;
}> = React.memo(({ content, onClose, screenSize, innerHeight }) => (
  <DrawerContent height={`${innerHeight}px`} pt={8}>
    <DrawerCloseButton />
    <ScrollContainer>
      <DrawerBody>{content}</DrawerBody>
    </ScrollContainer>
    <DrawerFooter borderTopWidth='1px'>
      <Button onClick={onClose} colorScheme='secondary' size='md'>
        Submit and Close
      </Button>
    </DrawerFooter>
  </DrawerContent>
));

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
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      .map(property =>
        filtersList.findIndex(config => config.property === property),
      )
      .filter(index => index !== -1)
      .sort((a, b) => a - b);
  }, [allCurrentOpenSections, filtersList]);

  /**
   * Handle accordion section expand/collapse
   * Separate common filters from tab-specific filters to maintain
   * appropriate state persistence
   */
  const handleAccordionChange = (expandedIndex: number | number[]) => {
    const indices = Array.isArray(expandedIndex)
      ? expandedIndex
      : [expandedIndex];

    const newCommonOpenProperties = new Set<string>();
    const newTabSpecificOpenProperties = new Set<string>();

    // Categorize each opened section as common or tab-specific
    indices.forEach(index => {
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

  const content = (
    <>
      <Flex
        justifyContent='space-between'
        px={{ base: 0, md: 4 }}
        py={{ base: 2, md: 4 }}
        alignItems='center'
        borderBottom='0.5px solid'
        borderBottomColor='gray.100'
      >
        {title && (
          <Heading size='sm' fontWeight='medium' lineHeight='short'>
            {title}
          </Heading>
        )}
        <Button
          colorScheme='secondary'
          variant='outline'
          size='xs'
          onClick={removeAllFilters}
          isDisabled={isDisabled}
        >
          Clear All
        </Button>
      </Flex>
      {error ? (
        <Flex p={4} bg='status.error_lt'>
          <Heading size='sm' color='red.600' fontWeight='normal'>
            Something went wrong, unable to load filters. <br />
            Try reloading the page.
          </Heading>
        </Flex>
      ) : (
        <Accordion
          bg='white'
          allowMultiple
          index={accordionIndices}
          onChange={handleAccordionChange}
        >
          {children}
        </Accordion>
      )}
    </>
  );

  return screenSize && screenSize !== 'desktop' ? (
    <>
      <Button
        ref={btnRef}
        variant='solid'
        bg='accent.400'
        onClick={onOpen}
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
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
        size={screenSize === 'mobile' ? 'full' : 'md'}
      >
        <DrawerOverlay />
        <DrawerContentMemo
          content={content}
          onClose={onClose}
          screenSize={screenSize!}
          innerHeight={innerHeight}
        />
      </Drawer>
    </>
  ) : (
    <Box width='100%'>{content}</Box>
  );
};
