import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SearchableItem } from 'src/components/searchable-items';
import { FormattedResource } from 'src/utils/api/types';

const schemaProperties = Object.values(SCHEMA_DEFINITIONS).map(definition => {
  if (definition.dotfield === '@id') {
    return '_id';
  }
  return definition.dotfield;
});

// words to filter out from the search query - used for highlighting.
export const filterWords = (inputString: string) => {
  // Convert the input string to an array of words
  const words = inputString.split(/[:\s]+/);

  // Map over each word and strip non-alphanumeric characters from the start and end
  const cleanedWords = words.map(word => word.replace(/^[^\w]+|[^\w]+$/g, ''));
  // Filter out the words that are "AND", "OR", "NOT" or in the `fields` array since these are generally not useful for highlighting
  const filteredWords = cleanedWords
    .filter(
      word =>
        word.toUpperCase() !== 'AND' &&
        word.toUpperCase() !== 'OR' &&
        word.toUpperCase() !== 'NOT' &&
        word.toUpperCase() !== 'THE' &&
        !schemaProperties.includes(word) &&
        word.length > 2,
    )
    // Sort the words by length in descending order so that the longest words are matched first i.e. when searching for mus musculus the first mus will be matched with the first mus in mus musculus and the second musculus will be fully matched with the second musculus in mus musculus.
    .sort((a, b) => b.length - a.length);
  return filteredWords;
};

/*
 * Fields backing the merged "Content Type" pills on the Data Collection card.
 * `about` supplies the values shown as "Data Type" in the table view and
 * `exampleOfWork.about` the values shown as "Asset Type". A single pill
 * searches both at once.
 */
export const CONTENT_TYPE_ABOUT_FIELD = 'about.name';
export const CONTENT_TYPE_EXAMPLE_OF_WORK_FIELD = 'exampleOfWork.about.name';

// No "Content Type" entry exists in schema-definitions.json and the row spans
// two properties.
export const CONTENT_TYPE_TOOLTIP =
  'The types of data included in the collection.';

// DefinedTerm-ish shape shared by about[] and exampleOfWork.about[].
interface ContentTypeTerm {
  name?: string | null;
  displayName?: string | null;
}

// `exampleOfWork` is not declared on FormattedResource (it resolves through the
// index signature). It is typed locally, as the Data Collection table does.
interface ExampleOfWorkLike {
  about?: ContentTypeTerm | ContentTypeTerm[] | null;
}

/*
 * The API returns these nested objects bare when there is a single entry and as
 * an array when there are several, so every read has to be normalized.
 */
const toArray = <T>(value: T | T[] | null | undefined): T[] =>
  value == null ? [] : Array.isArray(value) ? value : [value];

/*
 * Builds the "Content Type" pills for a card by merging the record's `about`
 * (Data Type) and `exampleOfWork.about` (Asset Type) values into a single
 * unlabeled list. Each pill's link searches both fields with OR, so the results
 * are the same no matter which field supplied the value.
 *
 * Entries are collapsed case-insensitively on the searchable `name`.
 */
export const getContentTypeItems = (
  data?: FormattedResource | null,
): SearchableItem[] => {
  const terms: ContentTypeTerm[] = [
    ...toArray<ContentTypeTerm>(data?.about),
    ...toArray<ExampleOfWorkLike>(data?.exampleOfWork).flatMap(work =>
      toArray<ContentTypeTerm>(work?.about),
    ),
  ];

  const itemsByValue = new Map<string, SearchableItem>();

  terms.forEach(term => {
    // `name` is the only property indexed under both fields, so it is always
    // the searched value.
    const value = term?.name?.trim();
    if (!value) return;

    const label = term?.displayName?.trim() || value;
    const key = value.toLowerCase();
    const existing = itemsByValue.get(key);

    if (!existing) {
      itemsByValue.set(key, {
        name: label,
        value,
        // Primary field, kept so the item still resolves to a sensible query if
        // `query` is ever dropped.
        field: CONTENT_TYPE_ABOUT_FIELD,
        query: `(${CONTENT_TYPE_ABOUT_FIELD}:"${value}" OR ${CONTENT_TYPE_EXAMPLE_OF_WORK_FIELD}:"${value}")`,
      });
      return;
    }

    // Prefer a displayName when the first occurrence only had a bare name.
    if (existing.name === existing.value && label !== value) {
      itemsByValue.set(key, { ...existing, name: label });
    }
  });

  // Ordering is left to SearchableItems, which sorts by label.
  return Array.from(itemsByValue.values());
};
