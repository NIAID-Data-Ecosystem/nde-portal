import axios from 'axios';
import {
  buildFacetQueryParams,
  FacetParams,
  QueryArgs,
} from '../filters/utils/queries';
import { fetchSearchResults } from 'src/utils/api';
import { Facet, FacetTerm, FormattedResource } from 'src/utils/api/types';
import { UseQueryOptions } from '@tanstack/react-query';

interface AncestorsItem {
  id: string;
  name: string;
  definition?: string;
  label: string;
  url: string;
}

export interface OLSOntologyResponse extends AncestorsItem {
  ancestors: AncestorsItem[];
  count: number;
  term: string;
  url: string;
}

export const fetchOntologyData = async (
  terms: FacetTerm[],
  ontology: string,
): Promise<Omit<OLSOntologyResponse, 'term'>[]> => {
  // OLS API docs: https://www.ebi.ac.uk/ols/docs/api
  const EBI_URL = 'https://www.ebi.ac.uk/ols4/api/v2/ontologies';

  const requests = terms.map(async item => {
    const iri =
      ontology.toLowerCase() === 'edam'
        ? `http://edamontology.org/${item.term}`
        : `http://purl.obolibrary.org/obo/NCBITaxon_${item.term}`;

    // URLs must be double URL encoded: https://www.ebi.ac.uk/ols4/help
    const termData = await axios
      .get(
        `${EBI_URL}/${ontology.toLowerCase()}/classes/${encodeURIComponent(
          encodeURIComponent(iri),
        )}`,
      )
      .then(response => {
        const datum = response.data;
        return {
          id: datum.shortForm,
          name: datum.label,
          definition: datum.definition,
          label: datum.label,
          url: datum.iri,
          count: item.count,
        };
      });

    // URLs must be double URL encoded: https://www.ebi.ac.uk/ols4/help
    const ancestors = await axios
      .get(
        `${EBI_URL}/${ontology.toLowerCase()}/classes/${encodeURIComponent(
          encodeURIComponent(iri),
        )}/hierarchicalAncestors?size=1000&lang=en&includeObsoleteEntities=false`,
      )
      .then(response => {
        return response.data.elements.reverse().map((element: any) => {
          return {
            id: element.shortForm,
            name: element.label,
            definition: element.definition,
            label: element.label,
            url: element.iri,
          };
        });
      });
    return { ...termData, ancestors };
  });
  const responses = await Promise.all(requests);
  return responses;
};

export const queryData =
  (overrides?: Partial<QueryArgs>) =>
  (
    id: string,
    params: FacetParams,
    options?: UseQueryOptions<any, Error, any>,
  ) => {
    if (!id) {
      throw new Error('id is required');
    }
    // Destructure options to exclude queryKey and gather other options, with defaults
    const { queryKey = [], ...queryOptions } = options || {};

    const queryParams = buildFacetQueryParams({
      ...params,
      ...overrides?.params,
    });

    const facet = queryParams.facets;

    return [
      {
        queryKey: [...queryKey, queryParams],
        queryFn: async () => {
          const data = await fetchSearchResults(queryParams).then(
            (
              res:
                | {
                    results: FormattedResource[];
                    total: number;
                    facets: Facet;
                  }
                | undefined,
            ) => {
              if (!res) {
                throw new Error('No facets returned from fetchSearchResults');
              }
              const { facets } = res;
              const results =
                facets[facet]?.terms.map(item => {
                  const [term, label] = item.term.split('|');

                  if (facet.includes('topicCategory')) {
                    return {
                      ...item,
                      term,
                      label,
                    };
                  } else {
                    return {
                      ...item,
                      term,
                      label,
                    };
                  }
                }) || [];

              return results;
            },
          );

          if (!data || data.length === 0) {
            throw new Error('No data returned from fetchSearchResults');
          }

          // Fetch ontology data for the terms
          const ontologyResults = await fetchOntologyData(
            data,
            facet.includes('topicCategory') ? 'EDAM' : 'NCBITaxon',
          );

          // Return combined data
          return {
            facets: data,
            ontology: ontologyResults,
          };
        },
        select: (combinedData: {
          facets: FacetTerm[];
          ontology: OLSOntologyResponse[];
        }): { id: string; facet: string; results: OLSOntologyResponse[] } => {
          const { facets, ontology } = combinedData;
          // Combine facet and ontology data into a final result
          return {
            id,
            facet,
            results: facets.map((facet, index) => ({
              ...facet,
              ...ontology[index],
            })),
          };
        },
        ...options,
      },
    ];
  };

export interface TreeNode {
  id: string;
  children: TreeNode[];
  count?: number;
  definition?: string;
  name: string;
  term?: string;
  url: string;
}

// Helper function to find or create a node
const findOrCreateNode = (root: TreeNode, node: TreeNode): TreeNode => {
  const existingNode = root.children.find(child => child.id === node.id);
  if (existingNode) {
    return existingNode;
  } else {
    root.children.push(node);
    return node;
  }
};

export const transformAncestorsArraysToTree = (
  termData: OLSOntologyResponse[],
): TreeNode => {
  const ancestors = termData.map(item => [...item.ancestors, item]);
  const root: TreeNode = {
    id: 'root',
    name: 'root',
    definition: '',
    url: '',
    children: [],
  };

  ancestors.forEach(ancestorList => {
    let currentNode = root;
    ancestorList.forEach(item => {
      const newNode: TreeNode = {
        ...item,
        children: [],
      };
      currentNode = findOrCreateNode(currentNode, newNode);
    });
  });

  return root;
};
