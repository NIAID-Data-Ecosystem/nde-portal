import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
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

// Fetch Disease content from strapi
const MOCK_DATA = {
  id: 1,
  attributes: {
    title: 'Influenza',
    subtitle: '',
    description:
      "Influenza is a viral infection that attacks your respiratory system — your nose, throat and lungs. Influenza, commonly called the flu, is not the same as the stomach 'flu' viruses that cause diarrhea and vomiting.",
    query: {
      q: '"Influenza" OR "Flu"',
      facet_size: 1000,
      size: 0,
    },
    slug: 'influenza',
    topic: 'influenza',
    type: {
      data: [
        {
          id: 1,
          attributes: {
            name: 'Disease',
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
      ],
    },
    externalLinks: {
      data: [
        {
          id: 1,
          attributes: {
            label: 'National Institute of Allergy and Infectious Diseases',
            url: 'https://www.niaid.nih.gov/',
            categories: null,
            image: {
              data: {
                attributes: {
                  url: '/assets/NIH-logo.png',
                  alternativeText: 'nih logo',
                },
              },
            },
            isExternal: true,
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
        {
          id: 2,
          attributes: {
            label: 'CDC Influenza (Flu)',
            url: 'https://www.cdc.gov/flu/index.html',
            categories: null,
            image: { data: null },
            isExternal: true,
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
        {
          id: 3,
          attributes: {
            label:
              'Centers of Excellence for Influenza Research and Response (CEIRR)',
            url: 'https://www.niaid.nih.gov/research/centers-excellence-influenza-research-response',
            categories: {
              data: [
                {
                  id: 1,
                  attributes: {
                    name: 'Working Groups / Programs / Networks',
                    createdAt: '2025-02-22T19:09:45.049Z',
                    publishedAt: '2025-02-22T19:09:45.049Z',
                    updatedAt: '2025-02-22T19:09:45.049Z',
                  },
                },
              ],
            },
            image: { data: null },
            isExternal: true,
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
        {
          id: 4,
          attributes: {
            label:
              'Collaborative Influenza Vaccine Innovation Centers (CIVICs)',
            url: 'https://www.niaid.nih.gov/research/civics',
            categories: {
              data: [
                {
                  id: 1,
                  attributes: {
                    name: 'Working Groups / Programs / Networks',
                    createdAt: '2025-02-22T19:09:45.049Z',
                    publishedAt: '2025-02-22T19:09:45.049Z',
                    updatedAt: '2025-02-22T19:09:45.049Z',
                  },
                },
              ],
            },
            image: { data: null },
            isExternal: true,
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
        {
          id: 5,
          attributes: {
            label:
              'Mexican Emerging Infectious Disease Clinical Research Network (LaRed) ',
            url: 'https://www.niaid.nih.gov/research/lared',
            categories: {
              data: [
                {
                  id: 1,
                  attributes: {
                    name: 'Working Groups / Programs / Networks',
                    createdAt: '2025-02-22T19:09:45.049Z',
                    publishedAt: '2025-02-22T19:09:45.049Z',
                    updatedAt: '2025-02-22T19:09:45.049Z',
                  },
                },
              ],
            },
            image: { data: null },
            isExternal: true,
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
        {
          id: 6,
          attributes: {
            label: 'Modeling Immunity for Biodefense (MIB)',
            url: 'https://www.niaid.nih.gov/research/modeling-immunity-biodefense',
            categories: {
              data: [
                {
                  id: 1,
                  attributes: {
                    name: 'Working Groups / Programs / Networks',
                    createdAt: '2025-02-22T19:09:45.049Z',
                    publishedAt: '2025-02-22T19:09:45.049Z',
                    updatedAt: '2025-02-22T19:09:45.049Z',
                  },
                },
              ],
            },
            image: { data: null },
            isExternal: true,
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
        {
          id: 7,
          attributes: {
            label: 'Infectious Diseases Clinical Research Consortium',
            url: 'https://www.niaid.nih.gov/research/idcrc',
            categories: {
              data: [
                {
                  id: 1,
                  attributes: {
                    name: 'Working Groups / Programs / Networks',
                    createdAt: '2025-02-22T19:09:45.049Z',
                    publishedAt: '2025-02-22T19:09:45.049Z',
                    updatedAt: '2025-02-22T19:09:45.049Z',
                  },
                },
              ],
            },
            image: { data: null },

            isExternal: true,
            createdAt: '2025-02-22T19:09:45.049Z',
            updatedAt: '2025-02-22T19:09:45.049Z',
            publishedAt: '2025-02-22T19:09:45.049Z',
          },
        },
      ],
    },
    createdAt: '2025-02-22T19:09:45.049Z',
    updatedAt: '2025-02-22T19:09:45.049Z',
    publishedAt: '2025-02-22T19:09:45.049Z',
  },
};

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

    return MOCK_DATA;
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
            {/* Header section */}
            <HStack alignItems='flex-start' spacing={6} flexWrap='wrap'>
              <IntroSection
                title={data?.attributes.title}
                subtitle={data?.attributes.subtitle}
                description={data?.attributes.description}
                isLoading={isLoading}
              />

              {/* Sidebar */}
              <VStack
                spacing={4}
                alignItems='flex-start'
                flex={1}
                minWidth='300px'
              >
                {/* TO DO: Add sidebar content - either contact section for program collections or image for disease page. Pending feedback. */}
              </VStack>
            </HStack>

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
                title={`${totalQuery.data?.total.toLocaleString()} ${topic} Related Resources`}
              >
                <CardWrapper>
                  {/* Chart: Resource types */}
                  {query && <DataTypes query={query} topic={topic} />}
                  {query && <ConditionsOfAccess query={query} topic={topic} />}
                </CardWrapper>

                <CardWrapper mt={4}>
                  {/* Chart: Property Treemap/Brushable List*/}
                  {query && (
                    <PropertyTreemapLists query={query} topic={topic} />
                  )}
                </CardWrapper>
              </SectionWrapper>
            </SectionWrapper>

            {/* External links */}
            {(data?.attributes?.externalLinks?.data ?? []).length > 0 && (
              <SectionWrapper
                as='h3'
                id='external-links'
                title={`External Resources for ${topic}`}
              >
                <ExternalLinksSection
                  externalLinks={data?.attributes.externalLinks}
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
  // const paths = data.map((topic: TopicPageProps) => ({
  //   params: { slug: topic.attributes.slug },
  // }));
  const paths = [
    { params: { slug: undefined } },
    { params: { slug: ['influenza'] } },
  ];

  return { paths, fallback: false };
}

export default TopicPage;
