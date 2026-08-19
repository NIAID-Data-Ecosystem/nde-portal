import { FormattedResource } from 'src/utils/api/types';
import { formatTermLabel } from 'src/utils/formatting/formatTermLabel';
import { toArray } from '../components/results-table/utils';

/*
 * Reads Content Type values from both `about` and `exampleOfWork.about`.
 * The field names and related filter configuration are defined in
 * `src/views/search/config/content-type.ts`.
 */

// DefinedTerm-like shape shared by `about` and `exampleOfWork.about`.
export interface ContentTypeTerm {
  name?: string | null;
  displayName?: string | null;
  url?: string | null;
}

// `exampleOfWork` is not declared on FormattedResource (it resolves through the
// index signature), so it is typed locally.
interface ExampleOfWorkLike {
  about?: ContentTypeTerm | ContentTypeTerm[] | null;
}

const trimmed = (value?: string | null): string => value?.trim() || '';

/*
 * Merges a record's `about` and `exampleOfWork.about` terms into a single list.
 *
 * On collision the entry carrying a `url` wins, since that is the link to the
 * term's ontology entry. A `displayName` from a later duplicate fills in
 * for one the kept entry lacks.
 *
 * Returned in encounter order.
 */
export const getContentTypeTerms = (
  data?: FormattedResource | null,
): ContentTypeTerm[] => {
  const terms: ContentTypeTerm[] = [
    ...toArray<ContentTypeTerm>(data?.about),
    ...toArray<ExampleOfWorkLike>(data?.exampleOfWork).flatMap(work =>
      toArray<ContentTypeTerm>(work?.about),
    ),
  ];

  const termsByName = new Map<string, ContentTypeTerm>();

  terms.forEach(term => {
    // `name` is the only property indexed under both fields, so it is the value
    // everything else keys off.
    const name = trimmed(term?.name);
    if (!name) return;

    const key = name.toLowerCase();
    const existing = termsByName.get(key);

    if (!existing) {
      termsByName.set(key, { ...term, name });
      return;
    }

    termsByName.set(key, {
      ...existing,
      displayName: trimmed(existing.displayName) || term.displayName,
      url: trimmed(existing.url) || term.url,
    });
  });

  return Array.from(termsByName.values());
};

/*
 * Returns the label to display for a Content Type.
 *
 * Prefers the API's human-readable `displayName`, falling back to `name` when
 * it is unavailable. The fallback is formatted because `name` uses raw
 * PascalCase values such as "GeneVariant".
 */
export const getContentTypeLabel = (term: ContentTypeTerm): string => {
  const name = trimmed(term.displayName) || trimmed(term.name);
  // A URL is already formatted for display, so return it unchanged.
  return name ? formatTermLabel(name) : trimmed(term.url);
};
