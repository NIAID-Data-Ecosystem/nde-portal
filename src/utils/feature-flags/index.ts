// [Feature Flags]
// This file contains feature flags to enable/disable certain features or sections of the application
// based on the environment or other conditions.
const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';

// Hide samples section in production builds until approved. To enable section in production, set this flag to return `false`.
export const SHOULD_HIDE_SAMPLES = (hash: string) =>
  hash === 'samples' && isProd;

// Hide the samples tab on the search results page in production builds until
// approved. To enable tab in production, set this flag to `true`.
export const SHOW_SAMPLES_TAB = !isProd;

// Hide the data collections tab on the search results page in production builds until approved. To enable tab in production, set this flag to `true`.
export const SHOW_DATA_COLLECTIONS_TAB = !isProd;

// Show credit text section in non-production environments for testing/review. To enable section in production, set this flag to `true`.
// Note that we currently have two separate sections where credit text appears:
// - In the sidebar under "Resource Access": src/components/resource-sections/components/sidebar/components/external/index.tsx
// - As a standalone section in the overview section: src/components/resource-sections/index.tsx
export const SHOW_CREDIT_TEXT_SECTION = !isProd;

// Show AI-assisted search toggle and related components (e.g. banner) in non-production environments for testing/review. To enable in production, set this flag to `true`.
export const SHOW_AI_ASSISTED_SEARCH = true;

// Enable account creation and login features in non-production environments for testing/review. To enable in production, set this flag to `true`.
export const ENABLE_AUTH = !isProd;

/**
 * Hide sample-related fields in the advanced search field dropdown in production
 * builds until approved. To enable these fields in production, set this flag to `false`.
 */
export const SHOULD_HIDE_SAMPLE_FIELDS = isProd;

/**
 * The set of advanced-search field dotfields that are gated behind the
 * SHOULD_HIDE_SAMPLE_FIELDS flag.
 */
export const HIDDEN_SAMPLE_FIELDS = new Set<string>([
  'sample.aggregateElement.anatomicalStructure.name',
  'sample.aggregateElement.associatedGenotype',
  'sample.aggregateElement.associatedPhenotype.name',
  'sample.aggregateElement.cellType.name',
  'sample.aggregateElement.developmentalStage.name',
  'sample.aggregateElement.sampleType.name',
  'sample.aggregateElement.sex',
  'sample.anatomicalStructure.name',
  'sample.associatedGenotype',
  'sample.associatedPhenotype.name',
  'sample.cellType.name',
  'sample.developmentalStage.name',
  'sample.sampleType.name',
  'sample.sex',
]);

// Show the Sample UI pill and corresponding metadata accordion section on dataset cards
// in non-production environments. To enable in production, set this flag to `true`.
export const SHOW_SAMPLE_UI_PILL = !isProd;

// Show the distinct "Retired" treatment for ResourceCatalog resources (gray
// type banner, gray card background, Retired badge, and the Access Resource
// link redirecting to the knowledge-center/retired-resources page) in
// non-production environments for testing/review. To enable in production,
// set this flag to `true`.
export const SHOW_RETIRED_RESOURCE_CATALOG_UI = !isProd;

// Show the mutual-exclusivity behavior for the "Any <filter>" (_exists_) and
// "No <filter>" (-_exists_) filter checkboxes in the search filters panel in
// non-production environments for testing/review. When enabled: checking
// "Any"/"No" hides all other options/facets for that filter, checking
// "Any"/"No" deselects any previously selected values for that filter, and
// checking a normal value while "Any"/"No" is active drops "Any"/"No". To
// enable in production, set this flag to `true`.
export const SHOW_FILTER_ANY_NO_EXCLUSIVITY = !isProd;
