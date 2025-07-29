import axios from 'axios';
import { FeaturedPageProps, FeaturedQueryParams } from './types';
import { NewsOrEventsObject } from 'src/pages/updates';

export const fetchFeaturedContent = async (
  slug: string | string[],
): Promise<FeaturedPageProps | null> => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    // In production, we do not features. Remove when approved.
    if (isProd) {
      return null;
    }
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
    // In production, we do not features. Remove when approved.
    if (isProd) {
      return [];
    }

    const featuredPages = await axios.get<{ data: FeaturedPageProps[] }>(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/features`,
      {
        params: {
          populate: '*',
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

export const transformFeaturedContentForCarousel = (
  data: FeaturedPageProps[],
): NewsOrEventsObject[] => {
  if (!data) return [];
  return data.map(item => {
    return {
      ...item,
      name: item.title,
      type: 'feature',
      description: item.content,
      shortDescription: item?.abstract.slice(0, 160) || '',
      image: item.thumbnail,
    };
  });
};
