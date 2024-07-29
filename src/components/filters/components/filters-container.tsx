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
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import { SelectedFilterType } from '../types';
import { ScrollContainer } from 'src/components/scroll-container';
import { FilterConfig } from 'src/components/search-results-page/components/filters/types';

interface FiltersContainerProps {
  title?: string;
  selectedFilters: SelectedFilterType;
  removeAllFilters?: () => void;
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
  removeAllFilters,
}) => {
  const [openSections, setOpenSections] = useState<number[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const screenSize = useBreakpointValue({
    base: 'mobile',
    sm: 'tablet',
    md: 'desktop',
  });

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

  const selectedKeys = useMemo(() => {
    let keys: number[] = [];
    if (selectedFilters) {
      keys = Object.entries(selectedFilters)
        .filter(([_, v]) => v.length > 0)
        .map(([key]) =>
          filtersList.findIndex(config => config.property === key),
        );
    }
    filtersList.forEach((config, i) => {
      if (
        config.property !== 'date' &&
        config.isDefaultOpen &&
        !keys.includes(i)
      ) {
        keys.push(i);
      }
    });
    return keys;
  }, [selectedFilters, filtersList]);

  useEffect(() => {
    setOpenSections(selectedKeys);
  }, [selectedFilters, filtersList, selectedKeys]);

  const content = (
    <>
      <Flex
        justifyContent='space-between'
        px={{ base: 0, md: 4 }}
        py={{ base: 2, md: 2 }}
        alignItems='center'
        borderBottom='0.5px solid'
        borderBottomColor='gray.100'
      >
        {title && (
          <Heading size='sm' fontWeight='medium'>
            {title}
          </Heading>
        )}
        <Button
          colorScheme='secondary'
          variant='outline'
          size='xs'
          onClick={removeAllFilters}
          isDisabled={!removeAllFilters}
        >
          Clear All
        </Button>
      </Flex>
      {error ? (
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

  return screenSize !== 'desktop' ? (
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
        <DrawerContentMemo
          content={content}
          onClose={onClose}
          screenSize={screenSize!}
          innerHeight={innerHeight}
        />
      </Drawer>
    </>
  ) : (
    <>{content}</>
  );
};
