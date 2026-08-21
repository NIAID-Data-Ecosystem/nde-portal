/*
 * "Content Type" is a presentation concept that combines two API fields:
 * `about` and `exampleOfWork.about`.
 *
 * The same fields are used by the Data Collection card, table, and filter,
 * so they are defined here once instead of being repeated in each component.
 *
 * Keep this module free of imports. The query-string utility uses
 * MERGED_FILTER_FIELDS and must remain independent of filter configuration
 * so it can be tested in isolation.
 */

/* Fields searched when matching a Content Type value. A value matches if it
 * is present in either field. */
export const CONTENT_TYPE_ABOUT_FIELD = 'about.name';
export const CONTENT_TYPE_EXAMPLE_OF_WORK_FIELD = 'exampleOfWork.about.name';

/*
 * Field used to get facet terms for `exampleOfWork.about`.
 *
 * `about.name` can be faceted directly, but `exampleOfWork.about.name` is
 * analyzed, so its `.raw` subfield must be used to get usable facet terms.
 */
export const CONTENT_TYPE_EXAMPLE_OF_WORK_FACET =
  'exampleOfWork.about.name.raw';

// Content Type is not defined in schema-definitions.json and combines two
// properties, so its description is defined here.
export const CONTENT_TYPE_TOOLTIP =
  'The types of data included in the collection.';

// Defines the facet and filter fields for one part of a merged filter.
export interface MergedFilterField {
  /** Field used to retrieve facet terms. */
  facet: string;
  /** Field used when filtering records. */
  filter: string;
}

/**
 * Filters that use multiple API fields, keyed by the filter's `property`.
 *
 * Each field contributes facet terms that are merged into one list, and a
 * selected term matches records in any of the listed filter fields.
 *
 * `exampleOfWork` uses different fields for facets and filtering: `.raw` is
 * used to retrieve facet terms, while the analyzed field is used for queries.
 * This is the same pattern used by `FilterConfig.filterProperty` for
 * single-field filters.
 */
export const MERGED_FILTER_FIELDS: Record<string, MergedFilterField[]> = {
  [CONTENT_TYPE_ABOUT_FIELD]: [
    {
      facet: CONTENT_TYPE_ABOUT_FIELD,
      filter: CONTENT_TYPE_ABOUT_FIELD,
    },
    {
      facet: CONTENT_TYPE_EXAMPLE_OF_WORK_FACET,
      filter: CONTENT_TYPE_EXAMPLE_OF_WORK_FIELD,
    },
  ],
};

/**
 * Returns the API fields used to retrieve facet terms for a filter.
 * Merged filters return all of their facet fields. Other filters return
 * their own property.
 */
export const getFacetProperties = (property: string): string[] =>
  MERGED_FILTER_FIELDS[property]?.map(field => field.facet) ?? [property];
