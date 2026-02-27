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
import { FilterConfig, SelectedFilters } from '../types';
import { ScrollContainer } from 'src/components/scroll-container';

export interface FiltersContainerProps {
  title?: string;
  isDisabled?: boolean;
  selectedFilters: SelectedFilters;
  removeAllFilters: () => void;
  error: Error | null;
  filtersList: FilterConfig[];
  children: React.ReactNode;
}

const DrawerContentMemo: React.FC<{
  content: React.ReactNode;
  onClose: () => void;
  innerHeight: number;
}> = React.memo(({ content, onClose, innerHeight }) => (
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
  // State for managing which accordion sections are open
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Prevent accordion state initialization on every render
  const [isInitialized, setIsInitialized] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setInnerHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize accordion state: auto-open sections with active filters
  useEffect(() => {
    if (!isInitialized) {
      const sectionsToOpen = new Set<string>();

      Object.keys(selectedFilters).forEach(property => {
        const filterValue = selectedFilters[property];
        if (filterValue && filterValue.length > 0) {
          sectionsToOpen.add(property);
        }
      });

      setOpenSections(sectionsToOpen);
      setIsInitialized(true);
    }
  }, [selectedFilters, isInitialized]);

  // Convert open section properties to accordion indices
  const accordionIndices = useMemo(() => {
    return Array.from(openSections)
      .map(property =>
        filtersList.findIndex(config => config.property === property),
      )
      .filter(index => index !== -1)
      .sort((a, b) => a - b);
  }, [openSections, filtersList]);

  const handleAccordionChange = (expandedIndex: number | number[]) => {
    const indices = Array.isArray(expandedIndex)
      ? expandedIndex
      : [expandedIndex];

    const openProperties = new Set<string>();
    indices.forEach(index => {
      if (index >= 0 && index < filtersList.length) {
        openProperties.add(filtersList[index].property);
      }
    });

    setOpenSections(openProperties);
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
          innerHeight={innerHeight}
        />
      </Drawer>
    </>
  ) : (
    <Box width='100%'>{content}</Box>
  );
};
