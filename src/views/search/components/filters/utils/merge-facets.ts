import { Facet, FacetTerm } from 'src/utils/api/types';
import { getFacetProperties } from 'src/views/search/config/content-type';

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
 * Returns `null` when none of the filter's fields contain facet terms.
 */
export const mergeFacets = (
  facets: Facet | undefined,
  property: string,
  total: number,
): MergedFacet | null => {
  if (!facets) return null;

  const properties = getFacetProperties(property);
  const present = properties
    .map(field => facets[field])
    .filter((facet): facet is Facet[string] => Boolean(facet?.terms));

  if (present.length === 0) return null;

  // Single-field filters don't need merging, so preserve their original
  // terms and counts.
  if (present.length === 1) {
    const [facet] = present;
    return {
      terms: facet.terms,
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

  const terms = Array.from(termsByKey.values()).sort(
    (a, b) => b.count - a.count,
  );

  // Use the field with the most matching records as the "Any" count.
  const existsCount = Math.max(
    ...present.map(facet => total - (facet.missing || 0)),
  );

  return { terms, existsCount, missing: total - existsCount };
};
