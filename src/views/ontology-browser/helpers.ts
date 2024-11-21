import axios from 'axios';
import { stratify } from '@visx/hierarchy';
import { fetchSearchResults } from 'src/utils/api';
import { HierarchyNode } from '@visx/hierarchy/lib/types';
import {
  BioThingsDetailedLineageAPIResponseItem,
  BioThingsLineageAPIResponseItem,
  OLSAPIResponseItem,
  OntologyLineageItem,
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
} from './types';

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
 * [fetchFromBioThingsAPI]: Fetch lineage information for a given taxon ID from the Biothings API
 * and return structured ontology lineage items.
 *
 * NOTE: We use the BioThings API to fetch lineage information for the NCBI Taxonomy ontology.
 * It follows the NCBI Taxonomy more closely than the OLS API. (ex: TAXON ID 3366610 is not available in OLS)
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */

export const fetchFromBioThingsAPI = async (
  params: OntologyLineageRequestParams,
): Promise<{ lineage: OntologyLineageItem[] }> => {
  if (!params?.id) {
    throw new Error('No id provided');
  }
  try {
    // Extract the numerical taxon ID from the params id.
    const numericTaxonId = params.id.replace(/[^0-9]/g, '');

    // Fetch lineage data from the BioThings API
    const lineageAPIResponse: BioThingsLineageAPIResponseItem = await axios.get(
      `${BIOTHINGS_API_URL}/taxon/${numericTaxonId}`,
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
        const taxonId = item.taxid.toString();
        return {
          id: item.taxid,
          commonName: item?.genbank_common_name || item?.common_name || '',
          iri: formatIRI(taxonId, params.ontology),
          label: item.scientific_name.toLowerCase(),
          ontologyName: params.ontology,
          parentId: isRootNode ? null : item.parent_taxid,
          rank: item.rank,
          state: {
            opened: true,
            selected: idx == 0, // select the first node (most specific) by default
          },
          taxonId: taxonId,
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
 * [fetchFromOLSAPI]: Fetch lineage information for a given ontology ID from the OLS API [docs](https://www.ebi.ac.uk/ols4/help)
 * and return structured ontology lineage items.
 *
 * NOTE: The OLS API does not provide lineage information for all taxon IDs. In such cases, we use the BioThings API.
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */

export const fetchFromOLSAPI = async (
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
        const parentId =
          idx === lineageItems.length - 1
            ? null // Last term(root) has no parent
            : +lineageItems[idx + 1].short_form.replace(/[^0-9]/g, '');

        return {
          id: +numericTaxonId,
          commonName: item?.synonyms?.[0] || '',
          iri: item.iri,
          label: item.label.toLowerCase(),
          ontologyName: item.ontology_name,
          parentId,
          state: {
            opened: true,
            selected: idx == 0, // Mark the first item as selected
          },
          taxonId: item.short_form,
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
  params: OntologyLineageRequestParams,
): Promise<{ lineage: OntologyLineageItemWithCounts[] }> => {
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

      // Determine if the node has child taxon IDs
      const hasChildTaxons =
        lineageQueryResponse?.facets?.lineage?.children_of_lineage?.taxon_ids
          ?.terms?.length > 0;

      // Return the updated node with counts and child status
      return {
        ...node,
        hasChildren: hasChildTaxons,
        counts: {
          term: directTermCount,
          lineage: directTermCount + childTermsCount,
        },
      };
    }),
  );

  return { lineage: lineageWithCounts };
};

export const sortChildrenList = (childrenList: OntologyLineageItem[]) => {
  return childrenList.sort((a, b) => {
    // First, sort by `counts.term` in descending order
    if (a.counts.term !== b.counts.term) {
      return b.counts.term - a.counts.term;
    }

    // Then, sort by `lineage` in descending order
    if (a.counts.lineage !== b.counts.lineage) {
      return b.counts.lineage - a.counts.lineage;
    }

    return 0;
  });
};

export const fetchTermCountsForNode = async (
  node: {
    taxonId: OntologyLineageItem['taxonId'];
    ontology_name: OntologyLineageItem['ontology_name'];
  },
  params: OntologyLineageRequestParams,
) => {
  console.log(node);
  const id = node.taxonId.toString().replace(/[^0-9]/g, '');
  // const query = params.q ? params.q : '__all__';
  // const lineageQuery = await fetchSearchResults({
  //   q: query,
  //   size: 0,
  //   lineage: +id,
  // });
  // const total =
  //   lineageQuery?.facets?.lineage?.children_of_lineage?.to_parent?.doc_count ||
  //   0;
  // return { total, facet: 'species.identifier' };
  // const id = formatIdentifier({ id: node.taxonId });
  // Separate query handlers for ncbitaxon and edam
  if (node.ontology_name === 'ncbitaxon') {
    const species_property = 'species.identifier';
    const infectiousAgent_property = 'infectiousAgent.identifier';

    /*
  Based on the counts (maybe by running multiple queries), we can decide which facet to use (i.e. infectiousAgent vs species) when executing the final search.
  Then instead of "OR"ing these two general categories which could be really long depending on the onto. We can drill down further to the specific facet. (i.e. species.identifier:"####" OR species.name "-----")
  */
    const speciesQuery = fetchSearchResults({
      q: `${params.q ? `${params.q} AND ` : ''}(${species_property}:"${id}")`,
      size: 0,
    });

    const infectiousAgentQuery = fetchSearchResults({
      q: `${
        params.q ? `${params.q} AND ` : ''
      }(${infectiousAgent_property}:"${id}")`,
      size: 0,
    });

    // Wait for both queries to complete
    const [speciesResult, infectiousAgentResult] = await Promise.all([
      speciesQuery,
      infectiousAgentQuery,
    ]);

    if (speciesResult?.total) {
      return { total: speciesResult.total, facet: [species_property] };
    } else if (infectiousAgentResult?.total) {
      return {
        total: infectiousAgentResult.total,
        facet: [infectiousAgent_property],
      };
    } else {
      return {
        total: 0,
        facet: [infectiousAgent_property, species_property],
      };
    }
  } else if (node.ontology_name === 'edam') {
    const topicCategory_property = 'topicCategory.identifier';
    const edamQuery = fetchSearchResults({
      q: `${
        params.q ? `${params.q} AND ` : ''
      }(${topicCategory_property}:"${id}")`,
      size: 0,
    });

    const topicCategoryResult = await edamQuery;

    return {
      total: topicCategoryResult?.total || 0,
      facet: [topicCategory_property],
    };
  }

  return {
    total: 0,
    facet: [],
  };
};

export const fetchLineageCountsForNode = async (
  node: {
    taxonId: OntologyLineageItem['taxonId'];
    ontology_name: OntologyLineageItem['ontology_name'];
  },
  params: OntologyLineageRequestParams,
) => {
  const id = node.taxonId.replace(/[^0-9]/g, '');
  const query = params.q ? params.q : '__all__';
  const lineageQuery = await fetchSearchResults({
    q: query,
    size: 0,
    lineage: +id,
  });
  const count =
    lineageQuery?.facets?.lineage?.children_of_lineage?.to_parent?.doc_count ||
    0;

  if (!count) {
    return { total: 0 };
  }
  return { total: count };
};

export const transformArray2Tree = (data: OntologyLineageItem[]) => {
  const tree = stratify<OntologyLineageItem>()
    .id(d => d.id)
    .parentId(d => d.parent)(data);

  return tree;
};

export const fetchOntologyChildrenByNodeId = async (
  nodeId?: string,
  params?: OntologyLineageRequestParams,
  signal?: AbortSignal,
): Promise<{ children: OntologyTreeResponse['children'] }> => {
  if (!nodeId || !params?.id) {
    throw new Error('No id provided');
  }
  const { ontology, ...rest } = params;
  const iri = formatIRI(params.id, params.ontology);

  // Note that: IRIs must be double URL encoded: https://www.ebi.ac.uk/ols4/help
  const encodedIri = encodeURIComponent(encodeURIComponent(iri));

  // Fetch the children data.
  const { children } = await axios
    .get(
      `${OLS_API_URL}/ontologies/${ontology}/terms/${encodedIri}/jstree/children/${nodeId}?`,
      {
        params: {
          lang: params.lang || 'en',
        },
        signal,
      },
    )
    .then(response => {
      const data: OntologyTreeItemRaw[] = response.data;
      const children = data.map(item => {
        const { id, iri, ontology_name, state, text } = item;
        // set the parent to empty string if it is the root node.
        const parent = item.parent === '#' ? '' : item.parent;
        const taxonId = iri.split('/').pop() || '';

        return {
          hasChildren: item.children,
          id,
          iri,
          label: item.text,
          ontology_name,
          parent,
          state,
          taxonId,
          text,
        };
      });

      return { children };
    });
  // Fetch the counts for each node in the lineage
  const childrenWithCounts = await Promise.all(
    children.map(async node => {
      if (node.ontology_name === 'ncbitaxon' || node.ontology_name === 'edam') {
        const termCountData = await fetchTermCountsForNode(node, params);
        const lineageCountData = await fetchLineageCountsForNode(node, params);
        return {
          ...node,
          facet: termCountData.facet,
          counts: {
            term: termCountData.total,
            lineage: lineageCountData.total,
          },
        };
      }
      return node;
    }),
  );
  return { children: sortChildrenList(childrenWithCounts) };
};

export interface OntologyDescendantsParams {
  id: string;
  q: string;
  ontology: 'edam' | 'ncbitaxon';
  size: number;
  page: number;
  parentId: string;
  lang?: string;
}

export interface OntologyDescendantsItemRaw {
  iri: string;
  has_children: boolean;
  label: string;
  ontology_name: string;
  short_form: string;
}

export interface OntologyDescentdantsItem
  extends Omit<OntologyDescendantsItemRaw, 'has_children' | 'short_form'> {
  id: string;
  hasChildren: boolean;
  taxonId: string;
  parentId: string;
}

export interface PaginatedOntologyTreeResponse {
  children: OntologyLineageItem[];
  hasMore: boolean;
  numPage: number;
  totalPages: number;
  totalElements: number;
}

const formatIRI = (
  id: OntologyLineageRequestParams['id'],
  ontology: OntologyLineageRequestParams['ontology'],
) => {
  if (ontology.toLowerCase() === 'edam') {
    const iri_id = id.includes('EDAM') ? id.replace('EDAM_', 'topic_') : id;
    return `http://edamontology.org/${iri_id}`;
  } else if (ontology.toLowerCase() === 'ncbitaxon') {
    return `http://purl.obolibrary.org/obo/NCBITaxon_${id}`;
  }
  return `http://purl.obolibrary.org/obo/${id}`;
};

export const fetchOntologyChildrenByTaxonID = async (
  params?: OntologyDescendantsParams,
  signal?: AbortSignal,
): Promise<PaginatedOntologyTreeResponse> => {
  if (!params?.id) {
    throw new Error('No id provided');
  }

  const { id, ontology, parentId, ...rest } = params;
  const iri = formatIRI(id, ontology);

  // Note that: IRIs must be double URL encoded: https://www.ebi.ac.uk/ols4/help
  const encodedIri = encodeURIComponent(encodeURIComponent(iri));
  // Fetch the children data.
  const data = await axios
    .get(
      `${OLS_API_URL}/ontologies/${ontology}/terms/${encodedIri}/children?`,
      {
        params: {
          ...rest,
          lang: params.lang || 'en',
        },
        signal,
      },
    )
    .then(response => {
      const data = response.data;
      const hasMore = data.page.number < data.page.totalPages - 1;
      const children = data['_embedded']['terms'].map(
        (item: OntologyDescendantsItemRaw) => {
          const { iri, has_children, label, ontology_name, short_form } = item;

          const taxonId = iri.split('/').pop() || '';

          return {
            hasChildren: has_children,
            id: short_form,
            iri,
            label,
            ontology_name,
            taxonId,
            facet: ['species.identifier'],
            parent: params.parentId,
            state: {
              opened: false,
              selected: false,
            },
          };
        },
      );
      return {
        hasMore,
        numPage: data.page.number,
        totalPages: data.page.totalPages,
        totalElements: data.page.totalElements,
        children,
      };
    });

  const taxon_id = params.id.replace(/[^0-9]/g, '');
  const query = params.q ? params.q : '__all__';
  const lineageQuery = await fetchSearchResults({
    q: query,
    size: 0,
    lineage: +taxon_id,
  });
  const termCountsFromNDE =
    lineageQuery?.facets?.lineage?.children_of_lineage?.taxon_ids?.terms;
  console.log('termCountsFromNDE', data);
  const childrenWithCounts = await Promise.all(
    data.children.map(async node => {
      if (node.ontology_name === 'ncbitaxon' || node.ontology_name === 'edam') {
        const id = node.taxonId.replace(/[^0-9]/g, '');
        const lineageCount = termCountsFromNDE.find(
          ({ term }) => term === +id,
        )?.count;
        const termCountData = await fetchTermCountsForNode(node, params);
        // const lineageCountData = await fetchLineageCountsForNode(node, params);
        return {
          ...node,
          facet: 'species.identifier',
          counts: {
            term: termCountData.total,
            lineage: lineageCount || 0,
          },
        };
      }
      return node;
    }),
  );

  console.log('children', childrenWithCounts);
  return { ...data, children: sortChildrenList(childrenWithCounts) };
};

// Helper function to get children of a node
export const getChildren = (
  parentId: OntologyLineageItemWithCounts['id'],
  data: OntologyLineageItemWithCounts[],
) => {
  return data.filter(item => item.parentId === parentId);
};

export const formatIdentifier = (node: { id: string }) => {
  if (node.id.includes('NCBITaxon')) {
    return node.id.split('_')[1];
  }
  return node.id;
};
