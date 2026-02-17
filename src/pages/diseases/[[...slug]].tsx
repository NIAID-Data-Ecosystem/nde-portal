import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Error } from 'src/components/error';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  fetchDiseaseBySlug,
  fetchAllDiseasePages,
} from 'src/views/diseases/helpers';
import { TableOfContents } from 'src/views/diseases/toc';
import { DiseasePageProps } from 'src/views/diseases/types';
import { DiseaseContent } from 'src/views/diseases/disease';
import SITE_CONFIG from 'configs/site.config.json';
import { SiteConfig } from 'src/components/page-container/types';

const siteConfig = SITE_CONFIG as SiteConfig;
/**
 * DiseasePage fetches disease-specific content from Strapi and displays it in a structured layout.
 */
const DiseasePage: NextPage<{
  slug: string[];
  data: DiseasePageProps | null;
}> = props => {
  const { data: initialData, slug } = props;

  const hasSlug = !!slug && slug.length > 0;

  const { data, isLoading, error } = useQuery<DiseasePageProps, Error>({
    queryKey: ['disease', { slug }],
    queryFn: () => fetchDiseaseBySlug(slug[0]),
    initialData: initialData || undefined,
    refetchOnWindowFocus: false,
    enabled: hasSlug,
    // staleTime: 5 * 60 * 1000, // 5 minutes
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
    enabled: params.q !== undefined && hasSlug,
  });

  const pageTitle =
    data?.title || siteConfig.pages['/diseases'].nav?.label || 'Diseases';

  return (
    <PageContainer
      id='disease-page'
      meta={getPageSeoConfig('/diseases', {
        title: data?.title || siteConfig.pages['/diseases'].seo.title,
        description: data?.topic
          ? `Explore datasets and research resources for ${data.topic}, including clinical, molecular, and experimental data.`
          : siteConfig.pages['/diseases'].seo.description,
        // append topic to keywords if available
        keywords: siteConfig.pages['/diseases'].seo.keywords?.concat(
          topic ? [topic] : [],
        ),
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/diseases/${slug?.[0] || ''}`,
      })}
      breadcrumbsTitle={pageTitle}
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
          {hasSlug ? (
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
    // Handle both string and string array cases
    const slugValue = Array.isArray(slug) ? slug[0] : slug;
    const data = await fetchDiseaseBySlug(slugValue);

    // Ensure slug is always returned as an array for consistency
    const normalizedSlug = Array.isArray(slug) ? slug : [slug];

    return { props: { slug: normalizedSlug, data } };
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
