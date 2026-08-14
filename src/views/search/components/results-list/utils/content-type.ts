import { FormattedResource } from 'src/utils/api/types';
import { toArray } from '../components/results-table/utils';

/*
 * "Content Type" is a presentation-only concept that merges two API fields:
 * `about` and `exampleOfWork.about`. Both are shown together on the Data
 * Collection card (as searchable pills) and in the Data Collection table (as a
 * single column), so the merging and deduplication live here.
 */

/*
 * Fields backing the merged "Content Type" values. A single card pill searches
 * both at once.
 */
export const CONTENT_TYPE_ABOUT_FIELD = 'about.name';
export const CONTENT_TYPE_EXAMPLE_OF_WORK_FIELD = 'exampleOfWork.about.name';

// No "Content Type" entry exists in schema-definitions.json and the value spans
// two properties.
export const CONTENT_TYPE_TOOLTIP =
  'The types of data included in the collection.';

// DefinedTerm-ish shape shared by about[] and exampleOfWork.about[].
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
 * The label shown for a term: its `displayName` when present, since that is the
 * human-readable form.
 */
export const getContentTypeLabel = (term: ContentTypeTerm): string =>
  trimmed(term.displayName) || trimmed(term.name) || trimmed(term.url);
