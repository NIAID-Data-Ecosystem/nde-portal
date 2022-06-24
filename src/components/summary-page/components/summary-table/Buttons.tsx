import React from 'react';
import { Box, Button, Flex } from 'nde-design-system';
import { useQuery } from 'react-query';
import { fetchAllSearchResults } from 'src/utils/api';
import { queryFilterObject2String } from 'src/components/filter/helpers';
import { SelectedFilterType } from '../hooks';
import { DownloadMetadata } from 'src/components/download-metadata';
import Banner from 'src/components/banner';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { FaSearch } from 'react-icons/fa';

interface SummaryTableProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
}

export const Buttons: React.FC<SummaryTableProps> = ({
  queryString,
  filters,
}) => {
  const router = useRouter();
  // Get all data for download
  const {
    error: metadataError,
    refetch,
    isFetching,
  } = useQuery<any | undefined, Error>(
    [
      'all-search-results',
      {
        q: queryString,
        filters,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }
      const filter_string = queryFilterObject2String(filters);

      return fetchAllSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `${queryString}`,
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false, enabled: false },
  );

  return (
    <>
      {metadataError && (
        <Box my={2}>
          <Banner status='error'>
            Something went wrong with the metadata download. Try again.
          </Banner>
        </Box>
      )}
      <Flex
        w='100%'
        justifyContent='space-between'
        pb={4}
        alignItems='center'
        flexWrap='wrap'
      >
        <NextLink href={router.asPath.replace('summary', 'search')} passHref>
          <Button leftIcon={<FaSearch />} my={2}>
            View in search results page
          </Button>
        </NextLink>
        <Box my={2}>
          <DownloadMetadata
            exportName='nde-results'
            loadMetadata={() =>
              refetch().then(response => response.data?.results)
            }
            colorScheme='primary'
            variant='outline'
            isLoading={isFetching}
          >
            Download Metadata
          </DownloadMetadata>
        </Box>
      </Flex>
    </>
  );
};
