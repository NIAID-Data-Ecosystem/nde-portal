export interface FetchSearchResultsResponse {
  results: FormattedResource[];
  total: number;
  facets: Facet;
}

export interface Facet {
  [key: string]: {
    missing: number;
    other: number;
    terms: FacetTerm[];
    total: number;
    _type: string;
  };
}

type NestedFacet =
  | {
      missing: number;
      other: number;
      terms: FacetTerm[];
      total: number;
      _type: string;
    }
  | number
  | string;

export interface FacetTerm {
  count: number;
  term: string;
  [key: string]: NestedFacet;
}

export interface SearchResultsData {
  max_score: number;
  took: number;
  total: number;
  hits: SearchResultProps[];
}

export interface SearchResultProps {
  '@context': string;
  '@id': string;
  '@type': string;
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
  journalNameAbbrev: string | null;
  date: string | null;
  datePublished: string | null;
  pmid: string | null;
  doi: string | null;
  issueNumber: string | null;
  volumeNumber: string | null;
  pagination: string | null;
}

export interface CitedBy {
  '@type': string | null;
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
  familyName: string | null;
  givenName: string | null;
  role: string | null;
  title: string | null;
  url: string | null;
}

export interface Distribution {
  encodingFormat: string | null;
  contentUrl: string | null;
  dateCreated: Date | string | null;
  dateModified: Date | string | null;
  datePublished: Date | string | null;
  description: string | null;
  name: string | null;
  '@id': string | null;
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
  url: string | null;
  description: string | null;
}

export interface includedInDataCatalog {
  name?: string | null;
  url?: string | null; //source repo url
  versionDate?: string | null;
  image?: string | null;
  identifier?: string | null;
}

export interface inLanguage {
  '@type': string;
  name: string;
  alternateName: string;
}

export interface Publisher {
  '@type': string;
  name: string;
}

export interface PropertyNameWithURL {
  name?: string | string[];
  url?: string;
}

// Type of resouce.
export type ResourceType = 'Dataset' | 'Computational Tool' | 'Other';

// Conditions of access for dataset or tool.
export type AccessTypes = 'Open' | 'Controlled' | 'Embargoed' | 'Restricted';

export interface SdPublisher {
  identifier: string;
  name: string;
  url: string;
}

// Formatting standardized resource fields
export interface FormattedResource {
  [key: string]: any;
  id: string;
  type: string | null; // "Dataset" | "ComputationalTool"
  name: string;
  author: Creator[] | null;
  citation: Citation[] | null;
  citedBy: CitedBy[] | null;
  codeRepository: string[] | string | null;
  condition: string | null;
  conditionsOfAccess: AccessTypes | null;
  date: string | null;
  dateCreated: string | null;
  dateModified: string | null;
  datePublished: string | null;
  description: string | null;
  disease: string | null;
  distribution: Distribution[] | null;
  doi: string | null;
  funding: Funding[] | null;
  healthCondition: PropertyNameWithURL[] | null;
  includedInDataCatalog: includedInDataCatalog | null;
  infectiousAgent: PropertyNameWithURL[] | null;
  keywords: string[] | null;
  language: {
    alternateName: string | null;
    name: string | null;
  } | null;

  license: string | null;
  mainEntityOfPage: string | null;
  measurementTechnique: PropertyNameWithURL[] | null;
  nctid: string | null;
  numberOfDownloads: number | null;
  pmid: string | null;
  publisher: Publisher | null;
  rawData: any;
  sameAs: string | null;
  sdPublisher: SdPublisher | null;
  spatialCoverage: string | null;
  species: PropertyNameWithURL[] | null;
  temporalCoverage: string | null;
  topic: string[] | null;
  url: string | null; // link to dataset in the source repo.
  variableMeasured: string[] | null;
  version: number | null;
  numberOfViews: number | null;
}

export interface MetadataSource {
  code: {
    file: string;
    repo: string;
    commit: string;
    branch: string;
    url: string;
  };
  sourceInfo: {
    name: string;
    description: string;
    schema: Object | null;
    url: string;
    identifier: string;
  };
  stats: { [key: string]: number };
  version: Date;
}

export interface Metadata {
  biothing_type: string;
  build_date: Date;
  build_version: string;
  src: {
    [key: string]: MetadataSource;
  };
}
