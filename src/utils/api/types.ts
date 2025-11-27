import {
  APIResourceType,
  CollectionType,
} from '../formatting/formatResourceType';

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

// Conditions of access for dataset or tool.
export type AccessTypes =
  | 'Open'
  | 'Controlled'
  | 'Embargoed'
  | 'Registered'
  | 'Restricted'
  | 'Varied'
  | 'Unknown';

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
  identifier?: string | null; // orcid id
  type?: string | null;
  affiliation?: { name: string; sameAs?: string } | null;
  name?: string | null;
  email?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  role?: string | null;
  title?: string | null;
  url?: string | null;
}

export interface Citation {
  abstract?: string | null;
  author: Author[] | null;
  citation?: string | null;
  datePublished?: string | null;
  description?: string | null;
  doi?: string | null;
  id?: string | null;
  issueNumber?: string | null;
  journalName?: string | null;
  journalNameAbbrev?: string | null;
  name?: string | null;
  pagination?: string | null;
  pmcid?: string | null;
  pmid?: string | null;
  url?: string | null;
  volumeNumber?: string | null;
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
  journalName: string | null;
  journalNameAbbrev: string | null;
  issueNumber: string | null;
}

export interface Distribution {
  encodingFormat: string[] | string | null;
  contentSize: number | null;
  contentUrl: string | null;
  dateCreated: string | null;
  dateModified: string | null;
  datePublished: string | null;
  description: string | null;
  name: string | null;
  '@id': string | null;
}

export type Domain =
  | 'Generalist'
  | 'IID'
  | 'Basic science'
  | 'Biomedical'
  | 'Other'
  | 'Metadata';

export interface Error {
  status: string;
  message: string;
}

export interface Funder {
  '@type'?: string;
  identifier?: string | null;
  alternateName?: string | string[] | null;
  class?: string | string[] | null;
  description?: string | null;
  employee?: {
    givenName?: string | null;
    familyName?: string | null;
    name?: string | string[] | null;
  }[];
  name?: string | null;
  parentOrganization?: string | string[] | null;
  role?: string | string[] | null;
  url?: string | null;
}

export interface Funding {
  '@type'?: string;
  identifier?: string | null;
  endDate?: string | null;
  funder?: Funder | Funder[] | null;
  isBasedOn?: {
    identifier?: string | null;
  };
  name?: string | null;
  startDate?: string | null;
  url?: string | null;
}

export interface HasPart {
  '@id'?: string;
  '@type'?: string;
  additionalType?: AdditionalType;
  author?: Author | Author[];
  datePublished?: string;
  encodingFormat?: string | string[];
  identifier?: string;
  journalName?: string;
  name?: string;
  pmid?: string;
  url?: string;
}

export interface IncludedInDataCatalog {
  '@type'?: string | null;
  name: string;
  url?: string | null; //source repo url
  versionDate?: string | null;
  archivedAt: string[] | string | null;
}

export interface InfectiousAgent extends PropertyWithPubtator {
  identifier?: string;
  displayName: string;
}

export interface InteractionStatistics {
  '@type'?: string | null;
  userInteractionCount: number | null;
  interactionType: string | null;
}

export interface IsBasedOn {
  '@type'?: string;
  abstract?: string;
  additionalType?: AdditionalType;
  citation?: string;
  codeRepository?: string;
  datePublished?: string;
  description?: string;
  doi?: string;
  identifier?: string;
  name?: string;
  pmid?: string;
  url?: string;
}

export interface IsBasisFor {
  '@type'?: string;
  author?: Author | Author[];
  datePublished?: string;
  fromPMID?: boolean;
  identifier?: string;
  journalName?: string;
  name?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  url?: string;
}

export interface IsPartOf {
  '@type'?: string;
  alternateName?: string;
  author?: Author | Author[];
  datePublished?: string;
  name?: string;
  id?: string;
  identifier?: string;
  journalName?: string;
  pmid?: string;
  url?: string;
}

export interface IsRelatedTo {
  '@type'?: string;
  _id?: string; // a unique NDE identifier for the resource
  citation?: {
    pmid?: string;
    url?: string;
  };
  identifier?: string;
  name?: string;
  includedInDataCatalog?: IncludedInDataCatalog;
  hasPart?: {
    '@type'?: string;
    identifier?: string;
  };
  relationship?: string;
  url?: string;
}

export interface MeasurementTechnique extends PropertyWithPubtator {
  curie?: string;
  identifier?: string;
  score?: number;
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

export interface SourceOrganization {
  '@type': string;
  name: string;
  abstract?: string;
  alternateName?: string[];
  correctionApproved?: boolean;
  description?: string;
  parentOrganization?: string | string[];
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

interface PropertyWithPubtator extends PropertyNameWithURL {
  inDefinedTermSet?: string;
  alternateName?: string[];
  originalName?: string | string[];
  commonName?: string | string[];
  isCurated?: boolean;
  curatedBy?: {
    name?: string;
    url?: string;
    dateModified?: string;
  };
}

export interface Species extends PropertyWithPubtator {
  additionalType?: AdditionalType;
  identifier?: string;
  displayName: string;
}

interface TemporalCoverage {
  duration?: string[];
  endDate?: string;
  name?: string;
  startDate?: string;
  temporalType?: string;
}

export interface TopicCategory {
  description?: string;
  name?: string;
  url?: string;
  curatedBy?: {
    name?: string;
    url?: string;
  };
  inDefinedTermSet?: string;
}

export interface InputProperties {
  description?: string;
  identifier?: string;
  name?: string;
  encodingFormat?: string | string[];
  url?: string;
  inDefinedTermSet?: string;
}

export interface CollectionSize {
  maxValue?: number;
  minValue?: number;
  unitText?: string;
  value?: number;
}

export interface OutputProperties {
  identifier?: string;
  name?: string;
  encodingFormat?: string | string[];
  url?: string;
  inDefinedTermSet?: string;
}

export interface FeatureListProperties {
  identifier?: string;
  name?: string;
  encodingFormat?: string | string[];
  url?: string;
  inDefinedTermSet?: string;
}

export interface DefinedTerm {
  '@type'?: string;
  identifier?: string;
  name?: string;
  url?: string;
}

export interface QuantitativeValue {
  '@type'?: string;
  maxValue?: number;
  minValue?: number;
  name?: string;
  unitCode?: string;
  unitText?: string;
  value?: number;
}

export interface Sample {
  '@type'?: string;
  anatomicalStructure?: DefinedTerm[];
  anatomicalSystem?: DefinedTerm[];
  associatedGenotype?: (string | DefinedTerm)[];
  associatedPhenotype?: DefinedTerm[];
  cellType?: DefinedTerm[];
  collectionSize?: QuantitativeValue;
  developmentalStage?: (QuantitativeValue | DefinedTerm)[];
  identifier?: string;
  includedInDataCatalog?: {
    '@type'?: string;
    archivedAt?: string[];
    name?: string;
    url?: string;
    versionDate?: string;
  }[];
  sampleAvailability?: boolean;
  sampleList?: {
    _id?: string;
    identifier?: string;
    url?: string;
  }[];
  sampleQuantity?: QuantitativeValue[];
  sampleType?: {
    name?: string;
    url?: string;
  }[];
  sex?: string[];
  url?: string;
}

// Formatting standardized resource fields
export interface FormattedResource {
  [key: string]: any;
  _meta?: {
    completeness: {
      augmented_recommended_ratio: number;
      augmented_required_ratio: number;
      recommended_max_score: number;
      recommended_score: number;
      recommended_score_ratio: number;
      required_max_score: number;
      required_ratio: number;
      required_score: number;
      total_max_score: number;
      total_recommended_augmented: number;
      total_required_augmented: number;
      total_score: number;
      weighted_score: number;
    };
    recommended_augmented_fields: string[];
    required_augmented_fields: string[];
    recommended_fields: string[];
    required_fields: string[];
  };
  id: string;
  '@type': APIResourceType; // "Dataset" | "ComputationalTool" | "Resource Catalog"
  name: string;
  about:
    | {
        description: string;
        displayName: string;
        name: string;
        url: string;
      }[]
    | null;
  abstract: string | null;
  aggregateRating: AggregateRating | null;
  alternateName: string | null;
  applicationCategory: string[] | null;
  applicationSubCategory: ApplicationSubCategory[] | null;
  applicationSuite: string[] | null;
  author: Author[] | null;
  availableOnDevice: string[] | null;
  citation: Citation[] | null;
  citedBy: CitedBy[] | null;
  codeRepository: string[] | string | null;
  collectionSize?: CollectionSize[];
  collectionType?: CollectionType | null;
  condition: string | null;
  conditionsOfAccess: AccessTypes | null;
  creditText: string | null;
  date: string | null;
  dateCreated: string | null;
  dateModified: string | null;
  datePublished: string | null;
  description: string | null;
  disambiguatingDescription: string | null;
  discussionUrl: string[] | null;
  disease: string | null;
  distribution: Distribution[] | null;
  doi: string | null;
  downloadUrl: { name: string }[] | null;
  featureList: FeatureListProperties[] | null;
  funding: Funding[] | null;
  genre: Domain | null;
  hasAPI: boolean | null;
  hasDownload:
    | 'All content'
    | 'Partial content'
    | 'Record-level'
    | 'no downloads';
  hasPart: HasPart[] | null;
  healthCondition: PropertyWithPubtator[] | null;
  includedInDataCatalog: IncludedInDataCatalog[] | IncludedInDataCatalog;
  infectiousAgent: InfectiousAgent[] | null;
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
  measurementTechnique: MeasurementTechnique[] | null;
  nctid: string | null;
  operatingSystem: string[] | null;
  output: OutputProperties[] | null;
  processorRequirements: string[] | null;
  programmingLanguage: string[] | null;
  publisher: Publisher | null;
  rawData?: any;
  sameAs: string | null;
  sample?: Sample | null;
  softwareAddOn: { identifier: string }[] | null;
  softwareHelp: { name?: string; url: string }[] | null;
  softwareRequirements: string[] | null;
  softwareVersion: string[] | null;
  sourceOrganization: SourceOrganization[] | null;
  sdPublisher: SdPublisher | SdPublisher[] | null;
  spatialCoverage: SpatialCoverage[] | null;
  species: Species[] | null;
  temporalCoverage: TemporalCoverage[] | null;
  topicCategory: TopicCategory[] | null;
  url: string | null; // link to dataset in the source repo.
  usageInfo?:
    | {
        name?: string | null;
        url?: string | null;
        description?: string | null;
      }
    | {
        name?: string | null;
        url?: string | null;
        description?: string | null;
      }[];
  variableMeasured:
    | string[]
    | {
        description?: string;
        identifier?: string;
        name: string;
        url?: string;
      }[]
    | null;
  version: number | null;
}
