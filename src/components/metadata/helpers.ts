import { FormattedResource, ResourceType } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { OntologyButtonProps, SearchButtonProps } from './components/buttons';
import MetadataConfig from 'configs/resource-metadata.json';
import { uniqueId } from 'lodash';

// Sort [SORT_ORDER] based on: https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/214
export const SORT_ORDER = [
  'infectiousAgent',
  'species',
  'healthCondition',
  'measurementTechnique',
  'variableMeasured',
  'funding',
  'license',
  'usageInfo',
];

// Sorts an array of metadata objects based on the [SORT_ORDER] defined above. Prioritizes the enabled items over the disabled items.

export const sortMetadataArray = (
  arr: MetadataContentProps[],
  sort_order: string[] = SORT_ORDER,
) => {
  // Sort function that respects the sortOrder
  const customSort = (a: MetadataContentProps, b: MetadataContentProps) => {
    let indexA = sort_order.indexOf(a.property);
    let indexB = sort_order.indexOf(b.property);

    // Handle items not in sort_order by putting them at the end
    if (indexA === -1) indexA = sort_order.length;
    if (indexB === -1) indexB = sort_order.length;

    return indexA - indexB;
  };

  // Separate the disabled and non-disabled items
  const enabledItems = arr.filter(item => !item.isDisabled).sort(customSort);
  const disabledItems = arr.filter(item => item.isDisabled).sort(customSort);

  // Concatenate the sorted enabled items with the sorted disabled items
  return [...enabledItems, ...disabledItems];
};

export interface MetadataItem {
  key: string;
  name?: string;
  img?: { src: string; alt: string };
  url?: string;
  scientificName?: string;
  ontologyProps?: OntologyButtonProps;
  searchProps?: SearchButtonProps;
  tags?: {
    label: string;
    value: string;
    url?: string | null;
    tooltipLabel?: string;
  }[];
}

export interface MetadataContentProps {
  id: string;
  label: string;
  property: string;
  isDisabled: boolean;
  name?: string;
  img?: { src: string; alt: string };
  url?: string;
  items?: MetadataItem[];
}

interface Data extends Partial<FormattedResource> {}

// This function generates metadata content based on the provided data.
export const generateMetadataContent = (
  data?: Data | null,
): MetadataContentProps[] => {
  if (!data) {
    return [];
  }
  const id = data.id as FormattedResource['id'];
  // Define the structure for each metadata type
  const createContentForProperty = (
    id: FormattedResource['id'],
    property: string,
    data: Data,
  ): MetadataContentProps | undefined => {
    switch (property) {
      case 'funding':
        return createFundingContent(id, property, data?.funding);
      case 'healthCondition':
        return createHealthConditionContent(
          id,
          property,
          data?.healthCondition,
        );
      case 'license':
        return createLicenseContent(id, property, data?.license);
      case 'measurementTechnique':
        return createMeasurementTechniqueContent(
          id,
          property,
          data?.measurementTechnique,
        );
      case 'infectiousAgent':
        return createInfectiousAgentContent(
          id,
          property,
          data?.infectiousAgent,
        );
      case 'species':
        return createSpeciesContent(id, property, data?.species);
      case 'usageInfo':
        return createUsageInfoContent(id, property, data?.usageInfo);
      case 'variableMeasured':
        return createVariableMeasuredContent(
          id,
          property,
          data?.variableMeasured,
        );
      default:
        return undefined;
    }
  };

  // Generate content for each property and filter out any undefined values.
  const generatedContent = Object.keys(data)
    .map(property => createContentForProperty(id, property, data))
    .filter(
      (content): content is MetadataContentProps => content !== undefined,
    );

  return generatedContent;
};

// Generates content specific to funding.
const createFundingContent = (
  id: FormattedResource['id'],
  property: string,
  funding?: FormattedResource['funding'],
) => {
  const getFundingDetails = (funding?: FormattedResource['funding']) => {
    if (!funding) return null;
    return (
      funding?.filter(funding => {
        return (
          funding.identifier ||
          funding.url ||
          Array.isArray(funding.funder) ||
          funding.funder?.name
        );
      }) || null
    );
  };

  const fundingDetails = getFundingDetails(funding);
  return {
    id: `${property}-${id}`,
    label: 'Funding',
    property,
    isDisabled: !fundingDetails || fundingDetails.length === 0,
    items:
      fundingDetails?.map((funding, idx) => {
        const name = Array.isArray(funding.funder)
          ? funding.funder.filter(funder => !!funder.name).join(', ')
          : funding?.funder?.name;
        return {
          key: uniqueId(`${property}-${id}-${idx}`),
          name: name || '',
          scientificName: '',
          searchProps: {
            ['aria-label']: `Search for results with funding "${name}"`,
            property: 'funding.funder.name',
            value: Array.isArray(funding.funder)
              ? funding.funder.filter(funder => !!funder.name).join('" OR "')
              : funding?.funder?.name,
          },
          tags:
            funding?.identifier || funding?.url
              ? [
                  {
                    label: 'ID',
                    value: funding?.identifier || 'Funding ID',
                    url: funding?.url,
                    tooltipLabel: funding?.identifier || '',
                  },
                ]
              : [],
        };
      }) || [],
  };
};

// Generates content specific to health conditions.
const createHealthConditionContent = (
  id: FormattedResource['id'],
  property: string,
  healthCondition?: FormattedResource['healthCondition'],
) => {
  return {
    id: `${property}-${id}`,
    label: 'Health Condition',
    property,
    isDisabled: !healthCondition,
    items: healthCondition
      ? healthCondition.map((healthCondition, idx) => {
          const name = Array.isArray(healthCondition.name)
            ? healthCondition.name.join(', ')
            : healthCondition.name;

          return {
            key: uniqueId(`${property}-${id}-${idx}`),
            name,
            scientificName: '',
            searchProps: {
              ['aria-label']: `Search for results with health condition "${name}"`,
              property: 'healthCondition.name',
              value: Array.isArray(healthCondition.name)
                ? healthCondition.name.join('" OR "')
                : healthCondition.name,
            },
            ontologyProps: {
              ['aria-label']: 'See ontology information.',
              value: healthCondition?.url,
              inDefinedTermSet: healthCondition?.inDefinedTermSet,
            },
          };
        })
      : [],
  };
};

// Generates content specific to licensing.
const createLicenseContent = (
  id: FormattedResource['id'],
  property: string,
  licenseData?: FormattedResource['license'],
) => {
  const license = licenseData ? formatLicense(licenseData) : null;

  return {
    id: `${property}-${id}`,
    label: 'License',
    property,
    isDisabled: !license,
    name: license?.title,
    url: license?.url,
    img:
      license?.img && license?.type
        ? { src: license?.img, alt: license?.type }
        : undefined,
  };
};

// Generates content specific to measurement techniques.
const createMeasurementTechniqueContent = (
  id: FormattedResource['id'],
  property: string,
  measurementTechnique?: FormattedResource['measurementTechnique'],
) => {
  return {
    id: `${property}-${id}`,
    label: 'Measurement Technique',
    property,
    isDisabled: !measurementTechnique,
    items: measurementTechnique
      ? measurementTechnique.map((measurementTechnique, idx) => {
          const name = Array.isArray(measurementTechnique.name)
            ? measurementTechnique.name.join(', ')
            : measurementTechnique.name;

          return {
            key: uniqueId(`${property}-${id}-${idx}`),
            name,
            searchProps: {
              ['aria-label']: `Search for results with measurement technique "${name}"`,
              property: 'measurementTechnique.name',
              value: Array.isArray(measurementTechnique.name)
                ? measurementTechnique.name.join('" OR "')
                : measurementTechnique.name,
            },
            ontologyProps: {
              ['aria-label']: 'See ontology information.',
              value: measurementTechnique?.url,
            },
          };
        })
      : [],
  };
};

// Generates content specific to infectious agents.
const createInfectiousAgentContent = (
  id: FormattedResource['id'],
  property: string,
  infectiousAgent?: FormattedResource['infectiousAgent'],
) => {
  return {
    id: `${property}-${id}`,
    label: 'Pathogen',
    property,
    isDisabled: !infectiousAgent,
    items: infectiousAgent
      ? infectiousAgent.map((pathogen, idx) => {
          const scientificName = Array.isArray(pathogen.name)
            ? pathogen.name.join(', ')
            : pathogen.name;

          const name = Array.isArray(pathogen.commonName)
            ? pathogen.commonName.join(', ')
            : pathogen.commonName;

          return {
            key: uniqueId(`${property}-${id}-${idx}`),
            name,
            scientificName,
            searchProps: {
              ['aria-label']: `Search for results with pathogen "${scientificName}"`,
              property: 'infectiousAgent.name',
              value: Array.isArray(pathogen.name)
                ? pathogen.name.join('" OR "')
                : pathogen.name,
            },
            ontologyProps: {
              ['aria-label']: 'See ontology information.',
              value: pathogen?.url,
              inDefinedTermSet: pathogen?.inDefinedTermSet,
            },
          };
        })
      : [],
  };
};

// Generates content specific to species.
const createSpeciesContent = (
  id: FormattedResource['id'],
  property: string,
  species?: FormattedResource['species'],
) => {
  return {
    id: `${property}-${id}`,
    label: 'Species',
    property,
    isDisabled: !species,
    items: species
      ? species.map((species, idx) => {
          const scientificName = Array.isArray(species.name)
            ? species.name.join(', ')
            : species.name;

          const name = Array.isArray(species.commonName)
            ? species.commonName.join(', ')
            : species.commonName;

          return {
            key: uniqueId(`${property}-${id}-${idx}`),
            name,
            scientificName,
            searchProps: {
              ['aria-label']: `Search for results with species "${scientificName}"`,
              property: 'species.name',
              value: Array.isArray(species.name)
                ? species.name.join('" OR "')
                : species.name,
            },
            ontologyProps: {
              ['aria-label']: 'See ontology information.',
              value: species?.url,
              inDefinedTermSet: species?.inDefinedTermSet,
            },
          };
        })
      : [],
  };
};

// Generates content specific to usage info.
const createUsageInfoContent = (
  id: FormattedResource['id'],
  property: string,
  usageInfo?: FormattedResource['usageInfo'],
) => {
  return {
    id: `${property}-${id}`,
    label: 'Usage Info',
    property,
    isDisabled: !usageInfo,
    name: usageInfo?.name || 'Usage Agreement',
    url: usageInfo?.url || '',
  };
};

// Generates content specific to variable measured.
const createVariableMeasuredContent = (
  id: FormattedResource['id'],
  property: string,
  variableMeasured?: FormattedResource['variableMeasured'],
) => {
  return {
    id: `${property}-${id}`,
    label: 'Variable Measured',
    property,
    isDisabled: !variableMeasured,
    items: variableMeasured
      ? variableMeasured.map((variable, idx) => {
          return {
            key: uniqueId(`${property}-${id}-${idx}`),
            name: variable,
            searchProps: {
              ['aria-label']: `Search for results with variable measured "${variable}"`,
              property,
              value: variable,
            },
          };
        })
      : [],
  };
};

export const getMetadataDescription = (
  property: keyof FormattedResource,
  resourceType?: ResourceType,
  accessor?: () => {},
) => {
  const metadata = accessor
    ? MetadataConfig.find(accessor)
    : MetadataConfig.find(d => d.property === property);
  const { description } = metadata || {};
  if (description) {
    let type = resourceType?.toLowerCase() as
      | keyof typeof description
      | undefined;

    if (type && description?.[type]) {
      // if record type exists use it to get a more specific definition if available.
      return description?.[type];
    } else {
      // return general definition if specific one does not exist.
      let descriptions = Object.values(description);
      return descriptions.length === 0 ? '' : descriptions[0];
    }
  }
};