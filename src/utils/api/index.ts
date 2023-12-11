import axios from 'axios';
import { formatAPIResource, formatISOString } from './helpers';
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
  } catch (err: any) {
    throw err.response;
  }
};

// Get all resources where query term contains the search term.
export interface Params {
  q: string;
  size?: string | number;
  from?: string;
  facet_size?: number;
  facets?: string;
  sort?: string;
  scroll_id?: string;
  extra_filter?: string;
  fields?: string[];
  dotfield?: boolean;
  hist?: string;
  advancedSearch?: string;
  use_metadata_score?: string;
}

// Fetch all search results from API.
export const fetchSearchResults = async (
  params: Params,
  signal?: AbortSignal,
) => {
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
        params: { ...params, fields: params?.fields?.join(',') },
        signal,
      },
    );

    if (!data.hits) {
      return { results: [], total: data.total, facets: data.facets || null };
    }

    const results: FetchSearchResultsResponse['results'] = data.hits.map(
      (d: any) => formatAPIResource(d),
    );
    const total: FetchSearchResultsResponse['total'] = data.total;
    const facets: FetchSearchResultsResponse['facets'] = data.facets;

    if (facets && facets['date']) {
      // format ISO string
      facets['date'].terms = facets?.['date'].terms.map(d => ({
        ...d,
        term: formatISOString(d.term),
      }));
    }

    return { results, total, facets };
  } catch (err: any) {
    throw err.response;
  }
};

// Fetches all search results for a given query
export const fetchAllSearchResults = async (
  queryParams: Params,
  signal?: AbortSignal,
  updateProgress?: (pct: number) => void,
) => {
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

      const { data } = await axios.get(url, { params, signal });

      if (updateProgress) {
        // Total number of pages to fetch is the total number of results divided by the page size (which defaults to 1000 when fetch_all is applied).
        const totalPages = Math.ceil(total / 1000);
        const percentComplete =
          totalPages && Math.round((page / totalPages) * 100);
        updateProgress(percentComplete);
      }
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

// get metadata fields
export interface FetchFieldsResponse {
  property: string;
  type: string;
}

export const fetchFields = async () => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }

  try {
    const data = await axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/metadata/fields`)
      .then(({ data }: { data: { [key: string]: { type: string } } }) => {
        return Object.entries(data).map(([property, { type }]) => {
          return { property, type };
        });
      });
    return data;
  } catch (err) {
    throw err;
  }
};
