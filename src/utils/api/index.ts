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
}

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
      { params },
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
