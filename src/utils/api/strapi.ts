import { DiseasePageProps } from 'src/views/diseases/types';

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: {};
}

const transformStrapiDisease = (strapiData: any): DiseasePageProps => {
  return {
    id: strapiData.id,
    title: strapiData.title,
    topic: strapiData.topic,
    slug: strapiData.slug,
    query: strapiData.query,
    image: {
      url: strapiData.image?.url || '',
      alternativeText: strapiData.image?.alternativeText || '',
      caption: strapiData.image?.caption || undefined,
    },
    subtitle: strapiData.subtitle || null,
    description: strapiData.description || null,
    contacts: strapiData.contacts || null,
    externalLinks: strapiData.externalLinks || null,
    createdAt: strapiData.createdAt,
    updatedAt: strapiData.updatedAt,
    publishedAt: strapiData.publishedAt,
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

    const result: StrapiResponse<any[]> = await response.json();

    return result.data.map(transformStrapiDisease);
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

    const result: StrapiResponse<any[]> = await response.json();

    if (!result.data || result.data.length === 0) {
      throw new Error(`Disease with slug "${slug}" not found`);
    }

    return transformStrapiDisease(result.data[0]);
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

    const result: StrapiSingleResponse<any> = await response.json();

    return transformStrapiDisease(result.data);
  } catch (error) {
    console.error('Error fetching disease by ID:', error);
    throw error;
  }
};
