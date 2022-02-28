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

export interface inLanguage {
  '@type': string;
  name: string;
  alternateName: string;
}

export interface Error {
  status: string;
  message: string;
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

export interface Funding {
  funder: {
    name: string | null;
    role: string | null;
  } | null;
  identifier: string | null;
  description: string | null;
  url: string | null;
}

export interface Distribution {
  encodingFormat: string | null;
  contentUrl: string | null;
  dateCreated: Date | null;
  dateModified: Date | null;
  datePublished: Date | null;
  description: string | null;
  name: string | null;
}

// Type of resouce.
export type ResourceType = 'dataset' | 'computational tool' | 'other';

// Conditions of access for dataset or tool.
export type AccessTypes = 'restricted' | 'public' | 'controlled';

export interface FormattedResource {
  id: string;
  doi: string;
  type: string | null; // change to dataset |computational tool
  name: string;
  appearsIn: Citation[] | null;
  citation: Citation[] | null;
  codeRepository: string | null;
  conditionsOfAccess: AccessTypes | null;
  creator: Creator[] | null;
  curatedBy: CuratedBy | null;
  dateCreated: Date | null;
  dateModified: Date | null;
  datePublished: Date | null;
  description: string | null;
  distribution: Distribution[] | null;
  funding: Funding[] | null;
  keywords: string[] | null;
  language: {
    alternateName: string | null;
    name: string | null;
  } | null;
  license: string | null;
  mainEntityOfPage: string | null;
  measurementTechnique: string[] | null;
  numberOfDownloads: number | null;
  sameAs: string | null;
  spatialCoverage: string | null;
  temporalCoverage: string | null;
  topic: string[] | null;
  url: string | null; // link to dataset in the source repo.
  variableMeasured: string[] | null;
  version: number | null;
  numberOfViews: number | null;
}
