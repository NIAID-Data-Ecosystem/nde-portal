import axios from 'axios';

export interface FeaturedPageProps {
  id: number;
  attributes: {
    title: string;
    content: string;
    subtitle: string;
    banner: {
      data: null | { attributes: { url: string; alternativeText: string } };
    };
    thumbnail: {
      data: null | { attributes: { url: string; alternativeText: string } };
    };
    slug: string | string[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    categories: {
      data: {
        id: number;
        attributes: {
          name: string;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
        };
      }[];
    };
  };
}

interface queryParams {
  publicationState?: string;
  fields?: string[];
  populate?: {
    fields?: string[];
    thumbnail?: {
      fields?: string[];
    };
  };
  sort?: { publishedAt?: string; updatedAt?: string };
  paginate?: { page?: number; pageSize?: number };
}

export const fetchAllFeaturedPages = async (params?: queryParams) => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';

    const featuredPages = await axios.get<{ data: FeaturedPageProps[] }>(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/features`,
      {
        params: {
          status: isProd ? 'published' : 'draft',
          populate: {
            fields: ['slug'],
          },
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      },
    );

    return {
      data: featuredPages.data.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.statusText || 'An error occurred');
    }
    throw error; // Re-throw the error for useQuery to handle
  }
};
