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
  curatedBy: CuratedBy;
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
  author: {name: string} | null;
  journalName: string | null;
  date: string | null;
  pmid: string | null;
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
  id: string | null; // orcid id
  type: string | null;
  affiliation: {name: string} | null;
  name: string | null;
}

export interface CuratedBy {
  name: string | null;
  url: string | null; //source repo url
  versionDate: string | null;
  image: string | null;
  identifier: string | null;
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

export interface Funding {
  funder: {
    name: string | null;
    alternateName: string | string[] | null;
    role: string | null;
    description: string | null;
    parentOrganization: string | null;
    url: string | null;
  } | null;
  identifier: string | null;
}

export interface includedInDataCatalog {
  name: string | null;
  url: string | null; //source repo url
  versionDate: string | null;
  image: string | null;
  identifier: string | null;
}

export interface inLanguage {
  '@type': string;
  name: string;
  alternateName: string;
}

// Type of resouce.
export type ResourceType = 'dataset' | 'computational tool' | 'other';

// Conditions of access for dataset or tool.
export type AccessTypes = 'restricted' | 'public' | 'controlled';

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
  curatedBy: CuratedBy | null;
  dateCreated: Date | string | null;
  dateModified: Date | string | null;
  datePublished: Date | string | null;
  description: string | null;
  disease: string | null;
  distribution: Distribution[] | null;
  doi: string;
  funding: Funding[] | null;
  includedInDataCatalog: includedInDataCatalog | null;
  keywords: string[] | null;
  language: {
    alternateName: string | null;
    name: string | null;
  } | null;
  license: string | null;
  mainEntityOfPage: string | null;
  measurementTechnique: string[] | null;
  numberOfDownloads: number | null;
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
