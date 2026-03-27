import { FilterConfig, ChartConfig } from './types';
import { getMetadataDescription } from 'src/components/metadata';
import {
  formatConditionsOfAccess,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';

/**
 * Default chart configuration for bar and pie visualizations
 */
const DEFAULT_BAR_PIE_CHART: ChartConfig = {
  availableOptions: ['bar', 'pie'],
  defaultOption: 'pie',
  bar: { minPercent: 0.0001, maxItems: 10 },
  pie: { minPercent: 0.01 },
};

/**
 * Simplified filter configuration array.
 * Order matters - filters will be rendered in this order.
 */
export const FILTER_CONFIGS: FilterConfig[] = [
  {
    id: 'date',
    name: 'Date',
    property: 'date',
    queryType: 'histogram',
    isDefaultOpen: true,
    description: '',
    chart: {
      availableOptions: ['histogram'],
      defaultOption: 'histogram',
    },
    category: 'Shared / Dataset',
    tabIds: ['d', 'ct'],
  },
  {
    id: 'includedInDataCatalog',
    name: 'Sources',
    property: 'includedInDataCatalog.name',
    queryType: 'source',
    description: getMetadataDescription('includedInDataCatalog') || '',
    groupBy: [
      { property: 'IID', label: 'IID Repositories' },
      { property: 'Generalist', label: 'Generalist Repositories' },
    ],
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d', 'ct'],
  },
  {
    id: 'sourceOrganization.name',
    name: 'Program Collection',
    property: 'sourceOrganization.name.raw',
    filterProperty: 'sourceOrganization.name',
    queryType: 'facet',
    description: getMetadataDescription('sourceOrganization') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d', 'ct'],
  },
  {
    id: 'healthCondition.name.raw',
    name: 'Health Condition',
    property: 'healthCondition.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('healthCondition') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d'],
  },
  {
    id: 'infectiousAgent.displayName.raw',
    name: 'Pathogen Species',
    property: 'infectiousAgent.displayName.raw',
    queryType: 'facet',
    description: getMetadataDescription('infectiousAgent') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d'],
  },
  {
    id: 'species.displayName.raw',
    name: 'Host Species',
    property: 'species.displayName.raw',
    queryType: 'facet',
    description: getMetadataDescription('species') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d'],
  },
  {
    id: 'funding.funder.name.raw',
    name: 'Funding',
    property: 'funding.funder.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('funding') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d', 'ct'],
  },
  {
    id: 'conditionsOfAccess',
    name: 'Conditions of Access',
    property: 'conditionsOfAccess',
    queryType: 'facet',
    description: getMetadataDescription('conditionsOfAccess') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    transformData: (item: { count: number; term: string; label?: string }) => ({
      ...item,
      label:
        transformConditionsOfAccessLabel(
          formatConditionsOfAccess(item.label || item.term),
        ) || '',
    }),
    category: 'Shared / Dataset',
    tabIds: ['d', 'ct'],
  },
  {
    id: 'variableMeasured.name.raw',
    name: 'Variable Measured',
    property: 'variableMeasured.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('variableMeasured') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d'],
  },
  {
    id: 'measurementTechnique.name.raw',
    name: 'Measurement Technique',
    property: 'measurementTechnique.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('measurementTechnique') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d'],
  },
  {
    id: 'topicCategory.name.raw',
    name: 'Topic Category',
    property: 'topicCategory.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('topicCategory') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Shared / Dataset',
    tabIds: ['d', 'ct'],
  },
  {
    id: 'applicationCategory.raw',
    name: 'Application Category',
    property: 'applicationCategory.raw',
    queryType: 'facet',
    description: getMetadataDescription('applicationCategory') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Computational Tool',
    tabIds: ['ct'],
  },
  {
    id: 'operatingSystem.raw',
    name: 'Operating System',
    property: 'operatingSystem.raw',
    queryType: 'facet',
    description: getMetadataDescription('operatingSystem') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Computational Tool',
    tabIds: ['ct'],
  },
  {
    id: 'programmingLanguage.raw',
    name: 'Programming Language',
    property: 'programmingLanguage.raw',
    queryType: 'facet',
    description: getMetadataDescription('programmingLanguage') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Computational Tool',
    tabIds: ['ct'],
  },
  {
    id: 'featureList.name.raw',
    name: 'Feature List',
    property: 'featureList.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('featureList') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Computational Tool',
    tabIds: ['ct'],
  },
  {
    id: 'input.name.raw',
    name: 'Input',
    property: 'input.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('input') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Computational Tool',
    tabIds: ['ct'],
  },
  {
    id: 'output.name.raw',
    name: 'Output',
    property: 'output.name.raw',
    queryType: 'facet',
    description: getMetadataDescription('output') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Computational Tool',
    tabIds: ['ct'],
  },
];

/**
 * Get a filter config by id
 */
export const getFilterById = (id: string): FilterConfig | undefined => {
  return FILTER_CONFIGS.find(config => config.id === id);
};
