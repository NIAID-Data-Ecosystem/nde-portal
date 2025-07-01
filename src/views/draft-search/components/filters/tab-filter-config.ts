/**
 * Tab filter configuration
 * Defines which filter properties are available in each search tab:
 * - 'd': dataset tab
 * - 'ct': computational tool tab
 */

export type TabId = 'd' | 'ct';

export interface TabFilterConfig {
  readonly d: readonly string[];
  readonly ct: readonly string[];
}

/**
 * Configuration mapping for filter properties available in each tab
 * ('d' and 'ct)
 */
export const TAB_FILTER_CONFIG: TabFilterConfig = {
  d: [
    'date',
    '@type',
    'includedInDataCatalog.name',
    'sourceOrganization.name',
    'healthCondition.name.raw',
    'infectiousAgent.displayName.raw',
    'species.displayName.raw',
    'funding.funder.name.raw',
    'conditionsOfAccess',
    'variableMeasured.name.raw',
    'measurementTechnique.name.raw',
  ] as const,
  ct: [
    'date',
    '@type',
    'includedInDataCatalog.name',
    'sourceOrganization.name',
    'funding.funder.name.raw',
    'conditionsOfAccess',
    'applicationCategory.raw',
    'operatingSystem.raw',
    'programmingLanguage.raw',
    'featureList.name.raw',
    'input.name.raw',
    'output.name.raw',
  ] as const,
} as const;
