import axios from 'axios';
import { formatAPIResource } from './helpers';
import { FetchSearchResultsResponse, Metadata } from './types';

export const getResourceById = async (id?: string | string[]) => {
  if (!id) {
    return;
  }
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?q=_id:"${id}"`,
    );

    const formattedData = await formatAPIResource(data.hits[0]);

    return formattedData;
  } catch (err) {
    throw err;
  }
};

// Get all resources where query term contains the search term.
interface Params {
  q: string;
  size?: string | number;
  from?: string;
  facet_size?: number;
  facets?: string;
  sort?: string;
  scroll_id?: string;
}

// Fetch all search results from API.
export const fetchSearchResults = async (params: Params) => {
  if (!params || !params.q) {
    return;
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?`,
      {
        params,
      },
    );
    if (!data.hits) {
      return { results: [], total: 0, facets: data.facets || null };
    }

    const results: FetchSearchResultsResponse['results'] = data.hits.map(
      (d: any) => formatAPIResource(d),
    );
    const total: FetchSearchResultsResponse['total'] = data.total;
    const facets: FetchSearchResultsResponse['facets'] = data.facets;

    return { results, total, facets };
  } catch (err) {
    throw err;
  }
};

// Fetches all search results for a given query
export const fetchAllSearchResults = async (queryParams: Params) => {
  let total = 0;
  let allResults: any[] = [];

  const fetchSinglePageSearchResults: any = async (
    queryParams: Params,
    page: number = 0,
    scroll_id?: string | null,
  ) => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('API url undefined');
    }

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/query?`;
      let params = {
        ...queryParams,
        fetch_all: true,
        page,
      };

      // scroll id for fetching the next page of data
      if (scroll_id) {
        params.scroll_id = scroll_id;
      }

      const { data } = await axios.get(url, { params });

      // if there are no more results to return, return all the results.
      if (!data.hits || !data._scroll_id || data?.success === false) {
        return { results: allResults, total };
      }
      if (!total) {
        total = data.total;
      }
      allResults = [...allResults, ...data.hits];

      // fetch again until no more results.
      return fetchSinglePageSearchResults(params, page + 1, data._scroll_id);
    } catch (err) {
      throw err;
    }
  };

  return await fetchSinglePageSearchResults(queryParams);
};

// get metadata
export const fetchMetadata = async () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }

  try {
    const { data } = (await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/metadata`,
    )) as { data: Metadata };

    return data;
  } catch (err) {
    throw err;
  }
};
