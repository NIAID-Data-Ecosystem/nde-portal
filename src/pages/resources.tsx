import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getResourceById } from 'src/utils/api';
import { FormattedResource } from 'src/utils/api/types';
import Empty from 'src/components/empty';
import { Box, Button, Card, Flex, Text } from 'nde-design-system';
import {
  Navigation,
  ResourceLinks,
} from 'src/components/resource-sections/components';
import { Error, ErrorCTA } from 'src/components/error';
import Sections, { section_metadata } from 'src/components/resource-sections';
import navigationData from 'configs/resource-sections.json';
import { Route, showSection } from 'src/components/resource-sections/helpers';

// Error display is data fetching goes wrong.
const ErrorState = ({ retryFn }: { retryFn: () => void }) => {
  return (
    <Error message="It's possible that the server is experiencing some issues.">
      <ErrorCTA>
        <Button onClick={() => retryFn()} variant='outline'>
          Retry
        </Button>
      </ErrorCTA>
    </Error>
  );
};

// Displays empty message when no data exists.
const EmptyState = () => {
  return (
    <Card w='100%'>
      <Empty message='No data available.' alignSelf='center' h='50vh'>
        <Text>No information about this dataset is available.</Text>
        <Button as={'a'} href='/' mt={4}>
          Go to search.
        </Button>
      </Empty>
    </Card>
  );
};

const ResourcePage: NextPage = props => {
  const router = useRouter();
  const { id } = router.query;

  // Access query client
  const { isLoading, error, data } = useQuery<
    FormattedResource | undefined,
    Error
  >(['search-result', { id }], () => getResourceById(id), {
    refetchOnWindowFocus: false,
  });

  // embed metadata
  useEffect(() => {
    if (data && data.rawData) {
      let script_tag = document.createElement('script');
      let metadata = JSON.stringify(data.rawData, null, 2);
      script_tag.setAttribute('type', 'application/ld+json');
      script_tag.text = metadata;
      document.head.appendChild(script_tag);
    }
  }, [data]);

  // embed altmetric data. For more information: https://api.altmetric.com/embeds.html
  useEffect(() => {
    // @ts-ignore
    if (window._altmetric_embed_init) {
      // @ts-ignore
      window._altmetric_embed_init();
    } else {
      /* import altmetric script for badge embeds */
      let altmetricsScript = document.createElement('script');
      altmetricsScript.setAttribute(
        'src',
        'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
      );
      document.body.appendChild(altmetricsScript);
    }
  }, [data]);

  if (!id) {
    return <></>;
  }

  const { routes } = navigationData as {
    title: string;
    routes: Route[];
  };

  // Check if the metadata is available for a given section before displaying it in navbar or page.
  const sections = routes.filter(route =>
    showSection(
      { ...route, metadataProperties: section_metadata[route.hash] },
      data,
    ),
  );

  return (
    <>
      <PageContainer
        hasNavigation
        title='Resource'
        metaDescription='Selected search result page.'
      >
        <PageContent>
          {error ? (
            // [ERROR STATE]: API response error
            <ErrorState retryFn={() => router.reload()} />
          ) : !isLoading && !data ? (
            // [EMPTY STATE]: No Results
            <EmptyState />
          ) : (
            <Flex w='100%' h='100%' flexDirection='column' minW={150}>
              <Flex
                height='100%'
                p={2}
                flexDirection={['column', 'column', 'row']}
              >
                <Card
                  flex={3}
                  p={0}
                  width='100%'
                  sx={{ '>*': { p: 0 } }}
                  minW={150}
                >
                  <Sections
                    isLoading={isLoading}
                    data={data}
                    sections={sections}
                  />
                </Card>
                <Box
                  flex={1}
                  position='sticky'
                  top='80px'
                  w='100%'
                  h='100%'
                  minW='350px'
                  display={{ base: 'none', lg: 'block' }}
                >
                  <Card
                    flex={1}
                    ml={[0, 0, 4]}
                    my={[2, 2, 0]}
                    sx={{ '>*': { p: 0 } }}
                  >
                    {/* Show external links such as source url, in header when on mobile */}
                    <ResourceLinks
                      isLoading={isLoading}
                      includedInDataCatalog={data?.includedInDataCatalog}
                      mainEntityOfPage={data?.mainEntityOfPage}
                      codeRepository={data?.codeRepository}
                      hasPart={data?.hasPart}
                      url={data?.url}
                    />
                    {/* <RelatedDatasets /> */}
                  </Card>

                  {/* Local navigation for page */}
                  {sections.length > 0 && <Navigation routes={sections} />}
                </Box>
              </Flex>
            </Flex>
          )}
        </PageContent>
      </PageContainer>
    </>
  );
};

export default ResourcePage;
