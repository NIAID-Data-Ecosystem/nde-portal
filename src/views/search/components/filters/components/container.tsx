import React, { useEffect, useState, useRef } from 'react';
import {
  Button,
  Drawer,
  Flex,
  Text,
  useDisclosure,
  useBreakpointValue,
  Icon,
  Box,
  Portal,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import { FilterConfig } from '../types';
import { ScrollContainer } from 'src/components/scroll-container';
import { CustomizeFiltersPopover } from './customize-filters-popover';

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
  <Drawer.Positioner>
    <Drawer.Content height={`${innerHeight}px`}>
      <Drawer.Header borderBottomWidth='1px' py={3} px={4}>
        <Flex align='center' gap={2}>
          <Text fontSize='md' fontWeight='semibold' flex={1}>
            {title}
          </Text>
        </Flex>
      </Drawer.Header>
      <Drawer.CloseTrigger top={3} />
      <ScrollContainer>
        <Drawer.Body px={2}>{content}</Drawer.Body>
      </ScrollContainer>
      <Drawer.Footer borderTopWidth='1px' py={3}>
        <Button onClick={onClose} colorPalette='secondary' size='md' w='full'>
          Done
        </Button>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Positioner>
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
  const { open, onOpen, onClose } = useDisclosure();
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
          <CustomizeFiltersPopover
            filtersList={filtersList}
            onVisibleFiltersChange={onVisibleFiltersChange}
          />
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
            colorPalette='secondary'
            variant='plain'
            size='xs'
            onClick={removeAllFilters}
            disabled={isDisabled}
            _disabled={{ opacity: 1, color: 'gray.700' }}
          >
            Clear All
          </Button>
        </Flex>
      </Flex>
      {error ? (
        <Flex p={4} bg='status.error_lt' role='alert'>
          <Text fontSize='md' lineHeight='base' color='red.600'>
            Something went wrong, unable to load filters. <br />
            Try reloading the page.
          </Text>
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
          <Icon boxSize={5} ml={1} mr={2} asChild>
            <FaFilter />
          </Icon>
        </Flex>
        <Text color='white' fontWeight='normal' fontSize='lg'>
          {title || 'Filters'}
        </Text>
      </Button>
      <Drawer.Root
        open={isOpen}
        placement='start'
        finalFocusEl={() => btnRef.current}
        size={screenSize === 'mobile' ? 'full' : 'md'}
        onOpenChange={e => {
          if (!e.open) {
            onClose();
          }
        }}
      >
        <Portal>
          <Drawer.Backdrop />
          <DrawerContentMemo
            content={content}
            onClose={onClose}
            innerHeight={innerHeight}
            title={title || 'Filters'}
          />
        </Portal>
      </Drawer.Root>
    </>
  ) : (
    <Box width='100%'>{content}</Box>
  );
};
