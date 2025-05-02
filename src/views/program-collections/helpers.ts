import axios from 'axios';
import { SourceOrganization } from 'src/utils/api/types';

export interface ProgramCollection {
  id: string;
  term: string;
  count: number;
  sourceOrganization: SourceOrganization | null;
}
/**
 * Fetches program collections and their associated counts from the NIAID Data Ecosystem API.
 * @returns {Promise<ProgramCollection[]>} - An array of program collections with their details.
 * @throws {Error} - Throws an error if the API URL is undefined.
 */

export const fetchProgramCollections = async (): Promise<
  ProgramCollection[]
> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error('API URL is undefined');
  }

  let collections: { term: string; count: number }[] = [];
  try {
    // use nde api to fetch list of available program collections and associated counts
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

  // Fetch the first result for each collection and filter for the matching program collection.
  const collectionsWithDetails = await Promise.all(
    collections.map(async ({ term, count }) => {
      const id = transformTermToId(term);

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

        let matchingOrg: SourceOrganization | null = null;

        if (Array.isArray(sourceOrg)) {
          matchingOrg = sourceOrg.find(
            (org: SourceOrganization) =>
              org.name.toLowerCase() === term.toLowerCase(),
          );
        } else if (sourceOrg?.name?.toLowerCase() === term.toLowerCase()) {
          matchingOrg = sourceOrg;
        }

        // Format alternate name fields to remove any duplicate acronyms.
        // (i.e.) if name = "AMP Network", remove AMP from alternate names
        if (matchingOrg?.alternateName) {
          const nameWords = matchingOrg.name.split(' ');
          matchingOrg.alternateName = matchingOrg.alternateName.filter(
            (alternateName: string) => !nameWords.includes(alternateName),
          );
        }

        return { id, term, count, sourceOrganization: matchingOrg };
      } catch (error) {
        console.error(`Error fetching details for term "${term}":`, error);
        throw new Error(
          `Unable to fetch program collection details for ${term}`,
        );
      }
    }),
  );

  return collectionsWithDetails;
};

const transformTermToId = (term: string) => {
  // Convert the term to lowercase and replace spaces with hyphens
  const transformedTerm = term.toLowerCase().replace(/\s+/g, '-');
  return transformedTerm;
};
