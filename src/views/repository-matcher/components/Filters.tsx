import React from 'react';
import {
  Accordion,
  Box,
  Button,
  Drawer,
  Flex,
  Heading,
  Icon,
  Text,
  useBreakpointValue,
  useDisclosure,
  Portal,
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import { FiltersList } from 'src/views/search/components/filters/components/list';
import { FiltersSection } from 'src/views/search/components/filters/components/section';
import {
  FilterConfig,
  FilterTermType,
} from 'src/views/search/components/filters/types';
import { FILTERABLE_REPOSITORY_MATCHER_COLUMNS } from 'src/views/repository-matcher/table-config';
import { SelectedRepositoryMatcherFilters } from 'src/views/repository-matcher/hooks/useRepositoryMatcherFilters';
import { RepositoryMatcherColumn } from '../types';

interface FiltersProps {
  termsByColumnId: Record<string, FilterTermType[]>;
  selected: SelectedRepositoryMatcherFilters;
  onChange: (columnId: string, values: string[]) => void;
  onClearAll: () => void;
  loading?: boolean;
}

// FiltersList only reads `name` and (optionally) `groupBy` off its config; the
// rest of FilterConfig is search-page plumbing we stub out here.
const toFilterConfig = (col: RepositoryMatcherColumn<any>): FilterConfig => ({
  id: col.id,
  name: col.label,
  property: col.id,
  category: 'Dataset',
  description: col.info?.description ?? '',
  queryType: 'facet',
  groupBy: col.filter?.groupBy,
});

const FiltersAccordion: React.FC<
  Pick<FiltersProps, 'termsByColumnId' | 'selected' | 'onChange' | 'loading'>
> = ({ termsByColumnId, selected, onChange, loading }) => (
  <Accordion.Root
    multiple
    defaultValue={FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map((_, i) => i)}
  >
    {FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map(col => {
      const config = toFilterConfig(col);
      const { description, name } = config;
      return (
        <FiltersSection key={col.id} name={name} description={description}>
          <FiltersList
            config={config}
            colorPalette='primary'
            searchPlaceholder={`Search ${name.toLowerCase()} filters`}
            terms={termsByColumnId[col.id] ?? []}
            selectedFilters={selected[col.id] ?? []}
            handleSelectedFilters={values => onChange(col.id, values)}
            loading={!!loading}
          />
        </FiltersSection>
      );
    })}
  </Accordion.Root>
);

export const Filters: React.FC<FiltersProps> = ({
  termsByColumnId,
  selected,
  onChange,
  onClearAll,
  loading,
}) => {
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' },
  );
  const { open, onOpen, onClose } = useDisclosure();

  if (isMobile) {
    return (
      <>
        <Button
          variant='outline'
          size='sm'
          onClick={onOpen}
          colorPalette='gray'
          fontWeight='medium'
        >
          <Icon boxSize={3} asChild>
            <FaFilter />
          </Icon>
          Filters
        </Button>
        <Drawer.Root
          open={open}
          placement='end'
          size='full'
          onOpenChange={e => {
            if (!e.open) {
              onClose();
            }
          }}
        >
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header
                  borderBottomWidth='1px'
                  borderBottomColor='gray.100'
                  py={3}
                  px={4}
                >
                  <Flex align='center' justify='space-between'>
                    <Button
                      variant='plain'
                      size='sm'
                      colorPalette={
                        Object.values(selected).length > 0
                          ? 'secondary'
                          : 'gray'
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
                </Drawer.Header>
                <Drawer.CloseTrigger top={3} />
                <Drawer.Body px={2} py={2} bg='blackAlpha.50'>
                  <FiltersAccordion
                    termsByColumnId={termsByColumnId}
                    selected={selected}
                    onChange={onChange}
                    loading={loading}
                  />
                </Drawer.Body>
                <Drawer.Footer borderTopWidth='1px' py={3}>
                  <Button
                    onClick={onClose}
                    colorPalette='secondary'
                    size='md'
                    w='full'
                  >
                    Done
                  </Button>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
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
          loading={loading}
        />
      </Box>
    </Box>
  );
};
