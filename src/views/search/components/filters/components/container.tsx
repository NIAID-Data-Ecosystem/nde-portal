import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
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
import { FilterConfig } from '../types';
import { ScrollContainer } from 'src/components/scroll-container';
import { CustomizeFiltersPopover } from './customize-filters-popover';
import { SHOW_VISUAL_SUMMARY } from 'src/utils/feature-flags';

export interface FiltersContainerProps {
  title?: string;
  isDisabled?: boolean;
  removeAllFilters: () => void;
  error: Error | null;
  filtersList: FilterConfig[];
  onVisibleFiltersChange?: (visibleFilterIds: string[]) => void;
  children: React.ReactNode;
}

const DrawerContentMemo: React.FC<{
  content: React.ReactNode;
  onClose: () => void;
  innerHeight: number;
  title: string;
}> = React.memo(({ content, onClose, innerHeight, title }) => (
  <DrawerContent height={`${innerHeight}px`}>
    <DrawerHeader borderBottomWidth='1px' py={3} px={4}>
      <Flex align='center' gap={2}>
        <Text fontSize='md' fontWeight='semibold' flex={1}>
          {title}
        </Text>
      </Flex>
    </DrawerHeader>
    <DrawerCloseButton top={3} />
    <ScrollContainer>
      <DrawerBody px={2}>{content}</DrawerBody>
    </ScrollContainer>
    <DrawerFooter borderTopWidth='1px' py={3}>
      <Button onClick={onClose} colorScheme='secondary' size='md' w='full'>
        Done
      </Button>
    </DrawerFooter>
  </DrawerContent>
));

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  title,
  error,
  children,
  filtersList,
  isDisabled = false,
  removeAllFilters,
  onVisibleFiltersChange,
}) => {
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

  const content = (
    <>
      <Flex
        px={{ base: 0, md: 4 }}
        py={2}
        gap={4}
        flexDirection='column'
        borderBottom='0.5px solid'
        borderBottomColor='gray.100'
      >
        {/* Popover for customizing visible filters */}
        <Flex gap={2} justifyContent='space-between'>
          {SHOW_VISUAL_SUMMARY && (
            <CustomizeFiltersPopover
              filtersList={filtersList}
              onVisibleFiltersChange={onVisibleFiltersChange}
            />
          )}
          {/* {title && (
            <Heading
              size='sm'
              fontWeight='medium'
              lineHeight='short'
              color='text.heading'
            >
              {title}
            </Heading>
          )} */}
          <Button
            colorScheme='secondary'
            variant='link'
            size='xs'
            onClick={removeAllFilters}
            isDisabled={isDisabled}
          >
            Clear All
          </Button>
        </Flex>
      </Flex>
      {error ? (
        <Flex p={4} bg='status.error_lt'>
          <Heading size='sm' color='red.600' fontWeight='normal'>
            Something went wrong, unable to load filters. <br />
            Try reloading the page.
          </Heading>
        </Flex>
      ) : (
        <Box bg='white'>{children}</Box>
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
        borderRadius='full'
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
          title={title || 'Filters'}
        />
      </Drawer>
    </>
  ) : (
    <Box width='100%'>{content}</Box>
  );
};
