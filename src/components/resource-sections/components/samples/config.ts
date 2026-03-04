import { SampleAggregate, SampleCollection } from 'src/utils/api/types';
import { formatSampleLabelFromProperty } from 'src/utils/formatting/formatSample';
import { getAvailableSamplePropertyColumns } from './helpers';

export type SamplePropertyConfig = {
  key: string;
  includedProperties: string[];
  title?: string;
  transform?: (value: any) => any;
  isSortable?: boolean;
};

export const SAMPLE_AGGREGATE_COLUMNS: SamplePropertyConfig[] = [
  {
    key: 'alternateIdentifier',
    includedProperties: ['alternateIdentifier'],
  },
  {
    key: 'anatomicalStructure',
    includedProperties: ['anatomicalStructure'],
  },
  {
    key: 'anatomicalSystem',
    includedProperties: ['anatomicalSystem'],
  },
  {
    key: 'associatedGenotype',
    includedProperties: ['associatedGenotype'],
  },
  {
    key: 'associatedPhenotype',
    includedProperties: ['associatedPhenotype'],
  },
  {
    key: 'cellType',
    includedProperties: ['cellType'],
  },
  {
    key: 'developmentalStage',
    includedProperties: ['developmentalStage'],
  },
  {
    key: 'environmentalSystem',
    includedProperties: ['environmentalSystem'],
  },
  {
    key: 'sampleAvailability',
    includedProperties: ['sampleAvailability'],
  },
  {
    key: 'sampleQuantity',
    includedProperties: ['sampleQuantity'],
  },
  {
    key: 'sampleState',
    includedProperties: ['sampleState'],
  },
  {
    key: 'sampleType',
    includedProperties: ['sampleType'],
  },
  {
    key: 'sex',
    includedProperties: ['sex'],
  },
  {
    key: 'healthCondition',
    includedProperties: ['healthCondition'],
  },
  {
    key: 'infectiousAgent',
    includedProperties: ['infectiousAgent'],
  },
  {
    key: 'species',
    includedProperties: ['species'],
  },
];

export const SAMPLE_COLLECTION_COLUMNS: SamplePropertyConfig[] = [
  {
    key: 'identifier',
    includedProperties: ['itemListElement.identifier'],
    isSortable: true,
  },
];

export const SAMPLE_TABLE_CONFIG = {
  label: 'Sample Table',
  caption: 'Sample properties.',
  getColumns: (sample: SampleAggregate) => {
    return sample ? getAvailableSamplePropertyColumns(sample) : [];
  },
  getRows: (sample: SampleAggregate) => {
    // For sample collection, each itemListElement is a sample identifier and we also display aggregate properties on each row.
    return [sample];
  },
};

export const SAMPLE_COLLECTION_TABLE_CONFIG = {
  label: 'Sample Collection Table',
  caption: formatSampleLabelFromProperty('itemListElement'),
  getColumns: (sampleCollection: SampleCollection) => {
    const aggregatePropertiesForDisplay = sampleCollection.aggregateElement
      ? getAvailableSamplePropertyColumns(sampleCollection.aggregateElement)
      : [];
    return [
      {
        title: 'Sample ID',
        property: 'identifier',
        isSortable: true,
      },
      ...aggregatePropertiesForDisplay,
    ];
  },
  getRows: (sampleCollection: SampleCollection) => {
    // For sample collection, each itemListElement is a sample identifier and we also display aggregate properties on each row.
    return (sampleCollection?.itemListElement || []).map(item => ({
      identifier: { identifier: item.identifier, url: item?.url || '' },
      ...sampleCollection.aggregateElement,
    }));
  },
  tableProps: { hasPagination: true },
};
