import React from 'react';
import {
  Accordion,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import { FiltersList } from 'src/views/search/components/filters/components/list';
import { FiltersSection } from 'src/views/search/components/filters/components/section';
import {
  FilterConfig,
  FilterTermType,
} from 'src/views/search/components/filters/types';
import {
  FILTERABLE_REPOSITORY_MATCHER_COLUMNS,
  RepositoryMatcherColumn,
} from 'src/views/repository-matcher/table-config';
import { SelectedRepositoryMatcherFilters } from 'src/views/repository-matcher/hooks/useRepositoryMatcherFilters';

interface FiltersProps {
  termsByColumnId: Record<string, FilterTermType[]>;
  selected: SelectedRepositoryMatcherFilters;
  onChange: (columnId: string, values: string[]) => void;
  onClearAll: () => void;
  isLoading?: boolean;
}

// FiltersList only reads `name` and (optionally) `groupBy` off its config; the
// rest of FilterConfig is search-page plumbing we stub out here.
const toFilterConfig = (col: RepositoryMatcherColumn<any>): FilterConfig => ({
  id: col.id,
  name: col.filter?.name ?? col.label,
  property: col.id,
  category: 'Dataset',
  description: col.filter?.description ?? '',
  queryType: 'facet',
  groupBy: col.filter?.groupBy,
});

const FiltersAccordion: React.FC<
  Pick<FiltersProps, 'termsByColumnId' | 'selected' | 'onChange' | 'isLoading'>
> = ({ termsByColumnId, selected, onChange, isLoading }) => (
  <Accordion
    allowMultiple
    defaultIndex={FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map((_, i) => i)}
  >
    {FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map(col => {
      const config = toFilterConfig(col);
      const name = col.filter?.name ?? col.label;
      return (
        <FiltersSection
          key={col.id}
          name={name}
          description={col.filter?.description ?? ''}
        >
          <FiltersList
            config={config}
            colorScheme='primary'
            searchPlaceholder={`Search ${name.toLowerCase()} filters`}
            terms={termsByColumnId[col.id] ?? []}
            selectedFilters={selected[col.id] ?? []}
            handleSelectedFilters={values => onChange(col.id, values)}
            isLoading={!!isLoading}
          />
        </FiltersSection>
      );
    })}
  </Accordion>
);

export const Filters: React.FC<FiltersProps> = ({
  termsByColumnId,
  selected,
  onChange,
  onClearAll,
  isLoading,
}) => {
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' },
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isMobile) {
    return (
      <>
        <Button
          variant='outline'
          size='sm'
          onClick={onOpen}
          leftIcon={<Icon as={FaFilter} boxSize={3} />}
          colorScheme='gray'
          fontWeight='medium'
        >
          Filters
        </Button>
        <Drawer
          isOpen={isOpen}
          onClose={onClose}
          placement='right'
          size='full'
          autoFocus={false}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader
              borderBottomWidth='1px'
              borderBottomColor='gray.100'
              py={3}
              px={4}
            >
              <Flex align='center' justify='space-between'>
                <Button
                  variant='link'
                  size='sm'
                  colorScheme={
                    Object.values(selected).length > 0 ? 'secondary' : 'gray'
                  }
                  fontWeight='medium'
                  onClick={onClearAll}
                >
                  Reset
                </Button>
                <Text fontSize='md' fontWeight='semibold'>
                  Filters
                </Text>
                <Box w='3.5rem' />
              </Flex>
            </DrawerHeader>
            <DrawerCloseButton top={3} />
            <DrawerBody px={2} py={2} bg='blackAlpha.50'>
              <FiltersAccordion
                termsByColumnId={termsByColumnId}
                selected={selected}
                onChange={onChange}
                isLoading={isLoading}
              />
            </DrawerBody>
            <DrawerFooter borderTopWidth='1px' py={3}>
              <Button
                onClick={onClose}
                colorScheme='secondary'
                size='md'
                w='full'
              >
                Done
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      bg='white'
      borderWidth='1px'
      borderColor='gray.100'
      borderTop='none'
      overflow='hidden'
    >
      <Heading
        as='h2'
        size='sm'
        px={4}
        py={3}
        borderBottom='1px solid'
        borderBottomColor='gray.100'
        fontWeight='semibold'
      >
        Filters
      </Heading>
      <Box px={2} py={1} bg='blackAlpha.50'>
        <FiltersAccordion
          termsByColumnId={termsByColumnId}
          selected={selected}
          onChange={onChange}
          isLoading={isLoading}
        />
      </Box>
    </Box>
  );
};
