import axios from 'axios';
import { SourceOrganization } from 'src/utils/api/types';

export interface ProgramCollection {
  id: string;
  count: number;
  details: SourceOrganization | null;
}
/**
 * Fetches program collections and their associated counts from the NIAID Data Ecosystem API.
 * @returns {Promise<ProgramCollection[]>} - An array of program collections with their details.
 * @throws {Error} - Throws an error if the API URL is undefined.
 */

export const fetchProgramCollections = async (): Promise<
  ProgramCollection[]
> => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('API URL is undefined');
  }

  // use nde api to fetch list of available program collections and associated counts
  const collections = await axios
    .get(`${process.env.NEXT_PUBLIC_API_URL}/query`, {
      params: {
        q: '_exists_:sourceOrganization.name',
        facets: 'sourceOrganization.name',
        facet_size: 1000,
        size: 0,
      },
    })
    .then(response => response.data.facets['sourceOrganization.name'].terms);

  // Fetch the first result for each collection and filter for the matching program collection.
  const collectionsWithDetails = await Promise.all(
    collections.map(async (collection: any) => {
      const { term, count } = collection;

      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/query`,
          {
            params: {
              q: `_exists_:sourceOrganization.name AND sourceOrganization.name:"${term}"`,
              size: 1,
              fields: 'sourceOrganization',
            },
          },
        );

        const hit = data?.hits?.[0];
        if (!hit?.sourceOrganization) {
          return { id: term, count, details: null };
        }

        const sourceOrganization = hit.sourceOrganization;

        let matchingOrganizationDetails = null;

        if (Array.isArray(sourceOrganization)) {
          matchingOrganizationDetails = sourceOrganization.find(
            (org: SourceOrganization) =>
              org.name.toLowerCase() === term.toLowerCase(),
          );
        } else if (
          sourceOrganization.name?.toLowerCase() === term.toLowerCase()
        ) {
          matchingOrganizationDetails = sourceOrganization;
        }

        return { id: term, count, details: matchingOrganizationDetails };
      } catch (error) {
        console.error(`Failed to fetch details for term: ${term}`, error);
        return { id: term, count, details: null };
      }
    }),
  );

  return collectionsWithDetails;
};
