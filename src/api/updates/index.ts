import { fetchAllEvents } from '../events';
import { fetchAllFeatures } from '../features';
import { fetchAllNews } from '../news';
import { UpdatesQueryParams, UpdatesQueryResponse } from '../updates/types';

// Fetches all updates including: news reports, events, and features
export const fetchAllUpdates = async (
  params?: UpdatesQueryParams,
): Promise<UpdatesQueryResponse> => {
  try {
    // Parallel fetching of news and events using Promise.all
    const [newsResponse, eventsResponse, featuresResponse] = await Promise.all([
      fetchAllNews(params),
      fetchAllEvents(params),
      fetchAllFeatures(params),
    ]);

    // Mapping data to the expected structure
    const news = newsResponse.news;
    const events = eventsResponse.events;
    const features = featuresResponse;

    return {
      events,
      features,
      news,
    };
  } catch (error: any) {
    // Assuming error is of type any, we throw as type Error for useQuery to handle
    throw `Data fetching error: ${
      error.message || 'An unknown error occurred'
    }`;
  }
};
