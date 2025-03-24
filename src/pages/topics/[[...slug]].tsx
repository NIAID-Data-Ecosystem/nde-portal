import { Box, Heading } from '@chakra-ui/react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { TopicPageProps } from 'src/views/topics/types';

// Fetch Disease content from strapi
const MOCK_DATA = {
  id: 1,
  attributes: {
    title: 'Influenza Datasets in the NIAID Data Ecosystem',
    subtitle: null,
    description: '',
    query: {
      q: '',
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

const TopicPage: NextPage<{
  slug: string[];
  data: TopicPageProps;
}> = props => {
  const { data } = props;
  return (
    <PageContainer
      title='Topic'
      metaDescription='Spotlight on a program collection or disease topic.'
      px={0}
      py={0}
    >
      <PageContent bg='#fff'>
        <Box>
          <Heading as='h1' size='xl'>
            {data.attributes.title}
          </Heading>
          <Box
            w={20}
            h={1.5}
            my={4}
            bgGradient='linear(to-r, secondary.500, primary.400)'
          />
        </Box>
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
