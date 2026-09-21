import { Facet, FacetTerm } from 'src/utils/api/types';
import {
  CONTENT_TYPE_ABOUT_FIELD,
  CONTENT_TYPE_RESOURCE_TYPE_FIELD,
  getFacetProperties,
  getResourceTypeForContentType,
} from 'src/views/search/config/content-type';

/**
 * Facet data used by a filter. A filter may use one API field or combine
 * values from multiple fields.
 */
export interface MergedFacet {
  terms: FacetTerm[];
  /** Number of records matching at least one field ("Any"). */
  existsCount: number;
  /** Number of records matching none of the fields ("No"). */
  missing: number;
}

/**
 * Adds the `@type` count to every Content Type term that names a resource
 * type, so a term's count reflects everything selecting it will match: the
 * records *about* that type and the records *of* that type.
 *
 * Counts are summed here, unlike the `max` used for the merged content
 * fields. Those fields describe the same records, but a ResourceCatalog whose
 * `about.name` is "Dataset" is not itself a `@type:Dataset` record, so the two
 * sets are disjoint and adding them cannot double-count.
 */
const widenResourceTypeCounts = (
  terms: FacetTerm[],
  facets: Facet,
): FacetTerm[] => {
  const typeTerms = facets[CONTENT_TYPE_RESOURCE_TYPE_FIELD]?.terms;
  if (!typeTerms?.length) return terms;

  const countsByType = new Map(typeTerms.map(t => [t.term, t.count]));

  const widened = terms.map(term => {
    const resourceType = getResourceTypeForContentType(term.term);
    const typeCount = resourceType ? countsByType.get(resourceType) : undefined;

    return typeCount ? { ...term, count: term.count + typeCount } : term;
  });

  return widened.sort((a, b) => b.count - a.count);
};

/**
 * Gets the facet data for a filter, combining data when the filter maps to
 * multiple API fields.
 *
 * Counts use the largest value across fields rather than summing them. The
 * fields can contain many of the same records, so summing would count those
 * records more than once. In the current index, records with a term in
 * `exampleOfWork.about` also have that term in `about`, making `max` the
 * correct count for the current data.
 *
 * Terms are merged case-insensitively, keeping the casing from the first
 * occurrence and the largest count for each term.
 *
 * Content Type is the one exception to the `max` rule, for the disjoint
 * `@type` counts it folds in.
 *
 * Returns `null` when none of the filter's fields contain facet terms.
 */
export const mergeFacets = (
  facets: Facet | undefined,
  property: string,
  total: number,
): MergedFacet | null => {
  if (!facets) return null;

  // Content Type terms that name a resource type also match records of that
  // type, so their counts include the `@type` count.
  const widen = (terms: FacetTerm[]): FacetTerm[] =>
    property === CONTENT_TYPE_ABOUT_FIELD
      ? widenResourceTypeCounts(terms, facets)
      : terms;

  const properties = getFacetProperties(property);
  const present = properties
    .map(field => facets[field])
    .filter((facet): facet is Facet[string] => Boolean(facet?.terms));

  if (present.length === 0) return null;

  // `_exists_` ("Any") is never widened with `@type`. It selects records that
  // have a content type at all, and `@type` is present on every record. So
  // the exists/missing counts below stay as the content fields report them.

  // Single-field filters don't need merging, so preserve their original
  // terms and counts.
  if (present.length === 1) {
    const [facet] = present;
    return {
      terms: widen(facet.terms),
      existsCount: total - (facet.missing || 0),
      missing: facet.missing || 0,
    };
  }

  const termsByKey = new Map<string, FacetTerm>();

  present.forEach(facet => {
    facet.terms.forEach(term => {
      const key = term.term.toLowerCase();
      const existing = termsByKey.get(key);
      if (!existing) {
        termsByKey.set(key, term);
        return;
      }
      if (term.count > existing.count) {
        // Preserve the first-seen spelling while using the larger count.
        termsByKey.set(key, { ...existing, count: term.count });
      }
    });
  });

  const terms = widen(
    Array.from(termsByKey.values()).sort((a, b) => b.count - a.count),
  );

  // Use the field with the most matching records as the "Any" count.
  const existsCount = Math.max(
    ...present.map(facet => total - (facet.missing || 0)),
  );

  return { terms, existsCount, missing: total - existsCount };
};
