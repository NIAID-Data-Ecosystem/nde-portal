import { scaleOrdinal } from '@visx/scale';
import { UrlObject } from 'url';
import { Params } from 'src/utils/api';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from '../search/components/filters/utils/query-builders';
import {
  DiseasePageProps,
  DiseaseCollectionApiResponse,
} from 'src/views/diseases/types';

// Get Strapi base URL with error handling
const getStrapiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_STRAPI_API_URL environment variable is required',
    );
  }
  return url;
};

// Determine the correct status based on environment
const getContentStatus = (): string => {
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  return isProd ? 'published' : 'draft';
};

// Color scale for data types.
export const getFillColor = scaleOrdinal({
  domain: ['Dataset', 'ComputationalTool', 'ResourceCatalog'],
  range: ['#e8c543', '#ff8359', '#6e95fc'],
});

// Helper function to generate a URL object for search results.
export const getSearchResultsRoute = ({
  query,
  facet,
  term,
}: {
  query: Params;
  facet?: string;
  term?: string;
}): UrlObject => {
  const querystring = query.q || '';
  const queryFilters = queryFilterString2Object(query.extra_filter);
  if (!facet || !term) {
    return {
      pathname: `/search`,
      query: {
        q: querystring,
        filters: queryFilterObject2String({
          ...queryFilters,
        }),
      },
    };
  }
  return {
    pathname: `/search`,
    query: {
      q: querystring,
      filters: queryFilterObject2String({
        ...queryFilters,
        [facet]: [term],
      }),
    },
  };
};

// Fetch all disease pages
export const fetchAllDiseasePages = async (): Promise<DiseasePageProps[]> => {
  try {
    const baseUrl = getStrapiBaseUrl();
    const status = getContentStatus();

    const response = await fetch(
      `${baseUrl}/api/diseases?status=${status}&populate=*&sort=title:asc`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch diseases: ${response.status}`);
    }

    const apiResponse: DiseaseCollectionApiResponse<DiseasePageProps[]> =
      await response.json();

    return apiResponse.data;
  } catch (error) {
    console.error('Error fetching disease pages:', error);
    throw error;
  }
};

// Fetch a single disease page by slug
export const fetchDiseaseBySlug = async (
  slug: string,
): Promise<DiseasePageProps> => {
  try {
    const baseUrl = getStrapiBaseUrl();
    const status = getContentStatus();

    const response = await fetch(
      `${baseUrl}/api/diseases?status=${status}&filters[slug][$eq]=${slug}&populate=*`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch disease: ${response.status}`);
    }

    const apiResponse: DiseaseCollectionApiResponse<DiseasePageProps[]> =
      await response.json();

    if (!apiResponse.data || apiResponse.data.length === 0) {
      throw new Error(`Disease with slug "${slug}" not found`);
    }

    return apiResponse.data[0];
  } catch (error) {
    console.error('Error fetching disease by slug:', error);
    throw error;
  }
};
