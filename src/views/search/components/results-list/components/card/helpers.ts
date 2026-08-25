import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SearchableItem } from 'src/components/searchable-items';
import { FormattedResource } from 'src/utils/api/types';
import {
  CONTENT_TYPE_ABOUT_FIELD,
  CONTENT_TYPE_EXAMPLE_OF_WORK_FIELD,
} from 'src/views/search/config/content-type';
import {
  getContentTypeLabel,
  getContentTypeTerms,
} from '../../utils/content-type';

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
 * Builds the "Content Type" pills for a card from the record's merged `about`
 * and `exampleOfWork.about` terms. Each pill's link searches both fields with
 * OR, so the results are the same no matter which field supplied the value.
 */
export const getContentTypeItems = (
  data?: FormattedResource | null,
): SearchableItem[] =>
  // Ordering is left to SearchableItems, which sorts by label.
  getContentTypeTerms(data).map(term => {
    // `name` is the only property indexed under both fields, so it is always
    // the searched value.
    const value = term.name as string;

    return {
      name: getContentTypeLabel(term),
      value,
      // Primary field, kept so the item still resolves to a sensible query if
      // `query` is ever dropped.
      field: CONTENT_TYPE_ABOUT_FIELD,
      query: `(${CONTENT_TYPE_ABOUT_FIELD}:"${value}" OR ${CONTENT_TYPE_EXAMPLE_OF_WORK_FIELD}:"${value}")`,
    };
  });
