import axios from 'axios';
import {formatAPIResource} from './helpers';
import {FetchSearchResultsResponse} from './types';

export const getResourceById = async (id?: string | string[]) => {
  if (!id) {
    return;
  }
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }
  try {
    const {data} = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?&q=identifier:${id}`,
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
  size: string;
  from: string;
}

export const fetchSearchResults = async (params: Params) => {
  if (!params) {
    return;
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }

  try {
    const {data} = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?`,
      {params},
    );

    const results: FetchSearchResultsResponse['results'] = data.hits.map(
      (d: any) => formatAPIResource(d),
    );
    const total: FetchSearchResultsResponse['total'] = data.total;

    return {results, total};
  } catch (err) {
    throw err;
  }
};
