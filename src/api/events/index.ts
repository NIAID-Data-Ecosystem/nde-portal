import axios from 'axios';

import { EventsQueryParams, EventsQueryResponse } from './types';

export const fetchAllEvents = async (
  params?: EventsQueryParams,
): Promise<{
  events: EventsQueryResponse[];
}> => {
  // in dev/staging mode, show drafts.
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  try {
    const events = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/events`,
      {
        params: {
          status: isProd ? 'published' : 'draft',
          populate: '*',
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      },
    );

    return { events: events.data.data };
  } catch (err: any) {
    throw err;
  }
};
