import axios from 'axios';
import { FeaturedPageProps, FeaturedQueryParams } from './types';

export const fetchFeaturedContent = async (
  slug: string | string[],
): Promise<FeaturedPageProps | null> => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const featured = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/features?populate=*&filters[$and][0][slug][$eqi]=${slug}&status=${
        isProd ? 'published' : 'draft'
      }`,
    );
    if (
      !featured.data ||
      !featured.data.data ||
      featured.data.data.length === 0
    ) {
      return null;
    }
    return featured.data.data[0];
  } catch (err: any) {
    throw err.response;
  }
};

export const fetchAllFeaturedPages = async (params?: FeaturedQueryParams) => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';

    const featuredPages = await axios.get<{ data: FeaturedPageProps[] }>(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/features`,
      {
        params: {
          status: isProd ? 'published' : 'draft',
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      },
    );
    return featuredPages.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.statusText || 'An error occurred');
    }
    throw error; // Re-throw the error for useQuery to handle
  }
};
