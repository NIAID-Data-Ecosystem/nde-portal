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

const TAB_FILTER_CONFIG = {
  d: [
    'date',
    '@type',
    'includedInDataCatalog.name',
    'sourceOrganization.name',
    'healthCondition.name.raw',
    'infectiousAgent.displayName.raw',
    'species.displayName.raw',
    'funding.funder.name.raw',
    'conditionsOfAccess',
    'variableMeasured.name.raw',
    'measurementTechnique.name.raw',
  ],
  ct: [
    'date',
    '@type',
    'includedInDataCatalog.name',
    'sourceOrganization.name',
    'funding.funder.name.raw',
    'conditionsOfAccess',
    'applicationCategory',
    'operatingSystem',
    'programmingLanguage',
    'featureList.name',
    'input.name',
    'output.name',
  ],
};

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  title,
  error,
  children,
  selectedFilters,
  filtersList,
  isDisabled = false,
  removeAllFilters,
}) => {
  const [tabSpecificOpenSections, setTabSpecificOpenSections] = useState<
    Record<string, Set<string>>
  >({});
  const [commonOpenSections, setCommonOpenSections] = useState<Set<string>>(
    new Set(),
  );

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

  const commonFilters = useMemo(() => {
    const dFilters = new Set(TAB_FILTER_CONFIG.d);
    const ctFilters = new Set(TAB_FILTER_CONFIG.ct);
    return Array.from(dFilters).filter(filter => ctFilters.has(filter));
  }, []);

  const currentTabSpecificOpenSections = useMemo(() => {
    return tabSpecificOpenSections[selectedTab.id] || new Set<string>();
  }, [tabSpecificOpenSections, selectedTab.id]);

  const allCurrentOpenSections = useMemo(() => {
    const combined = new Set([
      ...commonOpenSections,
      ...currentTabSpecificOpenSections,
    ]);
    return combined;
  }, [commonOpenSections, currentTabSpecificOpenSections]);

  useEffect(() => {
    if (!isInitialized) {
      const newCommonOpenSections = new Set<string>();

      setTabSpecificOpenSections(prev => {
        const updated = { ...prev };
        if (!updated[selectedTab.id]) {
          updated[selectedTab.id] = new Set<string>();
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

        updated[selectedTab.id] = newTabSpecificOpenSections;
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

  const accordionIndices = useMemo(() => {
    return Array.from(allCurrentOpenSections)
      .map(property =>
        filtersList.findIndex(config => config.property === property),
      )
      .filter(index => index !== -1)
      .sort((a, b) => a - b);
  }, [allCurrentOpenSections, filtersList]);

  const handleAccordionChange = (expandedIndex: number | number[]) => {
    const indices = Array.isArray(expandedIndex)
      ? expandedIndex
      : [expandedIndex];

    const newCommonOpenProperties = new Set<string>();
    const newTabSpecificOpenProperties = new Set<string>();

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
    <Box>{content}</Box>
  );
};
