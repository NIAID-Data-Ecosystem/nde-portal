import axios from 'axios';
import { stratify } from '@visx/hierarchy';
import { HierarchyNode } from '@visx/hierarchy/lib/types';

const OLS_API_URL = 'https://www.ebi.ac.uk/ols4/api';

interface SearchParams {
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

export interface OntologyTreeParams {
  id: string;
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
  hasChildren: boolean;
  label: string;
  taxonId: string;
}

export interface OntologyTreeResponse {
  children: OntologyTreeItem[];
  lineage: OntologyTreeItem[];
  tree: HierarchyNode<OntologyTreeItem>;
}

export const fetchOntologyTreeByTaxonId = async (
  params: OntologyTreeParams,
  signal?: AbortSignal,
): Promise<OntologyTreeResponse> => {
  if (!params?.id) {
    throw new Error('No id provided');
  }

  const { ontology, ...rest } = params;
  const iri =
    params.ontology.toLowerCase() === 'edam'
      ? `http://edamontology.org/${params.id}`
      : `http://purl.obolibrary.org/obo/${params.id}`;

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

  // Fetch the children data.
  const node_id = lineage[lineage.length - 1].id;
  const { children } = await fetchOntologyChildrenByNodeId(
    node_id,
    params,
    signal,
  );

  const tree = transformArray2Tree([...lineage, ...children]);
  // [Note]: returning both array and hierarchy form until we decide which structure we want.
  return { children, lineage, tree };
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
  const iri =
    params.ontology.toLowerCase() === 'edam'
      ? `http://edamontology.org/${params.id}`
      : `http://purl.obolibrary.org/obo/${params.id}`;

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

  return { children };
};

// Helper function to get children of a node
export const getChildren = (
  parentId: OntologyTreeItem['id'],
  data: OntologyTreeItem[],
) => {
  return data.filter(item => item.parent === parentId);
};
