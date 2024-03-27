import axios from 'axios';
import { Metadata } from 'src/utils/api/types';

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
