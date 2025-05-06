import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Error } from 'src/components/error';
import { PageContainer } from 'src/components/page-container';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { TableOfContents } from 'src/views/diseases/toc';
import { DiseasePageProps } from 'src/views/diseases/types';
import { DiseaseContent } from 'src/views/diseases/disease';
import ASTHMA_DATA from 'src/views/diseases/mock-data/asthma.json';
import HIV_DATA from 'src/views/diseases/mock-data/hiv-aids.json';
import INFLUENZA_DATA from 'src/views/diseases/mock-data/influenza.json';
import MALARIA_DATA from 'src/views/diseases/mock-data/malaria.json';
import TUBERCULOSIS_DATA from 'src/views/diseases/mock-data/tuberculosis.json';

const MOCK_PAGES = [
  ASTHMA_DATA,
  HIV_DATA,
  INFLUENZA_DATA,
  MALARIA_DATA,
  TUBERCULOSIS_DATA,
];

const fetchDiseaseContent = async (
  slug: string | string[],
): Promise<DiseasePageProps> => {
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
      (disease: DiseasePageProps) => disease.attributes.slug === slug[0],
    ) as DiseasePageProps;
  } catch (err: any) {
    throw err.response;
  }
};

/**
 * DiseasePage fetches disease-specific content and displays it in a structured layout.
 *
 * @example
 * ```tsx
 * <DiseasePage slug={['malaria']} data={initialData} />
 * ```
 */
const DiseasePage: NextPage<{
  slug: string[];
  data: DiseasePageProps;
}> = props => {
  const { data: initialData, slug } = props;

  const { data, isLoading, error } = useQuery<DiseasePageProps, Error>({
    queryKey: ['disease', { slug }],
    queryFn: () => fetchDiseaseContent(slug),
    placeholderData: initialData,
    refetchOnWindowFocus: true,
    enabled: !!slug,
  });

  const query = data?.attributes?.query;
  const topic =
    data?.attributes?.topic
      .charAt(0)
      .toUpperCase()
      .concat(data?.attributes.topic.slice(1)) || '';

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
    enabled: params.q !== undefined && !!slug,
  });

  return (
    <PageContainer
      id='disease-page'
      title='Disease'
      metaDescription='Spotlight on a disease topic.'
      px={0}
      py={0}
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
        <>
          {slug ? (
            <DiseaseContent
              data={data}
              query={query}
              isLoading={isLoading}
              topic={topic}
              totalCount={totalQuery.data?.total || 0}
            />
          ) : (
            <TableOfContents data={MOCK_PAGES} />
          )}
        </>
      )}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  if (!context || !context.params || !context.params.slug) {
    return { props: { slug: '', data: {} } };
  }
  const { slug } = context.params;
  // Fetch content from API.
  const data = await fetchDiseaseContent(slug);
  return { props: { slug, data } };
};

export async function getStaticPaths() {
  // [TO DO]: Fetch all disease page slugs from Strapi API
  // const { data } = await fetchAllDiseasePages();
  const mock_paths = MOCK_PAGES.map((disease: DiseasePageProps) => ({
    params: { slug: [disease.attributes.slug] },
  }));
  const paths = [{ params: { slug: undefined } }, ...mock_paths];
  return { paths, fallback: false };
}

export default DiseasePage;
