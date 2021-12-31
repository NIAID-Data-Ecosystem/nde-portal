import axios from 'axios';

export const getSearchResults = async (searchTerm?: string | string[]) => {
  if (typeof searchTerm !== 'string') {
    return;
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('No API endpoint defined');
  }
  try {
    const {data} = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/query?&q=${searchTerm}`,
    );
    return data;
  } catch (err) {
    throw err;
  }
};
