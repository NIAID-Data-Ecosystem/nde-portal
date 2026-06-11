/**
 * User Favorites Page - Protected route requiring authentication
 */

import { Box, Heading, Text, Flex, Divider } from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import {
  SAVED_QUERY_COLUMNS,
  SAVED_RESOURCE_COLUMNS,
} from 'src/views/saved/table-config';
import { SavedTableSection } from 'src/views/saved/components/saved-table-section';
import { useUserData } from 'src/hooks/useUserData';

const SavedPage = () => {
  const { user } = useAuth();
  const { savedDatasets, savedQueries, isDevMode } = useUserData();

  if (!user || !ENABLE_AUTH) return null;
  return (
    <PageContainer meta={getPageSeoConfig('/saved')} px={0} py={0}>
      <Flex direction='column' gap={4} px={{ base: 4, lg: 40 }} py={8}>
        <Heading as='h1' size='lg'>
          Saved
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
      <SavedTableSection
        title='Saved Queries'
        description='A saved collection of frequently used queries.'
        columns={SAVED_QUERY_COLUMNS}
        data={savedQueries}
        getRowId={(item, idx) => item.query || `__no-id-${idx}`}
        unit={{ singular: 'item', plural: 'items' }}
        searchPlaceholder='Search saved queries'
        searchAriaLabel='Search saved queries'
        tableAriaLabel='Saved queries table'
        caption='Saved queries are searches that you have bookmarked.'
        tableContainerProps={{
          overflowX: 'auto' as const,
          maxHeight: '300px',
          w: '100%',
          bg: 'white',
          overflowY: 'auto' as const,
        }}
      />
      <SavedTableSection
        title='Saved Resources'
        description='A saved collection of datasets, computational tools, and other records.'
        columns={SAVED_RESOURCE_COLUMNS}
        data={savedDatasets}
        getRowId={(item, idx) => item.dataset_id || `__no-id-${idx}`}
        unit={{ singular: 'item', plural: 'items' }}
        searchPlaceholder='Search saved resources'
        searchAriaLabel='Search saved resources'
        tableAriaLabel='Saved resources table'
        caption='Saved resources include datasets, computational tools, and other records that you have favorited.'
        tableContainerProps={{
          overflowX: 'auto' as const,
          maxHeight: '350px',
          w: '100%',
          bg: 'white',
          overflowY: 'auto' as const,
        }}
      />
    </PageContainer>
  );
};

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(SavedPage);
