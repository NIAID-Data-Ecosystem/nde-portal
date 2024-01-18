import React, { useEffect, useState } from 'react';
import {
  Accordion,
  Box,
  Button,
  Drawer,
  DrawerHeader,
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
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import { FiltersConfigProps, SelectedFilterType } from '../types';
import { ScrollContainer } from 'src/components/scroll-container';

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
  children: React.ReactNode;
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

  // Fixes issue with showing footer button on iOS: https://github.com/chakra-ui/chakra-ui/issues/2468
  const [innerHeight, setH] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 100,
  );

  function windowResizeHandler() {
    if (window !== undefined) {
      setH(window.innerHeight);
    }
  }

  useEffect(() => {
    if (window !== undefined) {
      window.addEventListener('resize', windowResizeHandler);
      return () => {
        window.removeEventListener('resize', windowResizeHandler);
      };
    }
  }, []);

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
      <Flex
        justifyContent='space-between'
        px={{ base: 0, md: 4 }}
        py={{ base: 2, md: 4 }}
        alignItems='center'
      >
        {title && (
          <Heading size='sm' fontWeight='semibold'>
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
        bg='accent.bg'
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
        <Text pl={2} color='white' fontWeight='semibold' fontSize='lg'>
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
        <DrawerContent height={`${innerHeight}px`}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth='1px'>Filters</DrawerHeader>
          <ScrollContainer>
            <DrawerBody>{content}</DrawerBody>
          </ScrollContainer>
          <DrawerFooter borderTopWidth='1px'>
            <Button onClick={onClose} colorScheme='secondary' size='md'>
              Submit and Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  ) : (
    <ScrollContainer
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
    </ScrollContainer>
  );
};
