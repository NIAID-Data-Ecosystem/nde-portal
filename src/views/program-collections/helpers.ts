import axios from 'axios';
import { SourceOrganization } from 'src/utils/api/types';

export interface ProgramCollection {
  id: string;
  term: string;
  count: number;
  sourceOrganization: SourceOrganization | null;
}

/**
 * Converts a display name into a URL-safe ID.
 */
const transformTermToId = (term: string) => {
  return term.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Optional delay between requests to avoid rate limits.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry transient failures: network errors (no response, e.g., ECONNRESET) and
// 5xx responses.
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

// Number of retries on transient failures before giving up.
const MAX_RETRIES = 3;

/**
 * Fetches program collections and their associated counts from the NIAID Data Ecosystem API.
 * Processes each detail request sequentially to avoid rate limits.
 */
export const fetchProgramCollections = async (
  delayTime = 0,
): Promise<ProgramCollection[]> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error('API URL is undefined');
  }

  let collections: { term: string; count: number }[] = [];
  try {
    const response = await axios.get(`${API_URL}/query`, {
      params: {
        q: '_exists_:sourceOrganization.name',
        facets: 'sourceOrganization.name',
        facet_size: 1000,
        size: 0,
      },
    });

    collections =
      response.data.facets?.['sourceOrganization.name']?.terms || [];
  } catch (error) {
    console.error('Failed to fetch program collections list:', error);
    throw new Error('Unable to fetch program collections list');
  }

  const collectionsWithDetails: ProgramCollection[] = [];

  for (const { term, count } of collections) {
    const id = transformTermToId(term);

    let matchingOrg: SourceOrganization | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { data } = await axios.get(`${API_URL}/query`, {
          params: {
            q: `_exists_:sourceOrganization.name AND sourceOrganization.name:"${term}"`,
            size: 1,
            fields: 'sourceOrganization',
          },
        });

        const hit = data?.hits?.[0];
        const sourceOrg = hit?.sourceOrganization;

        if (Array.isArray(sourceOrg)) {
          matchingOrg = sourceOrg.find(
            (org: SourceOrganization) =>
              org.name.toLowerCase() === term.toLowerCase(),
          );
        } else if (sourceOrg?.name?.toLowerCase() === term.toLowerCase()) {
          matchingOrg = sourceOrg;
        }

        if (matchingOrg?.alternateName) {
          const nameWords = matchingOrg.name.split(' ');
          // The API sometimes returns a single string instead of an array
          // (e.g., IEDB's alternateName is just "IEDB"). Normalize to an
          // array since downstream consumers expect alternateName to be one.
          const alternateNames = Array.isArray(matchingOrg.alternateName)
            ? matchingOrg.alternateName
            : [matchingOrg.alternateName];
          matchingOrg.alternateName = alternateNames.filter(
            (alt: string) => !nameWords.includes(alt),
          );
        }

        break;
      } catch (error) {
        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          // Exponential backoff: 300ms, 600ms, 1200ms, ...
          await delay(300 * 2 ** attempt);
          continue;
        }

        console.error(
          `Failed to fetch program collection details for ${term}:`,
          error,
        );
        throw new Error(
          `Unable to fetch program collection details for ${term}`,
        );
      }
    }

    collectionsWithDetails.push({
      id,
      term,
      count,
      sourceOrganization: matchingOrg,
    });

    // Optional delay to avoid rate limiting
    await delay(delayTime);
  }

  return collectionsWithDetails;
};
