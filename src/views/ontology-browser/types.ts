export interface BioThingsLineageAPIResponseItem {
  data: {
    _id: string;
    _version: number;
    authority: string[];
    children: number[];
    genbank_common_name: string;
    has_gene: true;
    lineage: number[];
    parent_taxid: number;
    rank: string;
    scientific_name: string;
    taxid: number;
    uniprot_name: string;
  };
}

export interface BioThingsDetailedLineageAPIResponseItem {
  _id: string;
  _version: number;
  common_name?: string;
  genbank_common_name?: string;
  parent_taxid: number;
  rank: string;
  scientific_name: string;
  taxid: number;
}

export interface OLSAPIResponseItem {
  iri: string;
  label: string;
  ontology_name: string;
  ontology_prefix: string;
  short_form: string;
  synonyms: string[];
  has_children: boolean;
}

export interface OntologyLineageRequestParams {
  id: number;
  ontology: string;
  lang?: string;
  from?: number;
  size?: number;
}

export interface OntologyLineageItem {
  id: string;
  commonName: string;
  hasChildren: boolean;
  iri: string;
  label: string;
  ontologyName: string;
  parentTaxonId: number | null;
  state: {
    opened: boolean;
    selected: boolean;
  };
  taxonId: number;
}

export interface OntologyLineageItemWithCounts extends OntologyLineageItem {
  counts: {
    termCount: number;
    termAndChildrenCount: number;
  };
}

export interface OntologyPagination {
  hasMore: boolean;
  numPage: number;
  totalPages: number;
  totalElements: number;
}