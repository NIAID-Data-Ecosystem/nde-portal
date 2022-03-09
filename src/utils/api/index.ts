import axios from 'axios';
import {formatAPIResource} from './helpers';

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
export const getSearchResults = async (searchTerm?: string | string[]) => {
  if (typeof searchTerm !== 'string') {
    return;
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }
  try {
    const {data} = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?q=${searchTerm}`,
    );

    return data;
  } catch (err) {
    throw err;
  }
};
