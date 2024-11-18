import { Domain } from 'src/utils/api/types';

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
    abstract: string;
    description: string;
    schema: Object | null;
    url: string;
    identifier: string;
    metadata_completeness: {
      avg_augmented_recommended_ratio: number;
      avg_augmented_required_ratio: number;
      avg_recommended_score_ratio: number;
      avg_required_ratio: number;
      required_fields: {
        name: number;
        description: number;
        author: number;
        url: number;
        measurementTechnique: number;
        includedInDataCatalog: number;
        distribution: number;
        funding: number;
        date: number;
      };
      recommended_fields: {
        dateCreated: number;
        dateModified: number;
        datePublished: number;
        citedBy: number;
        doi: number;
        infectiousAgent: number;
        healthCondition: number;
        species: number;
        variableMeasured: number;
        citation: number;
        conditionsOfAccess: number;
        isBasedOn: number;
        keywords: number;
        license: number;
        sdPublisher: number;
        spatialCoverage: number;
        temporalCoverage: number;
        topicCategory: number;
        identifier: number;
        usageInfo: number;
        interactionStatistic: number;
      };
      recommended_augmented_fields_coverage?: { [key: string]: number };
      required_augmented_fields_coverage?: { [key: string]: number };
      sum_required_coverage: number;
      sum_recommended_coverage: number;
      binary_required_score: number;
      binary_recommended_score: number;
      binary_required_augmented: number;
      binary_recommended_augmented: number;
      percent_required_fields: number;
      percent_recommended_fields: number;
    };
    conditionsOfAccess?: string;
    genre?: Domain;
    parentCollection?: { id: string };
    type: string;
  };
  stats: { [key: string]: number };
  version: string;
}

export interface Metadata {
  biothing_type: string;
  build_date: string;
  build_version: string;
  src: {
    [key: string]: MetadataSource;
  };
}
