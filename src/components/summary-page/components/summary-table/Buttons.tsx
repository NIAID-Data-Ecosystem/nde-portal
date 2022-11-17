import React from 'react';
import { Box, Button, Flex } from 'nde-design-system';
import { queryFilterObject2String } from 'src/components/filters';
import { DownloadMetadata } from 'src/components/download-metadata';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { FaSearch } from 'react-icons/fa';
import { SelectedFilterType } from 'src/components/filters/types';

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
  // Query Parameter
  const filter_string = queryFilterObject2String(filters);
  const params = {
    q: queryString
      ? filter_string
        ? `${
            queryString === '__all__' ? '' : `${queryString} AND `
          }${filter_string}`
        : `${queryString}`
      : null,
  };

  return (
    <>
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
            variant='outline'
            params={params}
          >
            Download Metadata
          </DownloadMetadata>
        </Box>
      </Flex>
    </>
  );
};
