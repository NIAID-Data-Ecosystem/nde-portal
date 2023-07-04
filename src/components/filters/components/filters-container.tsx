import React, { useEffect, useState } from 'react';
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
import { FiltersConfigProps, SelectedFilterType } from '../types';
import { NAV_HEIGHT } from 'src/pages/_document';

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
  // configuration for filters display.
  filtersConfig: FiltersConfigProps;
}

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  title,
  error,
  children,
  selectedFilters,
  filtersConfig,
  removeAllFilters,
}) => {
  const [openSections, setOpenSections] = useState<number[]>([]);
  // Handle toggle open status of mobile filter
  const btnRef = React.useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const screenSize = useBreakpointValue({
    base: 'mobile',
    sm: 'tablet',
    md: 'desktop',
  });
  useEffect(() => {
    setOpenSections(() => {
      // 1. If filter is selected, default to an open accordion panel.
      let selectedKeys =
        selectedFilters &&
        Object.entries(selectedFilters)
          .filter(([_, v]) => v.length > 0)
          .map(o =>
            Object.keys(filtersConfig)
              .filter(key => key !== 'date')
              .indexOf(o[0]),
          );
      // 2. The filter config specifies that this filter should be open by default.
      Object.values(filtersConfig)
        .filter(item => item.property !== 'date')
        .forEach((v, i) => {
          if (v.isDefaultOpen && !selectedKeys.includes(i)) {
            selectedKeys.push(i);
          }
        });
      return selectedKeys;
    });
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Accordion bg='white' allowMultiple defaultIndex={openSections}>
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
      position='sticky'
      h='100vh'
      top='0px'
      // h={[`calc(100vh - ${NAV_HEIGHT.sm})`, `calc(100vh - ${NAV_HEIGHT.md})`]}
      // top={NAV_HEIGHT}
      boxShadow='base'
      background='white'
      borderRadius='semi'
      overflowY='auto'
    >
      {content}
    </Box>
  );
};
