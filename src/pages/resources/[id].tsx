import React, {useEffect, useState} from 'react';
import type {NextPage} from 'next';
import PageContainer, {PageContent} from 'src/components/page-container';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import {getResourceById} from 'src/utils/api';
import {FormattedResource} from 'src/utils/api/types';
import Empty from 'src/components/empty';
import {
  Box,
  Button,
  ButtonProps,
  Card,
  Flex,
  Text,
  useBreakpointValue,
} from 'nde-design-system';
import {
  Navigation,
  RelatedDatasets,
  ResourceHeader,
  ResourceOverview,
  ResourceTabs,
  ResourceLinks,
  ResourceFilesTable,
  ResourceProvenance,
} from 'src/components/resource';
import {FaChevronLeft} from 'react-icons/fa';
import {useLocalStorage} from 'usehooks-ts';
import Head from 'next/head';

/*
To do:
[ ] Empty case
[ ] Loading case
[ ] Error case
*/

const Dataset: NextPage = props => {
  const router = useRouter();
  const {id} = router.query;

  // Check if mobile
  const isMobile = useBreakpointValue({base: true, md: false});

  // Fetch search term from local storage
  const [searchQuery] = useLocalStorage('nde-search-query', '');

  // Access query client
  const {isLoading, error, data} = useQuery<
    FormattedResource | undefined,
    Error
  >(['search-result', {id}], () => getResourceById(id));

  if (!id) {
    return <></>;
  }
  if (error || !id) {
    return <div>something went wrong</div>;
  }

  const SearchResultsButton: React.FC<ButtonProps> = props => {
    return (
      <Button
        onClick={() =>
          router.push(searchQuery ? `/search?${searchQuery}` : '/')
        }
        my={4}
        leftIcon={<FaChevronLeft />}
        {...props}
      >
        Go back to results
      </Button>
    );
  };

  return (
    <>
      <PageContainer
        hasNavigation
        title='Dataset'
        metaDescription='Selected search result page.'
      >
        {/* Empty State */}
        {!isLoading && !data ? (
          <Card w='100%'>
            <Empty
              message='No data'
              imageUrl='/assets/dataset.png'
              imageAlt='dataset icon'
            >
              <Text>No data, please try again.</Text>
              <SearchResultsButton />
            </Empty>
          </Card>
        ) : (
          <Flex w='100%' h='100%' flexDirection='column' minW={300}>
            <SearchResultsButton variant='link' alignSelf='start' />
            <Flex
              height='100%'
              p={2}
              flexDirection={['column', 'column', 'row']}
            >
              <Card flex={3} p={0} width='100%'>
                <Box p={4}>
                  <ResourceHeader
                    isLoading={isLoading}
                    conditionsOfAccess={data?.conditionsOfAccess}
                    author={data?.author}
                    datePublished={data?.datePublished}
                    name={data?.name}
                  />
                  {isMobile && (
                    <ResourceLinks
                      isLoading={isLoading}
                      url={data?.url}
                      includedInDataCatalog={data?.curatedBy}
                    />
                  )}
                </Box>
                <Navigation resourceType={data?.type} />
                <section id='overview'>
                  <ResourceOverview
                    isLoading={isLoading}
                    doi={data?.doi}
                    keywords={data?.keywords}
                    language={data?.language}
                    license={data?.license}
                    numberOfDownloads={data?.numberOfDownloads}
                    numberOfViews={data?.numberOfViews}
                    spatialCoverage={data?.spatialCoverage}
                    temporalCoverage={data?.temporalCoverage}
                  />
                </section>

                <section id='description'>
                  <ResourceTabs
                    isLoading={isLoading}
                    description={data?.description}
                    citation={data?.citation}
                    citedBy={data?.appearsIn}
                  />
                </section>
                <section id='files'>
                  <ResourceFilesTable
                    isLoading={true}
                    distribution={data?.distribution}
                  />
                </section>
                <section id='provenance'>
                  <ResourceProvenance
                    isLoading={isLoading}
                    curatedBy={data?.curatedBy}
                  />
                </section>
              </Card>
              <Card flex={1} ml={[0, 0, 4]} my={[2, 2, 0]} p={0}>
                <Box position={'sticky'} top={'80px'} w={'100%'} h={'60vh'}>
                  {/* Show external links in header when on mobile */}
                  {!isMobile && (
                    <ResourceLinks
                      isLoading={isLoading}
                      url={data?.url}
                      includedInDataCatalog={data?.curatedBy}
                    />
                  )}
                  <RelatedDatasets />
                </Box>
              </Card>
            </Flex>
          </Flex>
        )}
      </PageContainer>
    </>
  );
};

export default Dataset;
