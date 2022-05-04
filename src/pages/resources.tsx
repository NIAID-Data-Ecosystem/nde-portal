import React, {useEffect} from 'react';
import type {NextPage} from 'next';
import {
  PageContainer,
  PageContent,
  SearchBar,
} from 'src/components/page-container';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import {getResourceById} from 'src/utils/api';
import {FormattedResource} from 'src/utils/api/types';
import Empty from 'src/components/empty';
import {ButtonGroup} from '@chakra-ui/button';
import {
  Box,
  Button,
  Card,
  Flex,
  Skeleton,
  Tag,
  Text,
  useBreakpointValue,
} from 'nde-design-system';
import {
  ResourceHeader,
  ResourceOverview,
  ResourceLinks,
  ResourceFilesTable,
  ResourceProvenance,
  Section,
  TypeBanner,
} from 'src/components/resource';
import ErrorMessage from 'src/components/error';
import LocalNavigation, {
  showSection,
} from 'src/components/resource/components/local-navigation';
import SectionsConfig from 'configs/resource-sections.json';
import {assetPrefix} from 'next.config';

// Error display is data fetching goes wrong.
const ErrorState = ({retryFn}: {retryFn: () => void}) => {
  return (
    <ErrorMessage message="It's possible that the server is experiencing some issues.">
      <ButtonGroup>
        <Button onClick={() => retryFn()} variant='outline'>
          Retry
        </Button>
        <Button as='a' href='/'>
          Back to Home
        </Button>
      </ButtonGroup>
    </ErrorMessage>
  );
};

// Displays empty message when no data exists.
const EmptyState = () => {
  return (
    <Card w='100%'>
      <Empty
        message='No data available.'
        imageUrl={`${assetPrefix}/assets/empty.png`}
        imageAlt='Missing information icon.'
        alignSelf='center'
        h='50vh'
      >
        <Text>No information about this dataset is available.</Text>
        <Button as={'a'} href='/' mt={4}>
          Go to search.
        </Button>
      </Empty>
    </Card>
  );
};

// use config file to show content in sections.
const SectionContent = ({
  id,
  isLoading,
  data,
  metadataProperties,
}: {
  id: string;
  isLoading: boolean;
  data?: FormattedResource;
  metadataProperties: (keyof FormattedResource)[];
}) => {
  // [metadataProperties] represents the properties that are required in the section.
  const sectionData = metadataProperties.reduce(
    (r: Partial<FormattedResource>, v) => {
      if (data) {
        r[v] = data[v];
      }
      return r;
    },
    {},
  );

  if (id === 'overview') {
    return <ResourceOverview isLoading={isLoading} {...sectionData} />;
  }
  if (id === 'keywords') {
    return (
      <Skeleton isLoaded={!isLoading}>
        <Flex flexWrap='wrap'>
          {data?.keywords &&
            data.keywords.map(keyword => {
              return (
                <Tag key={keyword} m={2} colorScheme='primary'>
                  {keyword}
                </Tag>
              );
            })}
        </Flex>
      </Skeleton>
    );
  }
  /* Show description*/
  if (id === 'description') {
    return data?.description ? (
      <Box
        overflow='auto'
        w='100%'
        fontSize='sm'
        dangerouslySetInnerHTML={{
          __html: data.description,
        }}
      ></Box>
    ) : null;
  }

  /* Show metadata*/
  if (id === 'metadata') {
    return data?.rawData ? (
      <Box maxHeight={500} overflow='auto' w='100%' tabIndex={0}>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            padding: '2rem',
          }}
        >
          <Text fontSize={'10px'}>{JSON.stringify(data.rawData, null, 2)}</Text>
        </pre>
      </Box>
    ) : null;
  }

  /* Show where the data is retrieved from. */
  if (id === 'provenance') {
    return <ResourceProvenance isLoading={isLoading} {...sectionData} />;
  }

  /* Show all available downloads */
  if (id === 'downloads') {
    return <ResourceFilesTable isLoading={isLoading} {...sectionData} />;
  }

  /* Show where funding for the resource came from. */
  if (id === 'funding') {
    return (
      <ResourceFilesTable
        isLoading={isLoading}
        // @ts-ignore
        // [TO DO ]: create generic table component.
        distribution={data?.funding?.map(f => ({
          identifier: f.identifier,
          ...f.funder,
          description: f.description || f.funder?.description,
          url: f.funder?.url || f.url,
        }))}
        {...sectionData}
      />
    );
  }

  {
    /* Where has the resource been cited */
  }
  if (id === 'citedBy') {
    return (
      <ResourceFilesTable
        isLoading={true}
        // @ts-ignore
        // [TO DO ]: create generic table component.
        distribution={data?.citedBy?.map(c => {
          return {
            doi: c.doi,
            name: c.name,
            pmid: c.pmid,
            url: c.url,
          };
        })}
      />
    );
  }

  return null;
};

const ResourcePage: NextPage = props => {
  const router = useRouter();
  const {id} = router.query;

  // Check if mobile
  const isMobile = useBreakpointValue({base: true, md: false});
  // Access query client
  const {isLoading, error, data} = useQuery<
    FormattedResource | undefined,
    Error
  >(['search-result', {id}], () => getResourceById(id), {
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
  return (
    <>
      <PageContainer
        hasNavigation
        title='Resource'
        metaDescription='Selected search result page.'
      >
        <SearchBar
          value={router.query.q || ''}
          ariaLabel='Search for datasets or tools'
        />
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
                  sx={{'>*': {p: 0}}}
                  minW={150}
                >
                  <Section id={'header'} p={0}>
                    <ResourceHeader
                      isLoading={isLoading}
                      conditionsOfAccess={data?.conditionsOfAccess}
                      author={data?.author}
                      citation={data?.citation}
                      name={data?.name}
                    />
                    {/* Banner showing data type and publish date. */}
                    <TypeBanner type={data?.type} date={data?.date} />
                  </Section>
                  {SectionsConfig.routes.map(route => {
                    const section = route as {
                      title: string;
                      hash: string;
                      metadataProperties: (keyof FormattedResource)[];
                      showEmpty?: boolean;
                      isCollapsible?: boolean;
                    };

                    // Determine if should show section if no data is available.
                    if (!showSection(section, data)) {
                      return null;
                    }
                    return (
                      <Section
                        id={section.hash}
                        key={section.hash}
                        name={section.title}
                        isLoading={isLoading}
                        isCollapsible={section.isCollapsible}
                      >
                        <SectionContent
                          id={section.hash}
                          isLoading={isLoading}
                          data={data}
                          metadataProperties={section.metadataProperties}
                        />
                        {/* Display external links under overview if in mobile view. */}
                        {section.hash === 'overview' && isMobile && (
                          <ResourceLinks
                            isLoading={isLoading}
                            includedInDataCatalog={data?.includedInDataCatalog}
                            url={data?.url}
                          />
                        )}
                      </Section>
                    );
                  })}
                </Card>
                <Box
                  flex={1}
                  position='sticky'
                  top='80px'
                  w='100%'
                  h='100%'
                  minW='300px'
                >
                  <Card
                    flex={1}
                    ml={[0, 0, 4]}
                    my={[2, 2, 0]}
                    sx={{'>*': {p: 0}}}
                  >
                    {/* Show external links such as source url, in header when on mobile */}
                    {!isMobile && (
                      <ResourceLinks
                        isLoading={isLoading}
                        includedInDataCatalog={data?.includedInDataCatalog}
                        mainEntityOfPage={data?.mainEntityOfPage}
                        codeRepository={data?.codeRepository}
                        url={data?.url}
                      />
                    )}
                    {/* <RelatedDatasets /> */}
                  </Card>

                  {/* Navigation for page */}
                  <Card
                    display={{base: 'none', md: 'flex'}}
                    flex={1}
                    ml={[0, 0, 4]}
                    my={2}
                    sx={{'>*': {p: [2, 4, 4, 6]}}}
                  >
                    <LocalNavigation data={data} />
                  </Card>
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
