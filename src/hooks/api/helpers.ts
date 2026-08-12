import axios from 'axios';
import { Metadata } from './types';

// Retry transient failures: network errors (no response, e.g. ECONNRESET) and
// 5xx responses. Other errors (4xx, etc.) are not worth retrying.
const isRetryableError = (err: unknown): boolean => {
  if (!axios.isAxiosError(err)) {
    return false;
  }
  // No response means a network-level failure (ECONNRESET, ETIMEDOUT, ...).
  if (!err.response) {
    return true;
  }
  return err.response.status >= 500;
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Number of retries on transient failures before giving up.
const MAX_RETRIES = 3;

// Note: no parameters — this is passed directly as a TanStack `queryFn`, which
// would otherwise fill the first argument with a query-context object.
export const fetchMetadata = async (): Promise<Metadata> => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API url undefined');
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data } = (await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/metadata`,
      )) as { data: Metadata };

      return data;
    } catch (err) {
      if (isRetryableError(err) && attempt < MAX_RETRIES) {
        // Exponential backoff: 300ms, 600ms, 1200ms, ...
        await wait(300 * 2 ** attempt);
        continue;
      }
      if (axios.isAxiosError(err)) {
        const reason = err.code || err.message || err.response?.statusText;
        throw new Error(`Failed to fetch metadata: ${reason}`);
      }
      throw err;
    }
  }

  // Unreachable: the loop either returns data or throws.
  throw new Error('Failed to fetch metadata: exhausted retries');
};
