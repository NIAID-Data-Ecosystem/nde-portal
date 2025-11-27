import {
  getValueByPath,
  hasNonEmptyValue,
} from 'src/components/resource-sections/helpers';
import { Sample } from 'src/utils/api/types';
import { formatSampleLabelFromProperty } from 'src/utils/formatting/formatSample';
import { CellValue } from './Cells';

export type SamplePropertyConfig = {
  key: string;
  includedProperties: string[];
  label?: string;
  transform?: (value: any) => any;
};

export type SamplePropertyRow = {
  key: string;
  property: string;
  label: string;
  values: CellValue | CellValue[];
  includedProperties: string[];
};

export const SAMPLE_PROPERTY_CONFIG: SamplePropertyConfig[] = [
  {
    key: '@type',
    includedProperties: ['@type'],
    transform: (value: string) => {
      return value === 'SampleCollection' ? 'Sample Collection' : value;
    },
  },
  {
    key: 'anatomicalStructure',
    includedProperties: ['anatomicalStructure'],
  },
  {
    key: 'associatedGenotype',
    includedProperties: ['associatedGenotype'],
  },
  {
    key: 'associatedPhenotype',
    includedProperties: ['associatedPhenotype'],
  },
  { key: 'cellType', includedProperties: ['cellType'] },
  {
    key: 'developmentalStage',
    includedProperties: ['developmentalStage'],
  },
  {
    key: 'sampleAvailability',
    includedProperties: ['sampleAvailability'],
  },
  {
    key: 'sampleType',
    includedProperties: ['sampleType'],
  },
  { key: 'sex', includedProperties: ['sex'] },
];

/*
 * Generate table rows based on available sample properties.
 * Only includes rows where at least one configured property has a non-empty value.
 */
export const getSamplePropertyTableRows = (
  data: Sample,
): SamplePropertyRow[] => {
  return SAMPLE_PROPERTY_CONFIG.flatMap(config => {
    // Get values for all defined paths (allows for dot notation).
    const valuesForProps = config.includedProperties.map(path =>
      getValueByPath(data, path),
    );
    // Check if the associated values are non-empty.
    const hasValue = valuesForProps.some(v => hasNonEmptyValue(v));

    // If no value, omit this row entirely
    if (!hasValue) return [];

    const values =
      valuesForProps.length === 1 ? valuesForProps[0] : valuesForProps;

    return [
      {
        key: config.key,
        property: config.key,
        label: config?.label || formatSampleLabelFromProperty(config.key),
        values: config.transform ? config.transform(values) : values,
        includedProperties: config.includedProperties,
      },
    ];
  });
};
