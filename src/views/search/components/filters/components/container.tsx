import type { ColorPalette, ConditionalValue } from '@chakra-ui/react';
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Portal,
  Stack,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaFilter } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';

import { FilterConfig } from '../types';
import { CustomizeFiltersPopover } from './customize-filters-popover';

export interface FiltersContainerProps {
  colorPalette?: ConditionalValue<ColorPalette>;
  title?: string;
  disabled?: boolean;
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
  colorPalette: ConditionalValue<ColorPalette>;
}> = React.memo(({ content, onClose, innerHeight, title, colorPalette }) => (
  <Drawer.Positioner>
    <Drawer.Content height={`${innerHeight}px`}>
      <Drawer.Header borderBottomWidth='1px' py={3} px={4}>
        <Text>{title}</Text>
      </Drawer.Header>

      <Drawer.Body>
        <ScrollContainer pr={4}>{content}</ScrollContainer>
      </Drawer.Body>

      <Drawer.Footer borderTopWidth='1px' py={3}>
        <Button
          onClick={onClose}
          colorPalette={colorPalette}
          size='md'
          w='full'
        >
          Done
        </Button>
      </Drawer.Footer>
      <Drawer.CloseTrigger>
        <CloseButton size='2xs' colorPalette={colorPalette} />
      </Drawer.CloseTrigger>
    </Drawer.Content>
  </Drawer.Positioner>
));

export const FiltersContainer: React.FC<FiltersContainerProps> = ({
  title,
  error,
  colorPalette = 'secondary',
  children,
  filtersList,
  disabled = false,
  removeAllFilters,
  onVisibleFiltersChange,
}) => {
  const { open, onClose, onToggle } = useDisclosure();
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
      {/* Popover for customizing visible filters */}
      <Stack gap={2}>
        <Flex>
          <CustomizeFiltersPopover
            filtersList={filtersList}
            onVisibleFiltersChange={onVisibleFiltersChange}
          />
        </Flex>
        <Flex justifyContent='flex-end'>
          <Button
            colorPalette={colorPalette}
            variant='plain'
            underline
            size='xs'
            onClick={removeAllFilters}
            disabled={disabled}
            _disabled={{ opacity: 1, color: 'gray.700' }}
          >
            Clear All
          </Button>
        </Flex>
      </Stack>
      {error ? (
        <Flex p={4} bg='error.subtle' role='alert'>
          <Text fontSize='md' lineHeight='taller' color='red.600'>
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
      <Drawer.Root
        placement='start'
        size={screenSize === 'mobile' ? 'full' : 'md'}
        open={open}
        onOpenChange={onToggle}
      >
        <Drawer.Trigger asChild>
          <Button
            variant='solid'
            size='lg'
            colorPalette={colorPalette}
            aria-label={title || 'Filters'}
            position='fixed'
            zIndex='docked'
            left={4}
            bottom={50}
            p={0}
            width={11}
            height={11}
            borderRadius='semi'
            justifyContent='flex-start'
            color='white'
            /*
            The label is revealed by widening the button and clipping the
            overflow 
            */
            overflow='hidden'
            transitionProperty='width'
            transitionDuration='slow'
            transitionTimingFunction='ease-in-out'
            _hover={{ width: '10rem' }}
          >
            <Flex
              width={10}
              minWidth={10}
              height={10}
              alignItems='center'
              justifyContent='center'
            >
              <FaFilter />
            </Flex>
            <Text
              fontSize='sm'
              fontWeight='normal'
              whiteSpace='nowrap'
              color='inherit'
            >
              {title || 'Filters'}
            </Text>
          </Button>
        </Drawer.Trigger>
        <Portal>
          <Drawer.Backdrop />
          <DrawerContentMemo
            content={content}
            onClose={onClose}
            innerHeight={innerHeight}
            title={title || 'Filters'}
            colorPalette={colorPalette}
          />
        </Portal>
      </Drawer.Root>
    </>
  ) : (
    <Box width='100%'>{content}</Box>
  );
};
