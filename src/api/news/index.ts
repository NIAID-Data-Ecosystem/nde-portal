import axios from 'axios';

import { BaseUpdateQueryResponse } from '../updates/types';
import { NewsQueryParams, NewsQueryResponse } from './types';

export const fetchAllNews = async (
  params?: NewsQueryParams,
): Promise<{
  news: NewsQueryResponse[];
}> => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    // in dev/staging mode, show drafts.
    const news = await axios
      .get(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/news-reports`, {
        params: {
          status: isProd ? 'published' : 'draft',
          populate: '*',
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      })
      .then((news: { data: { data: BaseUpdateQueryResponse[] } }) => {
        return news.data.data.map(item => {
          return {
            ...item,
            slug: item.slug.replace('news-report-', 'updates-'),
          };
        });
      });

    return { news };
  } catch (err: any) {
    throw err.response;
  }
};
