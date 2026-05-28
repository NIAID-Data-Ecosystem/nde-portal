/**
 * User Favorites Page - Protected route requiring authentication
 */

import {
  Box,
  Heading,
  VStack,
  Button,
  HStack,
  Switch,
  Text,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { useUserData } from 'src/hooks/useUserData';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import { Table } from 'src/components/table';
import { SAVED_RESOURCE_COLUMNS } from 'src/views/saved/table-config';
import { useCallback, useMemo, useState } from 'react';
import { useSearchedData } from 'src/views/repository-matcher/hooks/useSearchedData';

const MOCK_FAVORITE_DATASETS = [
  {
    dataset_id: 'figshare_25077557',
    name: 'S1 Data -',
    saved_at: '2026-05-28T20:52:16.015Z',
  },
  {
    dataset_id: 'figshare_25077596',
    name: 'Descriptive statistics and correlation matrix.',
    saved_at: '2026-05-28T20:52:16.714Z',
  },
  {
    dataset_id: 'figshare_25077600',
    name: 'Summary of the distribution, host plants and molecular data for the non-native psyllid taxa of the central Macaronesian islands.',
    saved_at: '2026-05-28T20:52:20.978Z',
  },
];

function UserFavouritesPage() {
  const { user, logout } = useAuth();
  const {
    favoriteSearches,
    favoriteDatasets,
    preferences,
    isDevMode,
    getProfile,
    updatePreferenceField,
    saveFavoriteSearch,
    removeFavoriteSearch,
    saveFavoriteDataset,
    removeFavoriteDataset,
  } = useUserData();

  const favouriteDatasetsWithMock = (
    isDevMode
      ? [...(favoriteDatasets || []), ...MOCK_FAVORITE_DATASETS]
      : favoriteDatasets || []
  ).map(ds => ({
    ...ds,
    _id: ds.dataset_id,
    _search: ds.name,
  }));

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
  const searchedData = useSearchedData(favouriteDatasetsWithMock, searchTerm);

  const sortedData = useMemo(() => {
    if (!filteredData?.length) return filteredData;
    const col = REPOSITORY_MATCHER_COLUMNS.find(c => c.id === sortProperty);
    if (!col) return filteredData;
    const accessor = col.getSortValue ?? ((v: any) => v);
    return [...filteredData].sort((a, b) => {
      let va: any = accessor(a[col.id] as any);
      let vb: any = accessor(b[col.id] as any);
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
  }, [filteredData, sortProperty, sortAsc]);

  if (!user || !ENABLE_AUTH) return null;
  return (
    <PageContainer meta={getPageSeoConfig('/favorites')} px={0} py={0}>
      <Flex direction='column' gap={4} px={{ base: 4, md: 40 }} py={8}>
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

      <Table
        ariaLabel='Repository matcher table'
        caption='Repositories and resource catalogs available for data deposit'
        columns={savedResourcesColumns}
        data={tableData as any}
        isLoading={isLoading}
        hasPagination={false}
        stickyHeader
        stickyFirstColumn={stickyFirstColumn}
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
            <Text color='gray.600'>Try broadening your search.</Text>
          </Flex>
        }
      />
    </PageContainer>
  );
}

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(UserFavouritesPage);
