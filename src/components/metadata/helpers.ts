import { FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { OntologyButtonProps, SearchButtonProps } from './components/buttons';
import { uniqueId } from 'lodash';
import { APIResourceType } from 'src/utils/formatting/formatResourceType';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import {
  SchemaDefinition,
  SchemaDefinitions,
} from 'scripts/generate-schema-definitions/types';

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
  'topicCategory',
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
  glyph?: string;
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
  showItems = true,
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
        return createFundingContent(id, property, data?.funding, showItems);
      case 'healthCondition':
        return createHealthConditionContent(
          id,
          property,
          data?.healthCondition,
          showItems,
        );
      case 'license':
        return createLicenseContent(id, property, data?.license, showItems);
      case 'measurementTechnique':
        return createMeasurementTechniqueContent(
          id,
          property,
          data?.measurementTechnique,
          showItems,
        );
      case 'infectiousAgent':
        return createInfectiousAgentContent(
          id,
          property,
          data?.infectiousAgent,
          showItems,
        );
      case 'species':
        return createSpeciesContent(id, property, data?.species, showItems);
      case 'topicCategory':
        return createTopicCategoryContent(
          id,
          property,
          data?.topicCategory,
          showItems,
        );
      case 'usageInfo':
        return createUsageInfoContent(id, property, data?.usageInfo, showItems);
      case 'variableMeasured':
        return createVariableMeasuredContent(
          id,
          property,
          data?.variableMeasured,
          showItems,
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
  showItems = true,
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
  const SHOW_MAX_FUNDER_NAMES = 5;
  return {
    id: `${property}-${id}`,
    label: 'Funding',
    glyph: property,
    property,
    isDisabled: !fundingDetails || fundingDetails.length === 0,
    items:
      (showItems &&
        fundingDetails?.map((funding, idx) => {
          const name = Array.isArray(funding.funder)
            ? funding.funder
                .filter(funder => !!funder.name)
                .slice(0, SHOW_MAX_FUNDER_NAMES)
                .map(funder => funder.name)
                .join(', ') +
              (funding.funder.length > SHOW_MAX_FUNDER_NAMES ? '...' : '')
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
        })) ||
      [],
  };
};

// Generates content specific to health conditions.
const createHealthConditionContent = (
  id: FormattedResource['id'],
  property: string,
  healthCondition?: FormattedResource['healthCondition'],
  showItems = true,
) => {
  return {
    id: `${property}-${id}`,
    label: 'Health Condition',
    property,
    glyph: property,
    isDisabled: !healthCondition || healthCondition.every(item => !item.name),
    items:
      showItems && healthCondition
        ? healthCondition.map((healthCondition, idx) => {
            const name = Array.isArray(healthCondition.name)
              ? healthCondition.name.join(', ')
              : healthCondition.name;

            const termSet = healthCondition?.inDefinedTermSet?.toLowerCase();

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
                ['aria-label']: termSet
                  ? termSet === 'other'
                    ? 'See term information in OLS.'
                    : `See ${healthCondition.inDefinedTermSet} ontology information.`
                  : 'See taxonomy information.',
                value: healthCondition?.url,
                label: healthCondition?.inDefinedTermSet,
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
  showItems = true,
) => {
  const license = licenseData ? formatLicense(licenseData) : null;

  return {
    id: `${property}-${id}`,
    label: 'License',
    property,
    glyph: property,
    isDisabled: !license,
    name: license?.title,
    url: license?.url,
    img:
      showItems && license?.img && license?.type
        ? { src: license?.img, alt: license?.type }
        : undefined,
  };
};

// Generates content specific to measurement techniques.
const createMeasurementTechniqueContent = (
  id: FormattedResource['id'],
  property: string,
  measurementTechnique?: FormattedResource['measurementTechnique'],
  showItems = true,
) => {
  return {
    id: `${property}-${id}`,
    label: 'Measurement Technique',
    property,
    glyph: property,
    isDisabled:
      !measurementTechnique || measurementTechnique.every(item => !item.name),
    items:
      showItems && measurementTechnique
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
  showItems = true,
) => {
  return {
    id: `${property}-${id}`,
    label: 'Pathogen',
    property,
    glyph: property,
    isDisabled: !infectiousAgent || infectiousAgent.every(item => !item.name),
    items:
      showItems && infectiousAgent
        ? infectiousAgent.map((pathogen, idx) => {
            const scientificName = Array.isArray(pathogen.name)
              ? pathogen.name.join(', ')
              : pathogen.name;

            const name = Array.isArray(pathogen.commonName)
              ? pathogen.commonName.join(', ')
              : pathogen.commonName;

            const termSet = pathogen?.inDefinedTermSet;

            const ontologyLabel = termSet
              ? `${pathogen?.inDefinedTermSet}${
                  termSet?.toLowerCase() === 'uniprot' ? ' Taxon' : ''
                }`
              : '';

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
                ['aria-label']: termSet
                  ? `See ${pathogen?.inDefinedTermSet} taxonomy information.`
                  : 'See taxonomy information.',
                inDefinedTermSet: pathogen?.inDefinedTermSet,
                label: ontologyLabel,
                value: pathogen?.url,
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
  showItems = true,
) => {
  return {
    id: `${property}-${id}`,
    label: 'Species',
    property,
    glyph: property,
    isDisabled: !species || species.every(item => !item.name),
    items:
      showItems && species
        ? species.map((species, idx) => {
            const scientificName = Array.isArray(species.name)
              ? species.name.join(', ')
              : species.name;

            const name = Array.isArray(species.commonName)
              ? species.commonName.join(', ')
              : species.commonName;

            const termSet = species?.inDefinedTermSet;
            const ontologyLabel = termSet
              ? `${species?.inDefinedTermSet}${
                  species?.inDefinedTermSet?.toLowerCase() === 'uniprot'
                    ? ' Taxon'
                    : ''
                }`
              : '';

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
                ['aria-label']: termSet
                  ? `See ${species?.inDefinedTermSet} taxonomy information.`
                  : 'See taxonomy information.',
                label: ontologyLabel,
                inDefinedTermSet: species?.inDefinedTermSet,
                value: species?.url,
              },
            };
          })
        : [],
  };
};

// Generates content specific to topic categories.
const createTopicCategoryContent = (
  id: FormattedResource['id'],
  property: string,
  topicCategory?: FormattedResource['topicCategory'],
  showItems = true,
) => {
  // Sorts topic categories alphabetically
  if (
    topicCategory != null &&
    topicCategory
      ?.filter(item => item.name !== undefined)
      .every(item => typeof item.name === 'string')
  )
    topicCategory.sort((a, b) =>
      (a.name as string).localeCompare(b.name as string),
    );

  return {
    id: `${property}-${id}`,
    label: 'Topic Category',
    property,
    isDisabled: !topicCategory || topicCategory.every(item => !item.name),
    items:
      showItems && topicCategory
        ? topicCategory.map((topicCategory, idx) => {
            const name = Array.isArray(topicCategory.name)
              ? topicCategory.name.join(', ')
              : topicCategory.name;
            const termSet = topicCategory?.inDefinedTermSet;

            return {
              key: uniqueId(`${property}-${id}-${idx}`),
              name,
              searchProps: {
                ['aria-label']: `Search for results with topic category "${name}"`,
                property: 'topicCategory.name',
                value: Array.isArray(topicCategory.name)
                  ? topicCategory.name.join('" OR "')
                  : topicCategory.name,
              },
              ontologyProps: {
                ['aria-label']: termSet
                  ? `See ${topicCategory?.inDefinedTermSet} taxonomy information.`
                  : 'See taxonomy information.',
                label: topicCategory?.inDefinedTermSet,
                inDefinedTermSet: topicCategory?.inDefinedTermSet,
                value: topicCategory?.url,
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
  showItems = true,
) => {
  return {
    id: `${property}-${id}`,
    label: 'Usage Info',
    property,
    glyph: property,
    isDisabled: !usageInfo,
    items: Array.isArray(usageInfo)
      ? usageInfo?.map((usage, idx) => ({
          key: uniqueId(`${property}-${id}-${idx}`),
          name: usage?.name || 'Usage Agreement',
          url: usage?.url || '',
        }))
      : [
          {
            key: uniqueId(`${property}-${id}`),
            name: usageInfo?.name || 'Usage Agreement',
            url: usageInfo?.url || '',
          },
        ],
  };
};

// Generates content specific to variable measured.
const createVariableMeasuredContent = (
  id: FormattedResource['id'],
  property: string,
  variableMeasured?: FormattedResource['variableMeasured'],
  showItems = true,
) => {
  return {
    id: `${property}-${id}`,
    label: 'Variable Measured',
    property,
    glyph: property,
    isDisabled: !variableMeasured,
    items:
      showItems && variableMeasured
        ? (variableMeasured
            .map((variable, idx) => {
              if (typeof variable === 'string') {
                return {
                  key: uniqueId(`${property}-${id}-${idx}`),
                  name: variable,
                  searchProps: {
                    ['aria-label']: `Search for results with variable measured "${variable}"`,
                    property,
                    value: variable,
                  },
                };
              } else if (typeof variable === 'object') {
                return {
                  key: uniqueId(`${property}-${id}-${idx}`),
                  name: variable.name,
                  searchProps: {
                    ['aria-label']: `Search for results with variable measured "${variable.name}"`,
                    property: 'variableMeasured.name',
                    value: variable.name,
                  },
                };
              } else {
                return null;
              }
            })
            .filter(item => item !== null) as MetadataItem[])
        : [],
  };
};

export const getMetadataDescription = (
  property: string,
  type?: APIResourceType,
  accessor?: () => {},
) => {
  const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

  const metadata = (
    accessor ? Object.values(schema).find(accessor) : schema[property]
  ) as SchemaDefinition | undefined;

  const description = metadata?.description || '';

  if (description) {
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
