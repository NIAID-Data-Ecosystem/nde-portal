import { FilterConfig, ChartConfig, FilterCategory } from './types';
import { getMetadataDescription } from 'src/components/metadata';
import {
  SHOW_SAMPLES_TAB,
  SHOW_DATA_COLLECTIONS_TAB,
  SHOW_COLLECTION_SIZE_FILTER,
} from 'src/utils/feature-flags';
import {
  formatConditionsOfAccess,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';
import {
  CONTENT_TYPE_ABOUT_FIELD,
  CONTENT_TYPE_TOOLTIP,
  getFacetProperties,
} from 'src/views/search/config/content-type';
import { formatTermLabel } from 'src/utils/formatting/formatTermLabel';
import {
  COLLECTION_SIZE_FILTER_ID,
  COLLECTION_SIZE_TOOLTIP,
  COLLECTION_SIZE_UNIT_FIELD,
  COLLECTION_SIZE_VALUE_FIELD,
  formatUnitLabel,
} from 'src/views/search/config/collection-size';

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
    transformData: (item: { count: number; term: string; label?: string }) => ({
      ...item,
      label: item.term,
    }),
  },
  {
    id: 'sourceOrganization.name',
    name: 'Program Collection',
    property: 'sourceOrganization.name.raw',
    filterProperty: 'sourceOrganization.name',
    queryType: 'facet',
    showMissing: false,
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
    // Collection Size spans two API fields: the unit (a facet) and the
    // numeric range applied to `collectionSize.minValue`. Only the unit is
    // aggregated; `rangeProperty` is filter-only.
    id: COLLECTION_SIZE_FILTER_ID,
    name: 'Collection Size',
    property: COLLECTION_SIZE_UNIT_FIELD,
    rangeProperty: COLLECTION_SIZE_VALUE_FIELD,
    queryType: 'facet',
    // The unit is only meaningful alongside a collection size, so "No
    // collection size" is not a useful option for this filter.
    showMissing: false,
    description: COLLECTION_SIZE_TOOLTIP,
    // Units are indexed as authored, so the filter tag is capitalized to match
    // the dropdown's label for the same term.
    transformData: (item: { count: number; term: string; label?: string }) => ({
      ...item,
      label: formatUnitLabel(item.label || item.term),
    }),
    // No `chart`: a 143-term uncontrolled vocabulary in which the top 9 terms
    // cover >99.8% of records does not make a readable pie or bar chart.
    category: 'Shared / Dataset',
    tabIds: ['d', 'dc'],
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
    // Content Type uses both `about` and `exampleOfWork.about`.
    // See MERGED_FILTER_FIELDS for the corresponding merged-filter
    // configuration.
    // These fields are only present on ResourceCatalog and DataCollection
    // records, so their facet counts are already limited to those
    // record types.
    id: CONTENT_TYPE_ABOUT_FIELD,
    name: 'Content Type',
    property: CONTENT_TYPE_ABOUT_FIELD,
    queryType: 'facet',
    // `missing` would count all records without either field, including
    // datasets that cannot have a Content Type. Hide it because
    // "No content type" is not a useful option for this filter.
    showMissing: false,
    description: CONTENT_TYPE_TOOLTIP,
    chart: DEFAULT_BAR_PIE_CHART,
    // Facets contain the indexed `name` value (e.g., "MolecularSequence"),
    // while cards and tables display `about.displayName`. Format the
    // facet term here so the filter, tag, chart, cards, and table use
    // the same label.
    transformData: (item: { count: number; term: string; label?: string }) => ({
      ...item,
      label: formatTermLabel(item.label || item.term),
    }),
    category: 'Shared / Dataset',
    tabIds: ['d', 'dc'],
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
  {
    id: 'anatomicalSystem.name',
    name: 'Anatomical System',
    property: 'anatomicalSystem.name',
    queryType: 'facet',
    description: getMetadataDescription('anatomicalSystem') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Sample',
    tabIds: ['s'],
  },
  {
    id: 'associatedGenotype',
    name: 'Associated Genotype',
    property: 'associatedGenotype',
    queryType: 'facet',
    description: getMetadataDescription('associatedGenotype') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Sample',
    tabIds: ['s'],
  },
  {
    id: 'associatedPhenotype.name',
    name: 'Associated Phenotype',
    property: 'associatedPhenotype.name',
    queryType: 'facet',
    description: getMetadataDescription('associatedPhenotype') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Sample',
    tabIds: ['s'],
  },
  {
    id: 'cellType.name',
    name: 'Cell Type',
    property: 'cellType.name',
    queryType: 'facet',
    description: getMetadataDescription('cellType') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Sample',
    tabIds: ['s'],
  },
  {
    id: 'instrument.name',
    name: 'Instrument',
    property: 'instrument.name',
    queryType: 'facet',
    description: getMetadataDescription('instrument') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Sample',
    tabIds: ['s'],
  },
  {
    id: 'sampleType.name',
    name: 'Sample Type',
    property: 'sampleType.name',
    queryType: 'facet',
    description: getMetadataDescription('sampleType') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Sample',
    tabIds: ['s'],
  },
  {
    id: 'sex',
    name: 'Sex',
    property: 'sex',
    queryType: 'facet',
    description: getMetadataDescription('sex') || '',
    chart: DEFAULT_BAR_PIE_CHART,
    category: 'Sample',
    tabIds: ['s'],
  },
].filter(config => {
  // If SHOW_SAMPLES_TAB is false, filter out any filters in the "Sample" category.
  if (!SHOW_SAMPLES_TAB && config.category === 'Sample') {
    return false;
  }
  // If SHOW_DATA_COLLECTIONS_TAB is false, filter out any filters in the
  // "Data Collection" category.
  if (!SHOW_DATA_COLLECTIONS_TAB && config.category === 'Data Collection') {
    return false;
  }
  // Content Type is released with the Data Collections tab.
  if (!SHOW_DATA_COLLECTIONS_TAB && config.id === CONTENT_TYPE_ABOUT_FIELD) {
    return false;
  }
  // Collection Size is gated separately from the Data Collections tab.
  if (!SHOW_COLLECTION_SIZE_FILTER && config.id === COLLECTION_SIZE_FILTER_ID) {
    return false;
  }
  return true;
}) as FilterConfig[];

/**
 * Static comma-separated list of all facet properties from FILTER_CONFIGS.
 * Used to ensure a stable query key across all consumers (filters, date filter, visual summary).
 *
 * A filter that spans multiple API fields contributes all of those fields so
 * the aggregation response contains every key needed to build its facet data.
 */
export const ALL_FACET_PROPERTIES = FILTER_CONFIGS.flatMap(c =>
  getFacetProperties(c.property),
).join(',');

/**
 * Facet properties partitioned by the category that consumes them, as a
 * comma-separated string per category.
 *
 * Each category is served by its own type-scoped aggregation request
 * (see `src/views/search/hooks/use*Aggregation.ts`), and each of those
 * responses is only ever read for its own category's filters.
 *
 * Because `property` is unique and `category` is required on every config,
 * this is a lossless partition of `ALL_FACET_PROPERTIES`.
 *
 * Note the value is derived from the already feature-flag-filtered
 * FILTER_CONFIGS, so a category with no visible filters yields `''`. Callers
 * must skip the request in that case rather than send `facets=`.
 */
export const FACET_PROPERTIES_BY_CATEGORY = FILTER_CONFIGS.reduce(
  (acc, config) => {
    const properties = getFacetProperties(config.property).join(',');
    acc[config.category] = acc[config.category]
      ? `${acc[config.category]},${properties}`
      : properties;
    return acc;
  },
  {} as Record<FilterCategory, string>,
);

/**
 * Facet properties needed by a single category's scoped aggregation.
 * Returns an empty string when the category has no visible filters.
 */
export const getFacetPropertiesForCategory = (
  category: FilterCategory,
): string => FACET_PROPERTIES_BY_CATEGORY[category] ?? '';

/**
 * Every key a filter owns in the selected-filters object.
 *
 * Most filters own a single key (`property`). A filter that also declares a
 * `rangeProperty` owns two, so anywhere filter state is enumerated — seeding
 * the empty defaults, clearing all filters, deciding which sections open with
 * an active selection — must go through this rather than reading `property`
 * directly, or the range key is silently skipped.
 */
export const getFilterStateProperties = (config: FilterConfig): string[] =>
  config.rangeProperty
    ? [config.property, config.rangeProperty]
    : [config.property];

/**
 * Empty-array defaults for every filter state key. Used to seed the filters
 * object and to reset it when clearing all filters.
 */
export const getDefaultFilterState = (): Record<string, []> =>
  FILTER_CONFIGS.reduce((acc, config) => {
    getFilterStateProperties(config).forEach(property => {
      acc[property] = [];
    });
    return acc;
  }, {} as Record<string, []>);

/**
 * Get a filter config by id
 */
export const getFilterById = (id: string): FilterConfig | undefined => {
  return FILTER_CONFIGS.find(config => config.id === id);
};
