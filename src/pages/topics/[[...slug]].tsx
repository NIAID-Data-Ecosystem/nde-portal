import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Error } from 'src/components/error';
import { Link } from 'src/components/link';
import { PageContainer, PageContent } from 'src/components/page-container';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { ConditionsOfAccess } from 'src/views/topics/components/conditions-of-access';
import { IntroSection } from 'src/views/topics/layouts/intro';
import { SectionWrapper } from 'src/views/topics/layouts/section';
import { TopicPageProps } from 'src/views/topics/types';
import { DataTypes } from 'src/views/topics/components/data-types';
import { PropertyTreemapLists } from 'src/views/topics/components/property-treemap-lists';
import { CardWrapper } from 'src/views/topics/layouts/card';
import { ExternalLinksSection } from 'src/views/topics/components/external-links';
import INFLUENZA_DATA from 'src/views/topics/mock-data/influenza.json';
import MALARIA_DATA from 'src/views/topics/mock-data/malaria.json';
import CREID_DATA from 'src/views/topics/mock-data/creid.json';
import { Sources } from 'src/views/topics/components/sources';

const MOCK_PAGES = [INFLUENZA_DATA, MALARIA_DATA, CREID_DATA];

const fetchTopicContent = async (
  slug: string | string[],
): Promise<TopicPageProps> => {
  try {
    // const isProd =
    //   process.env.NEXT_PUBLIC_BASE_URL === 'https://data.niaid.nih.gov';
    // const topics = await axios.get(
    //   `${
    //     process.env.NEXT_PUBLIC_STRAPI_API_URL
    //   }/api/features?populate=*&filters[$and][0][slug][$eqi]=${slug}&publicationState=${
    //     isProd ? 'live' : 'preview'
    //   }`,
    // );

    return MOCK_PAGES.find(
      (topic: TopicPageProps) => topic.attributes.slug === slug[0],
    ) as TopicPageProps;
  } catch (err: any) {
    throw err.response;
  }
};

/**
 * TopicPage fetches topic-specific and displays it in a structured layout.
 *
 *
 * @example
 * ```tsx
 * <TopicPage slug={['malaria']} data={initialData} />
 * ```
 *
 * @todo
 * - Add sidebar content for program collections or disease pages.
 * - Add visualizations to the overview section.
 */
const TopicPage: NextPage<{
  slug: string[];
  data: TopicPageProps;
}> = props => {
  const { data: initialData, slug } = props;

  const { data, isLoading, error } = useQuery<TopicPageProps, Error>({
    queryKey: ['topic', { slug }],
    queryFn: () => fetchTopicContent(slug),
    placeholderData: initialData,
    refetchOnWindowFocus: true,
  });

  const query = data?.attributes.query;
  const topic =
    data?.attributes.topic
      .charAt(0)
      .toUpperCase()
      .concat(data?.attributes.topic.slice(1)) || 'Topic';

  // Fetch total number of results for the topic
  const params = {
    q: query?.q || '',
    facet_size: query?.facet_size,
    extra_filter: query?.extra_filter,
    facets: '@type',
    size: 0,
  };

  const totalQuery = useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    { total: number }
  >({
    queryKey: ['search-results', params],
    queryFn: async () => {
      if (!params.q) {
        return undefined;
      }
      return await fetchSearchResults(params);
    },
    enabled: params.q !== undefined,
  });

  const totalResourcesCount = totalQuery.data?.total.toLocaleString() || 0;

  console.log(params);
  return (
    <PageContainer
      id='topic-page'
      title='Topic'
      metaDescription='Spotlight on a program collection or disease topic.'
      px={0}
      py={0}
    >
      <PageContent
        id='topic-page-content'
        bg='#fff'
        justifyContent='center'
        maxW={{ base: 'unset', lg: '1600px' }}
        margin='0 auto'
        px={4}
        py={4}
        mb={32}
        mt={16}
        flex={1}
      >
        {error ? (
          <Error>
            <Flex flexDirection='column' justifyContent='center'>
              <Text fontWeight='light' color='gray.600' fontSize='lg'>
                API Request:{' '}
                {error?.message ||
                  'It’s possible that the server is experiencing some issues.'}{' '}
              </Text>
            </Flex>
          </Error>
        ) : (
          <Flex
            flexDirection='column'
            flex={1}
            pb={32}
            width='100%'
            // maxW={{ base: 'unset', lg: '70%' }}
            m='0 auto'
          >
            {/* Topic Header */}
            <IntroSection
              title={data?.attributes.title}
              subtitle={data?.attributes.subtitle}
              description={data?.attributes.description}
              links={data?.attributes.contactLinks}
              params={params}
              isLoading={isLoading}
            />
            <SectionWrapper
              id='about-datasets'
              title={`${topic} Resources in the NIAID Data Ecosystem`}
              mt={10}
            >
              <Text mb={2}>
                This section provides a visual summary of the resources
                available within the NIAID Discovery Portal for {topic}{' '}
                research.{' '}
                <Link href={`/search?q=${data?.attributes.query.q}`}>
                  {`View all search results related to ${topic}`}
                </Link>
                .
              </Text>
              {/* Overview Section */}
              <SectionWrapper
                as='h3'
                id='overview'
                title={`${totalResourcesCount} ${topic} Related Resources`}
              >
                <CardWrapper>
                  {/* Chart: Property Treemap/Brushable List*/}
                  {query && (
                    <PropertyTreemapLists query={query} topic={topic} />
                  )}
                </CardWrapper>

                <CardWrapper flexDirection='row' flexWrap='wrap' mt={6}>
                  <VStack w='100%' spacing={4} flex={3}>
                    {/* Chart: Resource types */}
                    {query && <DataTypes query={query} topic={topic} />}

                    {/* Chart: Sources | Place under the sources charts on smaller screens */}
                    {query && (
                      <Flex
                        w='100%'
                        flexDirection='column'
                        flex={1}
                        minWidth={200}
                        display={{ base: 'flex', lg: 'none' }}
                      >
                        <Sources query={query} topic={topic} />
                      </Flex>
                    )}
                    {/* Chart: Conditions of Access */}
                    {query && (
                      <ConditionsOfAccess query={query} topic={topic} />
                    )}
                  </VStack>

                  {/* Chart: Sources | Place beside the other charts on larger screens */}
                  {query && (
                    <Flex
                      w='100%'
                      flexDirection='column'
                      flex={1}
                      minWidth={200}
                      display={{ base: 'none', lg: 'flex' }}
                    >
                      <Sources query={query} topic={topic} />
                    </Flex>
                  )}
                </CardWrapper>
              </SectionWrapper>
            </SectionWrapper>
            {/* External links */}
            {data &&
              (data?.attributes?.externalLinks?.data ?? []).length > 0 && (
                <SectionWrapper
                  as='h3'
                  id='external-links'
                  title={`External Resources for ${topic}`}
                >
                  <ExternalLinksSection
                    externalLinks={data.attributes.externalLinks}
                  />
                </SectionWrapper>
              )}
          </Flex>
        )}
      </PageContent>
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  if (!context || !context.params || !context.params.slug) {
    return { props: { slug: '', data: {} } };
  }
  const { slug } = context.params;
  // Fetch content from API.
  const data = await fetchTopicContent(slug);
  return { props: { slug, data } };
};

export async function getStaticPaths() {
  // [TO DO]: Fetch all topic page slugs from Strapi API
  // const { data } = await fetchAllTopicPages();
  const mock_paths = MOCK_PAGES.map((topic: TopicPageProps) => ({
    params: { slug: [topic.attributes.slug] },
  }));
  const paths = [{ params: { slug: undefined } }, ...mock_paths];
  console.log(paths);
  return { paths, fallback: false };
}

export default TopicPage;
