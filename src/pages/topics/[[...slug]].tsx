import {
  Box,
  Flex,
  Heading,
  HStack,
  SkeletonText,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Error } from 'src/components/error';
import { useQuery } from '@tanstack/react-query';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { TopicPageProps } from 'src/views/topics/types';
import { IntroSection } from 'src/views/topics/layouts/intro';
import { SectionTitle, SectionWrapper } from 'src/views/topics/layouts/section';
import { Link } from 'src/components/link';
import { CardWrapper } from 'src/views/topics/layouts/card';
import { DataTypesChart } from 'src/views/topics/components/data-types-chart';
import { encodeString } from 'src/utils/querystring-helpers';

// Fetch Disease content from strapi
const MOCK_DATA = {
  id: 1,
  attributes: {
    title: 'Influenza Datasets in the NIAID Data Ecosystem',
    subtitle:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
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
  const topic =
    data?.attributes.topic
      .charAt(0)
      .toUpperCase()
      .concat(data?.attributes.topic.slice(1)) || 'Topic';
  console.log(
    'q',
    data?.attributes.query.q,
    encodeString(data?.attributes.query.q || ''),
  );
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
            maxW={{ base: 'unset', lg: '70%' }}
            width='100%'
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
              title={`${topic} Datasets in the NIAID Data Ecosystem`}
            >
              <Text mb={2}>
                This section provides a visual summary of the resources
                available within the NIAID Discovery Portal for {topic}{' '}
                research.{' '}
                <Link href={`/search?q=${data?.attributes.query.q}`}>
                  View all search results related to {topic}
                </Link>
                .
              </Text>
              {/* Overview Section */}
              <SectionWrapper as='h3' id='overview' title='Overview'>
                <CardWrapper>
                  <DataTypesChart
                    query={data?.attributes.query}
                    topic={topic}
                  />
                </CardWrapper>
                {/* TO DO: Add visualisations */}
              </SectionWrapper>
            </SectionWrapper>
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
