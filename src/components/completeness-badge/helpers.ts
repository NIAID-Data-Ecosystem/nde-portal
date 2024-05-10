import { FormattedResource } from 'src/utils/api/types';

const REQUIRED_FIELDS = [
  'author',
  'date',
  'description',
  'distribution',
  'funding',
  'includedInDataCatalog',
  'measurementTechnique',
  'name',
  'url',
];

const RECOMMENDED_FIELDS = [
  'citation',
  'citedBy',
  'conditionsOfAccess',
  'dateCreated',
  'dateModified',
  'datePublished',
  'doi',
  'healthCondition',
  'identifier',
  'infectiousAgent',
  'interactionStatistic',
  'isBasedOn',
  'keywords',
  'license',
  'sdPublisher',
  'spatialCoverage',
  'species',
  'temporalCoverage',
  'topicCategory',
  'usageInfo',
  'variableMeasured',
];

export const getMetadataListByType = (type: FormattedResource['@type']) => {
  if (type === 'ResourceCatalog') {
    const required = REQUIRED_FIELDS.concat(['collectionType']);
    const recommended = RECOMMENDED_FIELDS.concat([
      'collectionSize',
      'hasAPI',
      'hasDownload',
    ]);
    return { required, recommended };
  }

  return { required: REQUIRED_FIELDS, recommended: RECOMMENDED_FIELDS };
};
