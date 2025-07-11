import { scaleOrdinal } from '@visx/scale';
import { UrlObject } from 'url';
import { Params } from 'src/utils/api';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search-results-page/helpers';
import {
  DiseasePageProps,
  DiseaseCollectionApiResponse,
  DiseaseSingleApiResponse,
} from 'src/views/diseases/types';

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

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
    const response = await fetch(
      `${STRAPI_BASE_URL}/api/diseases?status=draft&populate=*&sort=title:asc`,
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
    const response = await fetch(
      `${STRAPI_BASE_URL}/api/diseases?status=draft&filters[slug][$eq]=${slug}&populate=*`,
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

// Fetch disease page by ID
export const fetchDiseaseById = async (
  id: number,
): Promise<DiseasePageProps> => {
  try {
    const response = await fetch(
      `${STRAPI_BASE_URL}/api/diseases?status=draft/${id}?populate=*`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch disease: ${response.status}`);
    }

    const apiResponse: DiseaseSingleApiResponse<DiseasePageProps> =
      await response.json();

    return apiResponse.data;
  } catch (error) {
    console.error('Error fetching disease by ID:', error);
    throw error;
  }
};
