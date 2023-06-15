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
  displayAs: string;
  [key: string]: NestedFacet;
}

// Type of resource.
export type ResourceType =
  | 'Dataset'
  | 'Computational Tool'
  | 'Software'
  | 'Scholarly Article'
  | 'Other';

// Conditions of access for dataset or tool.
export type AccessTypes = 'Open' | 'Controlled' | 'Embargoed' | 'Restricted';

export interface AdditionalType {
  name?: string;
  url?: string;
}

interface AggregateRating {
  '@type'?: string;
  ratingCount?: number;
  ratingValue?: number;
  reviewAspect?: string;
}

interface ApplicationSubCategory {
  identifier?: string;
  name: string;
  url?: string;
}

export interface Author {
  identifier: string | null; // orcid id
  type: string | null;
  affiliation: { name: string; sameAs?: string } | null;
  name: string | null;
  email: string | null;
  familyName: string | null;
  givenName: string | null;
  role: string | null;
  title: string | null;
  url: string | null;
}

export interface Citation {
  id: string | null;
  url: string | null;
  name: string | null;
  author: Author[] | null;
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

interface CuratedBy {
  name?: string;
  url?: string;
  versionDate?: string;
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

export interface HasPart {
  '@id'?: string;
  '@type'?: string;
  encodingFormat?: string;
  identifier?: string;
  name?: string;
  url?: string;
}

export interface IncludedInDataCatalog {
  '@type'?: string | null;
  name?: string | null;
  url?: string | null; //source repo url
  versionDate?: string | null;
  image?: string | null;
  identifier?: string | null;
}

export interface InteractionStatistics {
  '@type'?: string | null;
  userInteractionCount: number | null;
  interactionType: string | null;
}

export interface IsBasedOn {
  '@type'?: string;
  _id?: string;
  abstract?: string;
  additionalType?: AdditionalType;
  citation?: string;
  datePublished?: string;
  description?: string;
  doi?: string;
  identifier?: string;
  name?: string;
  pmid?: string;
  url?: string;
}

export interface IsBasisFor {
  identifier?: string;
  name?: string;
  url?: string;
}

export interface IsPartOf {
  id?: string;
  '@type'?: string;
  name?: string;
  identifier?: string;
  url?: string;
}

export interface IsRelatedTo {
  _id?: string;
  '@type'?: string;
  hasPart: HasPart;
  identifier?: string;
  includedInDataCatalog?: IncludedInDataCatalog;
  name?: string;
  relationship?: string;
}

export interface PropertyNameWithURL {
  name?: string | string[];
  url?: string;
}

export interface Publisher {
  '@type': string;
  name: string;
}

export interface SdPublisher {
  identifier?: string;
  name?: string;
  url?: string;
}

interface SpatialCoverage {
  identifier?: string;
  geo?: {
    latitude?: number;
    longitude?: number;
  };
  name?: string;
}

export interface Species extends PropertyNameWithURL {
  additionalType?: AdditionalType;
  identifier?: string;
}

interface TemporalCoverage {
  temporalInterval: {
    duration?: string[];
    endDate?: string;
    name?: string;
    startDate?: string;
  };
}

interface TopicCategory {
  description?: string;
  name?: string;
  url?: string;
  curatedBy?: {
    name?: string;
    url?: string;
  };
}

export interface InputProperties {
  description?: string;
  identifier?: string;
  name?: string;
  encodingFormat?: string;
}

export interface OutputProperties {
  identifier?: string;
  name?: string;
  encodingFormat?: string;
}
// Formatting standardized resource fields
export interface FormattedResource {
  [key: string]: any;
  id: string;
  type: string | null; // "Dataset" | "ComputationalTool"
  name: string;
  abstract: string | null;
  aggregateRating: AggregateRating | null;
  alternateName: string | null;
  applicationCategory: string[] | null;
  applicationSubCategory: ApplicationSubCategory[] | null;
  applicationSuite: string[] | null;
  author: Author[] | null;
  availableOnDevice: string | null;
  citation: Citation[] | null;
  citedBy: CitedBy[] | null;
  codeRepository: string[] | string | null;
  condition: string | null;
  conditionsOfAccess: AccessTypes | null;
  curatedBy: CuratedBy | null;
  date: string | null;
  dateCreated: string | null;
  dateModified: string | null;
  datePublished: string | null;
  description: string | null;
  discussionUrl: string[] | null;
  disease: string | null;
  distribution: Distribution[] | null;
  doi: string | null;
  downloadUrl: { name: string }[] | null;
  funding: Funding[] | null;
  hasPart: HasPart[] | null;
  healthCondition: PropertyNameWithURL[] | null;
  includedInDataCatalog: IncludedInDataCatalog | null;
  infectiousAgent: PropertyNameWithURL[] | null;
  inLanguage: {
    alternateName: string | null;
    name: string | null;
  } | null;
  input: InputProperties[] | null;
  interactionStatistics: InteractionStatistics | null;
  isAccessibleForFree: boolean | null;
  isBasedOn: IsBasedOn[] | null;
  isBasisFor: IsBasisFor[] | null;
  isPartOf: IsPartOf[] | null;
  isRelatedTo: IsRelatedTo[] | null;
  keywords: string[] | null;
  license: string | null;
  mainEntityOfPage: string | null;
  measurementTechnique: PropertyNameWithURL[] | null;
  nctid: string | null;
  output: OutputProperties[] | null;
  processorRequirements: string[] | null;
  programmingLanguage: string[] | null;
  publisher: Publisher | null;
  rawData: any;
  sameAs: string | null;
  softwareAddOn: { identifier: string }[] | null;
  softwareHelp: { name?: string; url: string }[] | null;
  softwareRequirements: string[] | null;
  softwareVersion: string[] | null;
  sdPublisher: SdPublisher[] | null;
  spatialCoverage: SpatialCoverage[] | null;
  species: Species[] | null;
  temporalCoverage: TemporalCoverage | null;
  topicCategory: TopicCategory[] | null;
  url: string | null; // link to dataset in the source repo.
  usageInfo: {
    name?: string | null;
    url?: string | null;
    description?: string | null;
  };
  variableMeasured: string[] | null;
  version: number | null;
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
  build_date: string;
  build_version: string;
  src: {
    [key: string]: MetadataSource;
  };
}
