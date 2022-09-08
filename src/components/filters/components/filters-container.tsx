import React, { useMemo } from 'react';
import {
  Accordion,
  Box,
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
} from 'nde-design-system';
import { FaFilter } from 'react-icons/fa';
import { NAV_HEIGHT } from 'src/components/page-container';
import {
  filtersConfig,
  SelectedFilterType,
} from 'src/components/search-results-page/components/filters';

/*
[COMPONENT INFO]:
Styled responsive container for filters.
*/

interface FiltersContainerProps {
  // title to show on top of container
  title?: string;
  // Currently selected filters
  selectedFilters: SelectedFilterType;
  // fn to remove all selected filters
  removeAllFilters?: () => void;
  // status of filters data
  error: Error | null;
}

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  title,
  error,
  children,
  selectedFilters,
  removeAllFilters,
}) => {
  // Handle toggle open status of mobile filter
  const btnRef = React.useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const screenSize = useBreakpointValue({
    base: 'mobile',
    sm: 'tablet',
    md: 'desktop',
  });

  // on mount open the accordion section where the selected filter resides
  const openAccordionIndex = useMemo(() => {
    let selectedKeys = Object.entries(selectedFilters)
      .filter(([_, v]) => v.length > 0)
      .map(o => Object.keys(filtersConfig).indexOf(o[0]));
    return selectedKeys.length > 0 ? selectedKeys : [1];
  }, [selectedFilters]);

  const content = (
    <>
      <Flex justifyContent='space-between' px={4} py={4} alignItems='center'>
        {title && (
          <Heading size='sm' fontWeight='semibold' py={[4, 4, 0]}>
            {title}
          </Heading>
        )}
        {/* Clear all currently selected filters */}
        <Button
          colorScheme='secondary'
          variant='outline'
          size='sm'
          onClick={removeAllFilters}
          isDisabled={!removeAllFilters}
        >
          Clear All
        </Button>
      </Flex>
      {error ? (
        // Error message.
        <Flex p={4} bg='status.error'>
          <Heading size='sm' color='white' fontWeight='semibold'>
            Something went wrong, unable to load filters. <br />
            Try reloading the page.
          </Heading>
        </Flex>
      ) : (
        <Accordion bg='white' allowMultiple defaultIndex={openAccordionIndex}>
          {children}
        </Accordion>
      )}
    </>
  );

  // For mobile view, we show a button that pops out a filters drawer
  return screenSize !== 'desktop' ? (
    <>
      {/* Styles of floating button from niaid design specs: https://designsystem.niaid.nih.gov/components/atoms */}
      <Button
        ref={btnRef}
        variant='solid'
        bg={'accent.bg'}
        onClick={onOpen}
        position='fixed'
        zIndex={50}
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
        <Text pl={2} color='white' fontWeight='semibold' fontSize='lg'>
          {title || 'Filters'}
        </Text>
      </Button>
      <Drawer
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
        size={screenSize === 'mobile' ? 'full' : 'md'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody px={[2, 4]} py={8}>
            {content}
          </DrawerBody>
          <DrawerFooter>
            <Button
              w='100%'
              variant='solid'
              m={3}
              onClick={onClose}
              colorScheme='secondary'
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  ) : (
    <Box
      flex={1}
      minW='270px'
      maxW='400px'
      h='95vh'
      position='sticky'
      top={NAV_HEIGHT}
      boxShadow='base'
      background='white'
      borderRadius='semi'
      overflowY='auto'
    >
      {content}
    </Box>
  );
};
