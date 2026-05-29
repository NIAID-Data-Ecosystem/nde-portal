/**
 * User Favorites Page - Protected route requiring authentication
 */

import {
  Box,
  Heading,
  Text,
  Flex,
  Divider,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { useUserData } from 'src/hooks/useUserData';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import { Table } from 'src/components/table';
import {
  formatTableData,
  SAVED_RESOURCE_COLUMNS,
} from 'src/views/saved/table-config';
import { useCallback, useMemo, useState } from 'react';
import { useSearchedData } from 'src/views/repository-matcher/hooks/useSearchedData';
import { SearchInput } from 'src/components/search-input';

const TABLE_CONTAINER_PROPS = {
  overflowX: 'auto' as const,
  maxHeight: '400px',
  w: '100%',
  bg: 'white',
  overflowY: 'auto' as const,
};

const MOCK_FAVORITE_DATASETS = [
  {
    dataset_id: 'figshare_25077557',
    name: 'S1 Data -',
    saved_at: '2026-05-28T20:52:16.015Z',
  },
  {
    dataset_id: 'biotools_123fastq',
    name: '123FASTQ',
    saved_at: '2026-05-21T20:52:22.978Z',
  },
  {
    dataset_id: 'figshare_25077596',
    name: 'Descriptive statistics and correlation matrix.',
    saved_at: '2026-05-27T20:52:16.714Z',
  },
  {
    dataset_id: 'figshare_25077600',
    name: 'Summary of the distribution, host plants and molecular data for the non-native psyllid taxa of the central Macaronesian islands.',
    saved_at: '2026-05-23T20:52:20.978Z',
  },
  {
    dataset_id: 'figshare_25077606',
    name: 'Primer combinations used to amplify cox1 with reference, sequence, annealing temperature, and amplicon length.',
    saved_at: '2026-05-22T20:52:21.978Z',
  },
  {
    dataset_id: 'figshare_25077693',
    name: 'Institutional-level dispositions limiting glaucoma care.',
    saved_at: '2026-05-21T20:52:22.978Z',
  },
];

function UserFavouritesPage() {
  const { user, logout } = useAuth();
  const { favoriteDatasets, isDevMode } = useUserData();

  const favouriteDatasetsWithMock = isDevMode
    ? [...(favoriteDatasets || []), ...MOCK_FAVORITE_DATASETS]
    : favoriteDatasets || [];

  const savedResourcesColumns = useMemo(() => {
    return SAVED_RESOURCE_COLUMNS.map(col => ({
      title: col.label,
      property: col.id,
      isSortable: col.columns?.isSortable,
      props: col.columns?.style,
    }));
  }, []);

  /****** Search *****/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [],
  );
  // Search iterates ALL columns (incl. hidden), so toggling visibility
  // doesn't drop matches that live in hidden columns.
  const searchedData = useSearchedData(
    formatTableData(favouriteDatasetsWithMock),
    searchTerm,
  );

  /****** Sort *****/
  const [sortProperty, setSortProperty] = useState<string>(
    SAVED_RESOURCE_COLUMNS[0].id,
  );
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = useCallback((property: string, ascending: boolean) => {
    setSortProperty(property);
    setSortAsc(ascending);
  }, []);

  const savedResourcesData = useMemo(() => {
    if (!searchedData?.length) return searchedData;
    const col = SAVED_RESOURCE_COLUMNS.find(c => c.id === sortProperty);
    if (!col) return searchedData;
    const accessor = col.getSortValue ?? ((v: any) => v);
    return [...searchedData].sort((a, b) => {
      let va: any = accessor((a as any)[col.id]);
      let vb: any = accessor((b as any)[col.id]);
      va = va ?? (typeof va === 'number' ? 0 : '');
      vb = vb ?? (typeof vb === 'number' ? 0 : '');
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), undefined, {
              sensitivity: 'base',
              numeric: true,
            });
      return sortAsc ? cmp : -cmp;
    });
  }, [searchedData, sortProperty, sortAsc]);

  // Stable references so the table's row-level memoization isn't defeated by
  // new function/object identities on every page render.
  const getTableRowProps = useCallback(
    (_: any, idx: number) => ({
      bg: idx % 2 === 0 ? 'white' : '#fafbfd',
      _hover: { bg: 'primary.50' },
    }),
    [],
  );

  const getCells = useCallback(
    ({
      column,
      data: row,
      isLoading: rowLoading,
    }: {
      column: { property: string };
      data: any;
      isLoading?: boolean;
    }) => {
      const col = SAVED_RESOURCE_COLUMNS.find(c => c.id === column.property);
      if (!col) return null;
      return col.component({
        value: row?.[col.id],
        isLoading: rowLoading,
        data: row,
      });
    },
    [],
  );

  if (!user || !ENABLE_AUTH) return null;
  return (
    <PageContainer meta={getPageSeoConfig('/favorites')} px={0} py={0}>
      <Flex direction='column' gap={4} px={{ base: 4, lg: 40 }} py={8}>
        <Heading as='h1' size='lg'>
          Favorites
        </Heading>
        <Text fontSize='md' lineHeight='short'>
          Manage saved queries and resources.
        </Text>
        {isDevMode && (
          <Box
            bg='orange.50'
            border='1px'
            borderColor='orange.200'
            borderRadius='md'
            px={3}
            py={2}
            mb={3}
          >
            <Text fontSize='sm' color='orange.800'>
              Using mock user data in development mode
            </Text>
          </Box>
        )}
      </Flex>
      <Divider />
      <Flex direction='column' gap={4} px={{ base: 4, lg: 40 }} py={8}>
        <Stack
          direction='row'
          spacing={6}
          justifyContent='space-between'
          flexWrap='wrap'
        >
          <VStack align='start' gap={0.5} fontSize='sm' fontWeight='normal'>
            <Text fontWeight='semibold'>
              Saved Resources
              <Text as='span' color='gray.700' fontWeight='medium' ml={2}>
                {favouriteDatasetsWithMock.length}{' '}
                {favouriteDatasetsWithMock.length === 1 ? 'item' : 'items'}
              </Text>
            </Text>
            <Text lineHeight='short'>
              A saved collection of datasets, computational tools, and other
              records.
            </Text>
          </VStack>
          <Flex
            maxWidth={{ base: 'unset', lg: '350px' }}
            minWidth='300px'
            flex={1}
            width='100%'
          >
            <SearchInput
              size='sm'
              placeholder='Search saved resources'
              ariaLabel='Search saved resources'
              value={searchTerm}
              handleChange={handleSearchChange}
              isResponsive={false}
              alignItems='flex-end'
              onClose={() => setSearchTerm('')}
              width='100%'
              colorScheme='primary'
            />
          </Flex>
        </Stack>
        <Table
          ariaLabel='Saved resources table'
          caption='Saved resources include datasets, computational tools, and other records that you have favorited.'
          columns={savedResourcesColumns}
          data={savedResourcesData as any}
          isLoading={false}
          hasPagination={true}
          stickyHeader
          virtualized
          tableContainerProps={TABLE_CONTAINER_PROPS}
          getTableRowProps={getTableRowProps}
          controlledSortProperty={sortProperty}
          controlledSortAsc={sortAsc}
          onControlledSort={handleSort}
          getCells={getCells}
          emptyState={
            <Flex direction='column' align='center' py={10}>
              <Text fontWeight='bold'>No matches</Text>
              <Text color='gray.700'>Try broadening your search.</Text>
            </Flex>
          }
        />
      </Flex>
    </PageContainer>
  );
}

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(UserFavouritesPage);
