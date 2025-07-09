import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Error } from 'src/components/error';
import { PageContainer } from 'src/components/page-container';
import { fetchSearchResults } from 'src/utils/api';
import { fetchDiseaseBySlug, fetchAllDiseasePages } from 'src/utils/api/strapi';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { TableOfContents } from 'src/views/diseases/toc';
import { DiseasePageProps } from 'src/views/diseases/types';
import { DiseaseContent } from 'src/views/diseases/disease';

/**
 * DiseasePage fetches disease-specific content from Strapi and displays it in a structured layout.
 */
const DiseasePage: NextPage<{
  slug: string[];
  data: DiseasePageProps | null;
}> = props => {
  const { data: initialData, slug } = props;

  const { data, isLoading, error } = useQuery<DiseasePageProps, Error>({
    queryKey: ['disease', { slug }],
    queryFn: () => fetchDiseaseBySlug(slug[0]),
    initialData: initialData || undefined,
    refetchOnWindowFocus: false,
    enabled: !!slug && slug.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const query = data?.query;
  const topic =
    data?.topic?.charAt(0).toUpperCase().concat(data.topic.slice(1)) || '';

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
    enabled: params.q !== undefined && !!slug && slug.length > 0,
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
                'Its possible that the server is experiencing some issues.'}
            </Text>
          </Flex>
        </Error>
      ) : (
        <>
          {slug && slug.length > 0 ? (
            <DiseaseContent
              data={data}
              query={query}
              isLoading={isLoading}
              topic={topic}
              totalCount={totalQuery.data?.total || 0}
            />
          ) : (
            <TableOfContents />
          )}
        </>
      )}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  if (!context || !context.params || !context.params.slug) {
    return { props: { slug: [], data: null } };
  }

  const { slug } = context.params;

  try {
    const data = await fetchDiseaseBySlug(slug[0] as string);
    return { props: { slug, data } };
  } catch (error) {
    console.error('Error fetching disease data:', error);
    return { notFound: true };
  }
};

export async function getStaticPaths() {
  try {
    const diseases = await fetchAllDiseasePages();

    const paths = [
      { params: { slug: undefined } },
      ...diseases.map((disease: DiseasePageProps) => ({
        params: { slug: [disease.slug] },
      })),
    ];

    return { paths, fallback: false };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [{ params: { slug: undefined } }],
      fallback: false,
    };
  }
}

export default DiseasePage;
