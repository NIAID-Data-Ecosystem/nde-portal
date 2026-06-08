import axios from 'axios';
import { Metadata } from './types';

export const fetchMetadata = async (): Promise<Metadata> => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }

  try {
    const { data } = (await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/metadata`,
    )) as { data: Metadata };

    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const reason = err.code || err.message || err.response?.statusText;
      throw new Error(`Failed to fetch metadata: ${reason}`);
    }
    throw err;
  }
};
