export interface FetchSearchResultsResponse {
  results: FormattedResource[];
  total: number;
  facets: Facet;
}

interface Facet {
  [key: string]: {
    missing: number;
    other: number;
    terms: FacetTerm[];
    total: number;
    _type: string;
  };
}

export interface FacetTerm {
  count: number;
  term: string;
}

export interface SearchResultsData {
  max_score: number;
  took: number;
  total: number;
  hits: SearchResultProps[];
}

export interface SearchResultProps {
  "@context": string;
  "@id": string;
  "@type": string;
  creator: Creator[];
  datePublished: string;
  description: string;
  headline: string;
  identifier: string;
  image: string;
  keywords: string[];
  license: string;
  name: string;
  url: string;
  temporalCoverage?: string[] | string;
  spatialCoverage?: string[] | string;
  inLanguage?: inLanguage | string;
  _id: string;
  _ignored: string[];
  _score: number;
}

export interface Citation {
  id: string | null;
  url: string | null;
  name: string | null;
  author: Creator[] | null;
  journalName: string | null;
  date: string | null;
  datePublished: string | null;
  pmid: string | null;
}

export interface CitedBy {
  "@type": string | null;
  abstract: string | null;
  citation: string | null;
  datePublished: string | null;
  description: string | null;
  doi: string | null;
  identifier: string | null;
  name: string | null;
  pmid: string | null;
  url: string | null;
}

export interface Creator {
  identifier: string | null; // orcid id
  type: string | null;
  affiliation: { name: string } | null;
  name: string | null;
}

export interface Distribution {
  encodingFormat: string | null;
  contentUrl: string | null;
  dateCreated: Date | string | null;
  dateModified: Date | string | null;
  datePublished: Date | string | null;
  description: string | null;
  name: string | null;
}

export interface Error {
  status: string;
  message: string;
}

export interface Funder {
  name: string | null;
  alternateName: string | string[] | null;
  role: string | null;
  description: string | null;
  parentOrganization: string | null;
  url: string | null;
}

export interface Funding {
  funder: Funder | null;
  identifier: string | null;
}

export interface includedInDataCatalog {
  name?: string | null;
  url?: string | null; //source repo url
  versionDate?: string | null;
  image?: string | null;
  identifier?: string | null;
}

export interface inLanguage {
  "@type": string;
  name: string;
  alternateName: string;
}

export interface Publisher {
  "@type": string;
  name: string;
}

// Type of resouce.
export type ResourceType = "dataset" | "computational tool" | "other";

// Conditions of access for dataset or tool.
export type AccessTypes =
  | "Open Access"
  | "Closed Access"
  | "Embargo"
  | "Restricted";

// Formatting standardized resource fields
export interface FormattedResource {
  id: string;
  type: string | null; // change to dataset |computational tool
  name: string;
  author: Creator[] | null;
  citation: Citation[] | null;
  citedBy: CitedBy[] | null;
  codeRepository: string | null;
  condition: string | null;
  conditionsOfAccess: AccessTypes | null;
  date: Date | string | null;
  dateCreated: Date | string | null;
  dateModified: Date | string | null;
  datePublished: Date | string | null;
  description: string | null;
  disease: string | null;
  distribution: Distribution[] | null;
  doi: string | null;
  funding: Funding[] | null;
  healthCondition: string | null;
  includedInDataCatalog: includedInDataCatalog | null;
  infectiousDisease: string | null;
  keywords: string[] | null;
  language: {
    alternateName: string | null;
    name: string | null;
  } | null;

  license: string | null;
  mainEntityOfPage: string | null;
  measurementTechnique: string[] | null;
  nctid: string | null;
  numberOfDownloads: number | null;
  publisher: Publisher | null;
  rawData: any;
  sameAs: string | null;
  spatialCoverage: string | null;
  species: string | null;
  temporalCoverage: string | null;
  topic: string[] | null;
  url: string | null; // link to dataset in the source repo.
  variableMeasured: string[] | null;
  version: number | null;
  numberOfViews: number | null;
}
