import axios from 'axios';

import { WebinarsQueryParams, WebinarsQueryResponse } from './types';

export const fetchAllWebinars = async (
  params: WebinarsQueryParams,
): Promise<{
  webinars: WebinarsQueryResponse[];
}> => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    // in dev/staging mode, show drafts.
    const webinars = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/webinars`,
      {
        params: {
          status: isProd ? 'published' : 'draft',
          populate: {
            fields: ['*'],
          },
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      },
    );

    return { webinars: webinars.data.data };
  } catch (err: any) {
    throw err;
  }
};
