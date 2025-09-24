import axios from 'axios';

import { FeatureQueryParams, FeatureQueryResponse } from './types';

export const fetchFeatureBySlug = async (
  slug: string | string[],
): Promise<FeatureQueryResponse | null> => {
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

export const fetchAllFeatures = async (
  params?: FeatureQueryParams,
): Promise<FeatureQueryResponse[]> => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    // In production, we do not features. Remove when approved.
    if (isProd) {
      return [];
    }

    const featured = await axios.get(
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
    return featured.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.statusText || 'An error occurred');
    }
    throw error; // Re-throw the error for useQuery to handle
  }
};
