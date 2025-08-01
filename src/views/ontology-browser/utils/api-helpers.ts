import axios from 'axios';
import { fetchSearchResults } from 'src/utils/api';
import {
  BioThingsDetailedLineageAPIResponseItem,
  BioThingsLineageAPIResponseItem,
  OLSAPIResponseItem,
  OntologyChildrenRequestParams,
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
  // {
  //   name: 'EDAM',
  //   value: 'edam',
  //   relatedPortalSchemaProperties: [
  //     'topicCategory.identifier',
  //     'topicCategory.name',
  //   ],
  // },
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
  biothingsFields: ('_id' | 'rank' | 'scientific_name')[];
  olsFields: ('iri' | 'label' | 'ontology_name' | 'short_form' | 'type')[];
  exact?: boolean;
  obsoletes?: boolean;
  local?: boolean;
  rows?: number;
  start?: number;
  format?: string;
  lang?: string;
}

interface SearchResponse {
  _id: string;
  definingOntology: string;
  label: string;
  rank: string;
  definingAPI: 'biothings' | 'ols';
}

export const fetchOLSSearchAPI = async (
  params: SearchParams,
  signal?: AbortSignal,
): Promise<SearchResponse[]> => {
  if (!params.q) {
    return [];
  }
  const { q, olsFields } = params;
  try {
    const { data } = await axios.get(`${OLS_API_URL}/search?`, {
      params: {
        q: q + '*',
        ontology: params.ontology.join(','),
        queryFields: olsFields.join(','),
        exact: params?.exact || false,
        obsoletes: params?.obsoletes || false,
        local: params?.local || false,
        rows: params?.rows || 5,
        start: params?.start || 0,
        format: params?.format || 'json',
        lang: params?.lang || 'en',
      },
      signal,
    });
    const results = await data.response.docs
      .map(
        (result: {
          iri: string;
          label: string;
          ontology_name: string;
          short_form: string;
          type: string;
        }) => {
          return {
            _id: result.iri.split('/').pop() || result.short_form,
            definingAPI: 'ols',
            definingOntology: result.ontology_name,
            label: result.label,
            rank: result.type,
          };
        },
      )
      .filter((result: SearchResponse) => result.rank === 'class');
    return results;
  } catch (err: any) {
    console.error(
      'Error in fetching search results from the OLS API:',
      err.message,
    );
    throw err;
  }
};

export const fetchBioThingsSearchAPI = async (
  params: SearchParams,
  signal?: AbortSignal,
): Promise<SearchResponse[]> => {
  if (!params.q) {
    return [];
  }
  const { q, biothingsFields } = params;
  try {
    const { data } = await axios.get(`${BIOTHINGS_API_URL}/query?`, {
      params: {
        q,
        fields: biothingsFields.join(','),
        size: 8,
      },
      signal,
    });
    const results = await data.hits.map(
      (result: { _id: string; scientific_name: string; rank: string }) => {
        return {
          _id: result._id,
          definingAPI: 'biothings',
          definingOntology: 'ncbitaxon',
          label: result.scientific_name,
          rank: result.rank,
        };
      },
    );
    return results;
  } catch (error: any) {
    if (axios.isCancel(error)) {
      console.log('Request canceled due to update:', error.message);
      return [];
    }
    console.error(
      'Error in fetching search results from the BioThings API:',
      error.message,
    );
    throw error;
  }
};

export const searchOntologyAPI = async (
  params: SearchParams,
  signal?: AbortSignal,
): Promise<SearchResponse[]> => {
  if (!params.q) {
    return [];
  }
  const searchResults = [];
  if (params.ontology.includes('ncbitaxon')) {
    const biothingsResults = await fetchBioThingsSearchAPI(
      { ...params, ontology: ['ncbitaxon'] },
      signal,
    );
    searchResults.push(...biothingsResults);
  }
  // const ontology = params.ontology.filter(ontology => ontology !== 'ncbitaxon');
  // if (ontology.length > 0) {
  //   const olsResults = await fetchOLSSearchAPI({ ...params, ontology }, signal);
  //   searchResults.push(...olsResults);
  // }

  return searchResults;
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
    return `http://edamontology.org/${id}`;
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
        'children',
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
        const taxonId = item.taxid.toString();
        return {
          id: taxonId,
          commonName: item?.genbank_common_name || item?.common_name || '',
          hasChildren: item?.children.length > 0, // [TO DO]:BioThings API does not provide this information
          iri: formatIRI(taxonId, params.ontology),
          label: item.scientific_name.toLowerCase(),
          ontologyName: params.ontology,
          parentTaxonId: isRootNode ? null : item.parent_taxid.toString(),
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
 * [fetchChildrenFromBioThingsAPI]: Fetch the children information for a given ontology ID from the OLS API [docs](https://www.ebi.ac.uk/ols4/help)
 * and return structured ontology lineage items.
 *
 * NOTE: The OLS API does not provide lineage information for all taxon IDs. In such cases, we use the BioThings API.
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */

export const fetchChildrenFromBioThingsAPI = async (
  params: OntologyChildrenRequestParams,
  signal?: AbortSignal,
): Promise<{
  children: OntologyLineageItem[];
  pagination: OntologyPagination;
}> => {
  if (!params?.id) {
    throw new Error('No ID provided for the OLS API request.');
  }

  try {
    // Fetch the children with counts from the portal data.
    const childrenWithCounts: { taxonId: number; count: number }[] =
      await fetchSearchResults({
        q: params.q ? params.q : '__all__',
        size: 0,
        lineage: +params.node.id,
      }).then(response => {
        return response?.facets.lineage.children.childTaxonCounts;
      });

    // Fetch children data from the BioThings API
    const childrenFromBiothingsIds: BioThingsLineageAPIResponseItem =
      await axios
        .get(`${BIOTHINGS_API_URL}/taxon/${params.id}?include_children`)
        .then(res =>
          res?.data?.children?.filter((child: number) => {
            // filter out ids that are in children with counts
            return !childrenWithCounts.find(
              ({ taxonId }) => +taxonId === +child,
            );
          }),
        );

    const allChildrenIds = [
      ...childrenWithCounts.map(({ taxonId }) => {
        return taxonId;
      }),
      ...(Array.isArray(childrenFromBiothingsIds)
        ? childrenFromBiothingsIds
        : []),
    ];

    // No children found, return empty array
    if (!Array.isArray(allChildrenIds) || allChildrenIds.length === 0) {
      return {
        children: [],
        pagination: {
          hasMore: false,
          numPage: 0,
          totalPages: 0,
          totalElements: 0,
        },
      };
    }

    // select children ids based on pagination parameters
    const selectedChildrenIds = allChildrenIds.slice(
      params.from * params.size,
      (params.from + 1) * params.size,
    );

    // Fetch the detailed children information for each taxonId
    const {
      data: detailedLineageData,
    }: { data: BioThingsDetailedLineageAPIResponseItem[] } = await axios.post(
      `${BIOTHINGS_API_URL}/taxon`,
      {
        ids: selectedChildrenIds.join(','), // Stringify the lineage array
        fields: [
          'common_name',
          'genbank_common_name',
          'parent_taxid',
          'rank',
          'scientific_name',
          'taxid',
          'children',
        ],
      },
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    const processedChildrenData = detailedLineageData
      .map((item: BioThingsDetailedLineageAPIResponseItem, idx: number) => {
        // Must set the parent to empty string if it is the root node.
        const isRootNode = item.parent_taxid === item.taxid;
        const taxonId = item.taxid.toString();
        // get counts from portal if not 0
        const portalDetails = childrenWithCounts.find(
          ({ taxonId }) => taxonId === item.taxid,
        );

        return {
          id: taxonId,
          commonName: item?.genbank_common_name || item?.common_name || '',
          hasChildren: item?.children.length > 0, // [TO DO]:BioThings API does not provide this information
          iri: formatIRI(taxonId, params.ontology),
          label: item.scientific_name.toLowerCase(),
          ontologyName: params.ontology,
          parentTaxonId: isRootNode ? null : item.parent_taxid.toString(),
          rank: item.rank,
          state: {
            opened: false,
            selected: idx == 0, // select the first node (most specific) by default
          },
          taxonId,
        };
      })
      .reverse(); // reverse the array to start from the root node.
    // Return or process the POST response
    return {
      children: processedChildrenData,
      pagination: {
        hasMore: allChildrenIds.length > (params.from + 1) * params.size,
        numPage: params.from,
        totalPages: Math.ceil(allChildrenIds.length / params.size),
        totalElements: allChildrenIds.length,
      },
    };
  } catch (error: any) {
    console.error('Error in fetching from the BioThings API:', error.message);
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
        const taxonId = item.short_form.replace(/[^0-9]/g, '');
        const parentTaxonId =
          idx === lineageItems.length - 1
            ? null // Last term(root) has no parent
            : lineageItems[idx + 1].short_form.replace(/[^0-9]/g, '');

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
          taxonId,
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
  params: OntologyChildrenRequestParams,
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
      const taxonId = item.short_form.replace(/[^0-9]/g, '');
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
        taxonId,
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
  try {
    // fetch counts from NDE API

    const lineageWithCounts = await Promise.all(
      lineage.map(async node => {
        // Extract the numeric taxon ID from the node
        const numericTaxonId = +node.taxonId.replace(/[^0-9]/g, '');

        const lineageQueryResponse = await fetchSearchResults({
          q: params.q ? params.q : '__all__',
          size: 0,
          lineage: numericTaxonId,
        });

        // Extract counts for datasets directly related to this taxon ID
        const directTermCount =
          lineageQueryResponse?.facets?.lineage?.totalRecords || 0;

        // Extract the total number of datasets associated with this taxon ID and
        // its children.
        const termAndChildrenCount =
          lineageQueryResponse?.facets?.lineage?.totalLineageRecords || 0;

        // Extract counts for datasets where this taxon ID is a parent
        // const childTermsCount =
        //   lineageQueryResponse?.facets?.lineage?.children
        //     ?.totalUniqueChildRecords || 0;

        // Determine if the node has child taxon IDs.
        // [NOTE]: This only checks if the node has children in the NDE API.
        const hasChildTaxons =
          lineageQueryResponse?.facets?.lineage?.children?.childTaxonCounts
            ?.length > 0;

        // Return the updated node with counts and child status
        return {
          ...node,
          hasChildren:
            node.hasChildren ||
            hasChildTaxons ||
            termAndChildrenCount > directTermCount,
          counts: {
            termCount: directTermCount,
            // Total unique child records + total records with this actual term id.
            termAndChildrenCount,
          },
        };
      }),
    );

    return lineageWithCounts;
  } catch (error: any) {
    console.error('Error in fetching Portal counts data:', error.message);
    throw error;
  }
};
