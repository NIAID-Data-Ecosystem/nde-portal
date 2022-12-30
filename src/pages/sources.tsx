import type { NextPage } from 'next';
import React from 'react';
import { useQuery } from 'react-query';
import { Button, Flex, UnorderedList } from 'nde-design-system';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Main, Sidebar } from 'src/components/sources';
import { fetchMetadata } from 'src/utils/api';
import { Error, ErrorCTA } from 'src/components/error';
import { useRouter } from 'next/router';
import LoadingSpinner from 'src/components/loading';

const Sources: NextPage = () => {
  const router = useRouter();
  // Fetch metadata stats from API.
  const {
    data: sourceData,
    isLoading,
    error,
  } = useQuery(
    ['metadata'],
    fetchMetadata, // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false },
  );

  return (
    <PageContainer
      id='sources-page'
      hasNavigation
      title='Sources'
      metaDescription='NDE Discovery Portal - API data sources.'
      px={0}
      py={0}
      disableSearchBar
    >
      <Flex>
        {error && (
          <Error message="It's possible that the server is experiencing some issues.">
            <ErrorCTA>
              <Button onClick={() => router.reload()} variant='outline'>
                Reload the page
              </Button>
            </ErrorCTA>
          </Error>
        )}
        {!error && sourceData && (
          <>
            <Flex
              flexDirection='column'
              bg='page.alt'
              d={['none', 'none', 'flex']}
              w='50%'
              as='nav'
              aria-label='Navigation for data sources.'
              maxW='450px'
            >
              <UnorderedList
                display='flex'
                flexDirection='column'
                py={4}
                top={0}
                ml={0}
              >
                <Sidebar data={sourceData} />
              </UnorderedList>
            </Flex>
          </>
        )}

        <PageContent w='100%' flexDirection='column' bg='#fff'>
          {isLoading && <LoadingSpinner isLoading={isLoading} />}
          {!error && sourceData && <Main sourceData={sourceData} />}
        </PageContent>
      </Flex>
    </PageContainer>
  );
};

export default Sources;
