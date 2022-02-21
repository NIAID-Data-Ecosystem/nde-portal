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
  // orcid id
  '@id'?: string;
  '@type': string;
  affiliation?: {name: string};
  name: string;
}

export interface CuratedBy {
  '@type': string;
  name: string;
  url: string;
  versionDate: string;
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
