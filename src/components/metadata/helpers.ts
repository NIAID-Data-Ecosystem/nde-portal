import { FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { OntologyButtonProps, SearchButtonProps } from './components/buttons';

// Sort [SORT_ORDER] based on: https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/214
const SORT_ORDER = [
  'infectiousAgent',
  'species',
  'healthCondition',
  'measurementTechnique',
  'variableMeasured',
  'funding',
  'license',
  'usageInfo',
];

export const getFundingDetails = (funding?: FormattedResource['funding']) => {
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

export const generateMetadataContent = (
  data?: FormattedResource | null,
): MetadataContentProps[] => {
  const id = data?.id;
  const fundingDetails = getFundingDetails(data?.funding);
  const license = data?.license ? formatLicense(data.license) : null;

  // Define the structure for each metadata type
  return [
    {
      id: `f-${id}`,
      label: 'Funding',
      property: 'funding',
      isDisabled: !fundingDetails || fundingDetails.length === 0,
      items:
        fundingDetails?.map((funding, idx) => {
          const value = funding?.funder?.name;
          return {
            key: `f-${id}-${idx}`,
            name: value || '',
            scientificName: '',
            searchProps: {
              ['aria-label']: `Search for results with funding "${value}"`,
              property: 'funding.funder.name',
              value,
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
    },
    {
      id: `hc-${id}`,
      label: 'Health Condition',
      property: 'healthCondition',
      isDisabled: !data?.healthCondition,
      items: data?.healthCondition
        ? data.healthCondition.map((healthCondition, idx) => {
            const name = Array.isArray(healthCondition.name)
              ? healthCondition.name.join(', ')
              : healthCondition.name;

            return {
              key: `hc-${id}-${idx}`,
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
    },
    {
      id: `l-${id}`,
      label: 'License',
      property: 'license',
      isDisabled: !license,
      name: license?.title,
      url: license?.url,
      img:
        license?.img && license?.type
          ? { src: license?.img, alt: license?.type }
          : undefined,
    },
    {
      id: `mt-${id}`,
      label: 'Measurement Technique',
      property: 'measurementTechnique',
      isDisabled: !data?.measurementTechnique,
      items: data?.measurementTechnique
        ? data.measurementTechnique.map((measurementTechnique, idx) => {
            const name = Array.isArray(measurementTechnique.name)
              ? measurementTechnique.name.join(', ')
              : measurementTechnique.name;

            return {
              key: `mt-${id}-${idx}`,
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
    },
    {
      id: `p-${id}`,
      label: 'Pathogen',
      property: 'infectiousAgent',
      isDisabled: !data?.infectiousAgent,
      items: data?.infectiousAgent
        ? data.infectiousAgent.map((pathogen, idx) => {
            const scientificName = Array.isArray(pathogen.name)
              ? pathogen.name.join(', ')
              : pathogen.name;

            const name = Array.isArray(pathogen.commonName)
              ? pathogen.commonName.join(', ')
              : pathogen.commonName;

            return {
              key: `p-${id}-${idx}`,
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
    },
    {
      id: `sp-${id}`,
      label: 'Species',
      property: 'species',
      isDisabled: !data?.species,
      items: data?.species
        ? data.species.map((species, idx) => {
            const scientificName = Array.isArray(species.name)
              ? species.name.join(', ')
              : species.name;

            const name = Array.isArray(species.commonName)
              ? species.commonName.join(', ')
              : species.commonName;

            return {
              key: `sp-${id}-${idx}`,
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
    },
    {
      id: `ui-${id}`,
      label: 'Usage Info',
      property: 'usageInfo',
      isDisabled: !data?.usageInfo,
      name: data?.usageInfo?.name || 'Usage Agreement',
      url: data?.usageInfo?.url || '',
    },

    {
      id: `vm-${id}`,
      label: 'Variable Measured',
      property: 'variableMeasured',
      isDisabled: !data?.variableMeasured,
      items: data?.variableMeasured
        ? data.variableMeasured.map((variable, idx) => {
            return {
              key: `vm-${id}-${idx}`,
              name: variable,
              searchProps: {
                ['aria-label']: `Search for results with variable measured "${variable}"`,
                property: 'variableMeasured',
                value: variable,
              },
            };
          })
        : [],
    },
  ];
};

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
