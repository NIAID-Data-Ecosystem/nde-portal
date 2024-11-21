import axios from 'axios';
import { stratify } from '@visx/hierarchy';
import { fetchSearchResults } from 'src/utils/api';
import { HierarchyNode } from '@visx/hierarchy/lib/types';

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

export interface OntologyTreeParams {
  id: string;
  q: string;
  ontology: 'edam' | 'ncbitaxon';
  lang?: string;
  siblings?: boolean;
  viewMode?: string;
}

interface OntologyTreeItemRaw {
  children: boolean;
  id: string;
  parent: string;
  iri: string;
  state: {
    opened: boolean;
    selected: boolean;
  };
  text: string;
  ontology_name: string;
}

export interface OntologyTreeItem
  extends Omit<OntologyTreeItemRaw, 'children'> {
  label: string;
  taxonId: string;
}
export interface OntologyTreeItemWithCounts extends OntologyTreeItem {
  counts: {
    term: number;
    lineage: number;
  };
  hasChildren: boolean;
}
export interface OntologyTreeResponse {
  children: OntologyTreeItem[];
  lineage: OntologyTreeItem[];
  tree: HierarchyNode<OntologyTreeItem>;
}

/**
 * [fetchFromBioThingsAPI]: Fetch lineage information for a given taxon ID from the Biothings API
 * and return structured ontology lineage items.
 *
 * @param params - The search parameters used to fetch the lineage.
 * @returns An array of lineage items.
 */
export const fetchFromBioThingsAPI = async (
  params: OntologyTreeParams,
): Promise<{ lineage: OntologyTreeItem[] }> => {
  try {
    // Extract the numerical taxon ID from the params id.
    const numericTaxonId = params.id.replace(/[^0-9]/g, '');

    // Fetch lineage data from the BioThings API
    const lineageAPIResponse = await axios.get(
      `https://t.biothings.io/v1/taxon/${numericTaxonId}`,
    );
    const rawLineageData = lineageAPIResponse.data.lineage;

    if (!Array.isArray(rawLineageData)) {
      throw new Error('lineage data is not available or invalid');
    }

    // Stringify the lineage array
    const lineageString = rawLineageData.join(',');
    const postData = {
      ids: lineageString,
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
    const { data: detailedLineageData } = await axios.post(
      'https://t.biothings.io/v1/taxon',
      postData,
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    const processedLineage = detailedLineageData
      .map((item: any, idx: number) => {
        // Must set the parent to empty string if it is the root node.
        const isRootNode = item.parent_taxid === item.taxid;
        return {
          id: item.taxid,
          parent: isRootNode ? '' : item.parent_taxid,
          taxonId: item.taxid,
          text: item.scientific_name,
          label: item.scientific_name,
          ontology_name: params.ontology,
          iri: `http://purl.obolibrary.org/obo/NCBITaxon_${item.taxid}`,
          state: {
            opened: true,
            selected: idx == 0, // select the first node (most specific) by default
          },
          counts: {
            term: 0,
            lineage: 0,
          },
          hasChildren: true,
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
  lineage: OntologyTreeItem[],
  params: OntologyTreeParams,
): Promise<{ lineage: OntologyTreeItem[] }> => {
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

const formatIRI = (
  id: OntologyTreeParams['id'],
  ontology: OntologyTreeParams['ontology'],
) => {
  if (ontology.toLowerCase() === 'edam') {
    const iri_id = id.includes('EDAM') ? id.replace('EDAM_', 'topic_') : id;
    return `http://edamontology.org/${iri_id}`;
  }
  return `http://purl.obolibrary.org/obo/${id}`;
};

export const fetchOntologyTreeByTaxonId = async (
  params: OntologyTreeParams,
  signal?: AbortSignal,
): Promise<OntologyTreeResponse> => {
  if (!params?.id) {
    throw new Error('No id provided');
  }

  const { ontology, q, ...rest } = params;

  const iri = formatIRI(params.id, params.ontology);

  // Note that: IRIs must be double URL encoded: https://www.ebi.ac.uk/ols4/help
  const encodedIri = encodeURIComponent(encodeURIComponent(iri));

  // Fetch the tree data
  const { lineage } = await axios
    .get(`${OLS_API_URL}/ontologies/${ontology}/terms/${encodedIri}/jstree?`, {
      params: {
        lang: 'en',
        siblings: false,
        viewMode: 'PreferredRoots',
        ...rest,
      },
      signal,
    })
    .then(response => {
      const data: OntologyTreeItemRaw[] = response.data;
      const lineage = data.map(item => {
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
          text,
          taxonId,
        };
      });

      return { lineage };
    });

  // Fetch the counts for each node in the lineage
  const lineageWithCounts = await Promise.all(
    lineage.map(async node => {
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

  // Fetch the children data.
  const node_id = lineage[lineage.length - 1].id;

  const { children } = await fetchOntologyChildrenByNodeId(
    node_id,
    params,
    signal,
  );

  // const tree = transformArray2Tree([...lineage, ...children]);
  // [Note]: returning both array and hierarchy form until we decide which structure we want.
  return { children, lineage: lineageWithCounts };
};

export const sortChildrenList = (childrenList: OntologyTreeItem[]) => {
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
    taxonId: OntologyTreeItem['taxonId'];
    ontology_name: OntologyTreeItem['ontology_name'];
  },
  params: OntologyTreeParams,
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
    taxonId: OntologyTreeItem['taxonId'];
    ontology_name: OntologyTreeItem['ontology_name'];
  },
  params: OntologyTreeParams,
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

export const transformArray2Tree = (data: OntologyTreeItem[]) => {
  const tree = stratify<OntologyTreeItem>()
    .id(d => d.id)
    .parentId(d => d.parent)(data);

  return tree;
};

export const fetchOntologyChildrenByNodeId = async (
  nodeId?: string,
  params?: OntologyTreeParams,
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
  children: OntologyTreeItem[];
  hasMore: boolean;
  numPage: number;
  totalPages: number;
  totalElements: number;
}

// export const fetchOntologyChildrenByTaxonID = async (
//   params?: OntologyDescendantsParams,
//   signal?: AbortSignal,
// ): Promise<PaginatedOntologyTreeResponse> => {
//   if (!params?.id) {
//     throw new Error('No id provided');
//   }
//   const { id, ontology, parentId, ...rest } = params;
//   const iri = formatIRI(id, ontology);

//   // Note that: IRIs must be double URL encoded: https://www.ebi.ac.uk/ols4/help
//   const encodedIri = encodeURIComponent(encodeURIComponent(iri));

//   // Fetch the children data.
//   const data = await axios
//     .get(
//       `${OLS_API_URL}/ontologies/${ontology}/terms/${encodedIri}/children?`,
//       {
//         params: {
//           ...rest,
//           lang: params.lang || 'en',
//         },
//         signal,
//       },
//     )
//     .then(response => {
//       const data = response.data;
//       const hasMore = data.page.number < data.page.totalPages - 1;
//       const children = data['_embedded']['terms'].map(
//         (item: OntologyDescendantsItemRaw) => {
//           const { iri, has_children, label, ontology_name, short_form } = item;

//           const taxonId = iri.split('/').pop() || '';

//           return {
//             hasChildren: has_children,
//             id: short_form,
//             iri,
//             label,
//             ontology_name,
//             taxonId,
//             facet: ['species.identifier'],
//             parent: params.parentId,
//             state: {
//               opened: false,
//               selected: false,
//             },
//           };
//         },
//       );
//       return {
//         hasMore,
//         numPage: data.page.number,
//         totalPages: data.page.totalPages,
//         totalElements: data.page.totalElements,
//         children,
//       };
//     });

//   const childrenWithCounts = await Promise.all(
//     data.children.map(async node => {
//       if (node.ontology_name === 'ncbitaxon' || node.ontology_name === 'edam') {
//         const termCountData = await fetchTermCountsForNode(node, params);
//         const lineageCountData = await fetchLineageCountsForNode(node, params);
//         return {
//           ...node,
//           facet: 'species.identifier',
//           counts: {
//             term: termCountData.total,
//             lineage: lineageCountData.total,
//           },
//         };
//       }
//       return node;
//     }),
//   );
//   return { ...data, children: sortChildrenList(childrenWithCounts) };
// };

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
  parentId: OntologyTreeItem['id'],
  data: OntologyTreeItem[],
) => {
  return data.filter(item => item.parent === parentId);
};

export const formatIdentifier = (node: { id: string }) => {
  if (node.id.includes('NCBITaxon')) {
    return node.id.split('_')[1];
  }
  return node.id;
};
