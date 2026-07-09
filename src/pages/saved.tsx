/**
 * User Favorites Page - Protected route requiring authentication
 */

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { SavedDataErrorBanner } from 'src/views/saved/components/saved-data-error-banner';
import { useUserData } from 'src/hooks/useUserData';
import { useBatchResourcesData } from 'src/views/saved/hooks/useBatchResourcesData';
import { SavedResourceItem } from 'src/views/saved/types';

const SAVED_PAGE_COPY = {
  heading: 'Saved',
  description: 'Manage saved queries and resources.',
  devModeWarning: {
    title: 'Using mock user data in development mode',
    description:
      'In development mode, the page uses mock data to simulate saved queries and resources. This allows you to see how the page will look and function without needing real user data. In production, you will see your actual saved queries and resources.',
  },
};

const SavedPage = () => {
  const { user } = useAuth();
  const { savedDatasets, savedQueries, isDevMode } = useUserData();

  // Snapshot the saved items once, the first time they load, and render the
  // tables from that snapshot rather than from the live (shrinking) lists. This
  // keeps an un-bookmarked row visible — its bookmark icon flips to empty but the
  // row stays so the user can re-bookmark it — and rows only reconcile on refresh.
  // The live lists still drive each row's favorited state and the delete itself.
  const [displayQueries, setDisplayQueries] = useState<typeof savedQueries>([]);
  const [displayDatasets, setDisplayDatasets] = useState<typeof savedDatasets>(
    [],
  );
  const capturedQueries = useRef(false);
  const capturedDatasets = useRef(false);
  useEffect(() => {
    if (!capturedQueries.current && savedQueries.length > 0) {
      capturedQueries.current = true;
      setDisplayQueries(savedQueries);
    }
  }, [savedQueries]);
  useEffect(() => {
    if (!capturedDatasets.current && savedDatasets.length > 0) {
      capturedDatasets.current = true;
      setDisplayDatasets(savedDatasets);
    }
  }, [savedDatasets]);

  // Hydrate each saved resource with type / source / dateModified fetched by id.
  const datasetIds = useMemo(
    () => displayDatasets.map(dataset => dataset.dataset_id),
    [displayDatasets],
  );
  const { data: resourceData } = useBatchResourcesData(datasetIds);
  const enrichedDatasets = useMemo<SavedResourceItem[]>(
    () =>
      displayDatasets.map(dataset => ({
        ...dataset,
        ...resourceData?.[dataset.dataset_id],
      })),
    [displayDatasets, resourceData],
  );

  if (!user || !ENABLE_AUTH) return null;
  return (
    <PageContainer meta={getPageSeoConfig('/saved')} px={0} py={0}>
      <Flex direction='column' gap={4} px={{ base: 4, lg: 40 }} py={8}>
        <Heading as='h1' size='lg'>
          {SAVED_PAGE_COPY.heading}
        </Heading>
        <Text fontSize='md' lineHeight='short'>
          {SAVED_PAGE_COPY.description}
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
            <Text fontSize='sm' color='orange.800' fontWeight='semibold'>
              {SAVED_PAGE_COPY.devModeWarning.title}
            </Text>
            <Text fontSize='sm' color='orange.800' lineHeight='short'>
              {SAVED_PAGE_COPY.devModeWarning.description}
            </Text>
          </Box>
        )}
        <SavedDataErrorBanner />
      </Flex>
      <Divider />
      <SavedTableSection
        title='Saved Queries'
        description='A saved collection of frequently used queries.'
        columns={SAVED_QUERY_COLUMNS}
        data={displayQueries}
        getRowId={(item, idx) =>
          item.query + JSON.stringify(item.filters) || `__no-id-${idx}`
        }
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
        data={enrichedDatasets}
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
