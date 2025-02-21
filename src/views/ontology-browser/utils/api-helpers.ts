import axios from 'axios';
import { fetchSearchResults } from 'src/utils/api';
import {
  BioThingsDetailedLineageAPIResponseItem,
  BioThingsLineageAPIResponseItem,
  OLSAPIResponseItem,
  OntologyLineageItem,
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
  OntologyPagination,
} from '../types';

export type OntologyOption = {
  name: string;
  value: SearchParams['ontology'][number];
  relatedPortalSchemaProperties: string[];
};

export const ONTOLOGY_BROWSER_OPTIONS = [
  {
    name: 'NCBI Taxonomy',
    value: 'ncbitaxon',
    relatedPortalSchemaProperties: [
      'infectiousAgent.displayName',
      'infectiousAgent.displayName.raw',
      'infectiousAgent.identifier',
      'infectiousAgent.name',
      'species.displayName',
      'species.displayName.raw',
      'species.identifier',
      'species.name',
    ],
  },
  {
    name: 'EDAM',
    value: 'edam',
    relatedPortalSchemaProperties: [
      'topicCategory.identifier',
      'topicCategory.name',
    ],
  },
] as OntologyOption[];

const OLS_API_URL = 'https://www.ebi.ac.uk/ols4/api';
const BIOTHINGS_API_URL = 'https://t.biothings.io/v1';

/********************************************************
 *
 *  SEARCH FUNCTIONALITY
 *  [TO DO]: Refactor this to also use the BioThings API
 *
 *******************************************************/

export interface SearchParams {
  q: string;
  ontology: ('edam' | 'ncbitaxon')[];
  queryFields: ('label' | 'short_form' | 'obo_id' | 'iri')[];
  exact?: boolean;
  obsoletes?: boolean;
  local?: boolean;
  rows?: number;
  start?: number;
  format?: string;
  lang?: string;
}

interface SearchResponse {
  iri: string;
  ontology_name: string;
  ontology_prefix: string;
  short_form: string;
  description: [];
  label: string;
  obo_id: string;
  type: string;
}

export const searchOntologyAPI = async (
  params: SearchParams,
  signal?: AbortSignal,
): Promise<SearchResponse[]> => {
  if (!params.q) {
    return [];
  }
  const { q, ontology, queryFields, ...rest } = params;

  const { data } = await axios.get(`${OLS_API_URL}/search?`, {
    params: {
      q,
      ontology: ontology.join(','),
      queryFields: queryFields.join(','),
      exact: false,
      obsoletes: false,
      local: false,
      rows: 5,
      start: 0,
      format: 'json',
      lang: 'en',
      ...rest,
    },
    signal,
  });

  return data.response.docs;
};

/********************************************************
 *
 *  ONTOLOGY LINEAGE
 *
 *******************************************************/

/**
 * Generates a formatted IRI (Internationalized Resource Identifier) based on the given ID and ontology.
 *
 * @param id - The unique identifier for the ontology term.
 * @param ontology - The ontology name (e.g., "edam", "ncbitaxon").
 * @returns {string} - The formatted IRI corresponding to the ID and ontology.
 *
 */
export const formatIRI = (
  id: OntologyLineageRequestParams['id'],
  ontology: OntologyLineageRequestParams['ontology'],
): string => {
  // Handle "edam" ontology, formatting the ID with a "topic_" prefix
  if (ontology.toLowerCase() === 'edam') {
    const iri_id = `topic_${id}`;
    return `http://edamontology.org/${iri_id}`;
  }
  // Handle "ncbitaxon" ontology, formatting the ID with the "NCBITaxon_" prefix
  else if (ontology.toLowerCase() === 'ncbitaxon') {
    return `http://purl.obolibrary.org/obo/NCBITaxon_${id}`;
  }
  // Default case for other ontologies
  return `http://purl.obolibrary.org/obo/${id}`;
};

/**
 * [fetchLineageFromBioThingsAPI]: Fetch lineage information for a given taxon ID from the Biothings API
 * and return structured ontology lineage items.
 *
 * NOTE: We use the BioThings API to fetch lineage information for the NCBI Taxonomy ontology.
 * It follows the NCBI Taxonomy more closely than the OLS API. (ex: TAXON ID 3366610 is not available in OLS)
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */

export const fetchLineageFromBioThingsAPI = async (
  params: OntologyLineageRequestParams,
): Promise<{ lineage: OntologyLineageItem[] }> => {
  if (!params?.id) {
    throw new Error('No id provided');
  }
  try {
    // Fetch lineage data from the BioThings API
    const lineageAPIResponse: BioThingsLineageAPIResponseItem = await axios.get(
      `${BIOTHINGS_API_URL}/taxon/${params.id}?include_children`,
    );
    const rawLineageData = lineageAPIResponse.data.lineage;

    if (!Array.isArray(rawLineageData)) {
      throw new Error('lineage data is not available or invalid');
    }

    const detailedLineageParams = {
      ids: rawLineageData.join(','), // Stringify the lineage array
      fields: [
        'common_name',
        'genbank_common_name',
        'children',
        'parent_taxid',
        'rank',
        'scientific_name',
        'taxid',
      ],
    };

    // Fetch the detailed lineage information for each taxonId
    const {
      data: detailedLineageData,
    }: { data: BioThingsDetailedLineageAPIResponseItem[] } = await axios.post(
      `${BIOTHINGS_API_URL}/taxon`,
      detailedLineageParams,
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const processedLineage = detailedLineageData
      .map((item: BioThingsDetailedLineageAPIResponseItem, idx: number) => {
        // Must set the parent to empty string if it is the root node.
        const isRootNode = item.parent_taxid === item.taxid;
        const taxonId = +item.taxid;
        return {
          id: item.taxid.toString(),
          commonName: item?.genbank_common_name || item?.common_name || '',
          hasChildren: true, // [TO DO]:BioThings API does not provide this information see below when Dylan makes API changes
          // hasChildren: item.children.length>0,
          iri: formatIRI(taxonId, params.ontology),
          label: item.scientific_name.toLowerCase(),
          ontologyName: params.ontology,
          parentTaxonId: isRootNode ? null : +item.parent_taxid,
          rank: item.rank,
          state: {
            opened: idx != 0, // Open all nodes except the deepest one
            selected: idx == 0, // select the first node (most specific) by default
          },
          taxonId,
        };
      })
      .reverse(); // reverse the array to start from the root node.
    // Return or process the POST response
    return { lineage: processedLineage };
  } catch (error: any) {
    console.error('Error in fetching BioThings data:', error.message);
    throw error;
  }
};

/**
 * [fetchChildrenFromBioThingsAPI]: Fetch children information for a given taxon ID from the Biothings API
 * and return structured ontology lineage items.
 *
 * NOTE: We use the BioThings API to fetch lineage information for the NCBI Taxonomy ontology.
 * It follows the NCBI Taxonomy more closely than the OLS API. (ex: TAXON ID 3366610 is not available in OLS)
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */

export const fetchChildrenFromBioThingsAPI = async (
  params: OntologyLineageRequestParams,
  signal?: AbortSignal,
): Promise<{
  children: OntologyLineageItem[];
  pagination: OntologyPagination;
}> => {
  if (!params?.id) {
    throw new Error('No ID provided for the BioThings API request.');
  }

  try {
    const size = params.size || 100; // Default size to 100 if not provided
    // Fetch lineage data from the BioThings API
    const lineageAPIResponse: BioThingsLineageAPIResponseItem = await axios.get(
      `${BIOTHINGS_API_URL}/taxon/${params.id}?include_children`,
    );

    const childrenItems = lineageAPIResponse.data.children || [];
    // Calculate the items for the current page
    // const start = params.from * size;
    // const end = start + size;
    // const currentItems = childrenItems.slice(start, end);

    const totalElements = childrenItems.length;
    const totalPages = Math.ceil(totalElements / size);
    const numPage = params.from || 0;
    const pagination = {
      hasMore: numPage < totalPages - 1,
      numPage,
      totalPages,
      totalElements,
    };
    // if the children array is empty, return an empty array
    if (!childrenItems.length) {
      return { children: [], pagination: pagination };
    }

    const paramsForChildrenData = {
      ids: childrenItems.join(','), // Stringify the children ids array
      fields: [
        'common_name',
        'genbank_common_name',
        'children',
        'parent_taxid',
        'rank',
        'scientific_name',
        'taxid',
      ],
    };

    // Fetch the detailed lineage information for each taxonId
    const {
      data: childrenData,
    }: { data: BioThingsDetailedLineageAPIResponseItem[] } = await axios.post(
      `${BIOTHINGS_API_URL}/taxon`,
      paramsForChildrenData,
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const detailedChildrenData = childrenData.map(
      (item: BioThingsDetailedLineageAPIResponseItem, idx: number) => {
        // Must set the parent to empty string if it is the root node.
        const isRootNode = item.parent_taxid === item.taxid;
        const taxonId = +item.taxid;
        return {
          id: item.taxid.toString(),
          commonName: item?.genbank_common_name || item?.common_name || '',
          hasChildren: true, // [TO DO]:BioThings API does not provide this information see below when Dylan makes API changes
          // hasChildren: item.children.length>0,
          iri: formatIRI(taxonId, params.ontology),
          label: item.scientific_name.toLowerCase(),
          ontologyName: params.ontology,
          parentTaxonId: isRootNode ? null : +item.parent_taxid,
          rank: item.rank,
          state: {
            opened: idx != 0, // Open all nodes except the deepest one
            selected: idx == 0, // select the first node (most specific) by default
          },
          taxonId,
        };
      },
    );

    return { children: detailedChildrenData, pagination: pagination };
  } catch (error: any) {
    console.error(
      'Error in fetching children in BioThings data:',
      error.message,
    );
    throw error;
  }
};

/**
 * [fetchLineageFromOLSAPI]: Fetch lineage information for a given ontology ID from the OLS API [docs](https://www.ebi.ac.uk/ols4/help)
 * and return structured ontology lineage items.
 *
 * NOTE: The OLS API does not provide lineage information for all taxon IDs. In such cases, we use the BioThings API.
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */

export const fetchLineageFromOLSAPI = async (
  params: OntologyLineageRequestParams,
  signal?: AbortSignal,
): Promise<{ lineage: OntologyLineageItem[] }> => {
  if (!params?.id) {
    throw new Error('No ID provided for the OLS API request.');
  }

  try {
    // Note: IRIs must be double URL encoded according to OLS documentation.
    const iri = formatIRI(params.id, params.ontology);
    const encodedIri = encodeURIComponent(encodeURIComponent(iri));

    // Fetch the term data from the main endpoint
    const { data: termData }: { data: OLSAPIResponseItem } = await axios.get(
      `${OLS_API_URL}/ontologies/${params.ontology}/terms/${encodedIri}`,
      {
        params: {
          lang: params.lang || 'en', // Default to English
        },
        signal: signal,
      },
    );

    // Fetch the ancestors data from the second endpoint
    const ancestorsData: OLSAPIResponseItem[] = await axios
      .get(
        `${OLS_API_URL}/ontologies/${params.ontology}/terms/${encodedIri}/ancestors`,
        {
          params: {
            lang: params.lang || 'en', // Default to English
            size: params?.size || 100, // Default size to 100 if not provided
          },
          signal: signal,
        },
      )
      .then(response => {
        return response?.data?._embedded?.terms || [];
      });

    // Combine term data with ancestors into a lineage list
    const lineageItems = [
      termData, // Prepend the term response
      ...ancestorsData, // Spread the terms from the ancestors response
    ];

    // Structure the lineage data.
    const processedLineage = lineageItems
      .map((item: OLSAPIResponseItem, idx: number) => {
        const numericTaxonId = item.short_form.replace(/[^0-9]/g, '');
        const parentTaxonId =
          idx === lineageItems.length - 1
            ? null // Last term(root) has no parent
            : +lineageItems[idx + 1].short_form.replace(/[^0-9]/g, '');

        return {
          id: item.short_form,
          commonName: item?.synonyms?.[0] || '',
          hasChildren: item.has_children,
          iri: item.iri,
          label: item.label.toLowerCase(),
          ontologyName: item.ontology_name,
          parentTaxonId,
          state: {
            opened: idx != 0, // Open all nodes except the deepest one
            selected: idx == 0, // Mark the first item as selected
          },
          taxonId: +numericTaxonId,
        };
      })
      .reverse();

    return { lineage: processedLineage };
  } catch (error: any) {
    console.error('Error in fetching from the OLS:', error.message);
    throw error;
  }
};

/**
 * [fetchChildrenFromOLSAPI]: Fetch the children information for a given ontology ID from the OLS API [docs](https://www.ebi.ac.uk/ols4/help)
 * and return structured ontology lineage items.
 *
 * NOTE: The OLS API does not provide lineage information for all taxon IDs. In such cases, we use the BioThings API.
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */

export const fetchChildrenFromOLSAPI = async (
  params: OntologyLineageRequestParams,
  signal?: AbortSignal,
): Promise<{
  children: OntologyLineageItem[];
  pagination: OntologyPagination;
}> => {
  if (!params?.id) {
    throw new Error('No ID provided for the OLS API request.');
  }

  try {
    // Note: IRIs must be double URL encoded according to OLS documentation.
    const iri = formatIRI(params.id, params.ontology);
    const encodedIri = encodeURIComponent(encodeURIComponent(iri));

    // Fetch the ancestors data from the second endpoint
    const childrenData: {
      items: OLSAPIResponseItem[];
      pagination: {
        hasMore: boolean;
        numPage: number;
        totalPages: number;
        totalElements: number;
      };
    } = await axios
      .get(
        `${OLS_API_URL}/ontologies/${params.ontology}/terms/${encodedIri}/children`,
        {
          params: {
            lang: params.lang || 'en', // Default to English
            size: params?.size || 100, // Default size to 100 if not provided
          },
          signal: signal,
        },
      )
      .then(response => {
        const data = response.data;
        const hasMore = data.page.number < data.page.totalPages - 1;
        const items = response?.data?._embedded?.terms || [];
        return {
          items,
          pagination: {
            hasMore,
            numPage: data.page.number,
            totalPages: data.page.totalPages,
            totalElements: data.page.totalElements,
          },
        };
      });
    const { items } = childrenData;

    // Structure the children data.
    const processedChildren = items.map((item: OLSAPIResponseItem) => {
      const numericTaxonId = item.short_form.replace(/[^0-9]/g, '');
      return {
        id: item.short_form,
        commonName: item?.synonyms?.[0] || '',
        hasChildren: item.has_children,
        iri: item.iri,
        label: item.label.toLowerCase(),
        ontologyName: item.ontology_name,
        parentTaxonId: params.id, // Parent is the current node
        state: {
          opened: false,
          selected: false, // Mark the first item as selected
        },
        taxonId: +numericTaxonId,
      };
    });
    return { children: processedChildren, pagination: childrenData.pagination };
  } catch (error: any) {
    console.error('Error in fetching from the OLS:', error.message);
    throw error;
  }
};

/**
 * [fetchPortalCounts]: Fetch counts for each node in the lineage array from the NDE API.
 * Counts include:
 * - The number of datasets directly associated with the node (term count).
 * - The total number of datasets associated with the node and its children (lineage count).
 * Also check if node hasChildren
 * @param lineage - An array of ontology lineage items.
 * @param params - The search parameters used to fetch the counts.
 * @returns An array of lineage items with counts.
 */

export const fetchPortalCounts = async (
  lineage: OntologyLineageItem[],
  params: { q?: string },
): Promise<OntologyLineageItemWithCounts[]> => {
  // fetch counts from NDE API

  const lineageWithCounts = await Promise.all(
    lineage.map(async node => {
      // Extract the numeric taxon ID from the node
      const numericTaxonId = node.taxonId.toString().replace(/[^0-9]/g, '');

      const lineageQueryResponse = await fetchSearchResults({
        q: params.q ? params.q : '__all__',
        size: 0,
        lineage: +numericTaxonId,
      });

      // Extract counts for datasets directly related to this taxon ID
      const directTermCount =
        lineageQueryResponse?.facets?.lineage_doc_count?.doc_count || 0;

      // Extract counts for datasets where this taxon ID is a parent
      const childTermsCount =
        lineageQueryResponse?.facets?.lineage?.children_of_lineage?.to_parent
          ?.doc_count || 0;

      // Determine if the node has child taxon IDs.
      // [NOTE]: This only checks if the node has children in the NDE API.
      const hasChildTaxons =
        lineageQueryResponse?.facets?.lineage?.children_of_lineage?.taxon_ids
          ?.terms?.length > 0;

      // Return the updated node with counts and child status
      return {
        ...node,
        hasChildren: node.hasChildren || hasChildTaxons,
        counts: {
          termCount: directTermCount,
          termAndChildrenCount: directTermCount + childTermsCount,
        },
      };
    }),
  );

  return lineageWithCounts;
};
