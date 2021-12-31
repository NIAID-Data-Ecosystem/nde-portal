export interface SearchResultsData {
  max_score: number;
  took: number;
  total: number;
  hits: SearchResult[];
}

export interface SearchResult {
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
  _id: string;
  _ignored: string[];
  _score: number;
}

export interface Creator {
  '@type': string;
  affiliation: {name: string};
  name: string;
}

export interface CuratedBy {
  '@type': string;
  name: string;
  url: string;
  versionDate: string;
}
