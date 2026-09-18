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

export interface CollectionSizeText {
  count: string;
  unitText: string;
}

/*
 * Formats a DataCollection's `collectionSize` into the count + unitText
 * shown in the card's collection-size rectangle. Returns null when
 * there's no entry, no unitText, or none of minValue/maxValue/value.
 */
export const formatCollectionSize = (
  collectionSize?: FormattedResource['collectionSize'],
): CollectionSizeText | null => {
  const entry = collectionSize?.[0];
  if (!entry?.unitText) return null;

  const unitText = entry.unitText;
  if (typeof entry.minValue === 'number') {
    return { count: `${entry.minValue.toLocaleString()}+`, unitText };
  }
  if (typeof entry.maxValue === 'number') {
    return { count: entry.maxValue.toLocaleString(), unitText };
  }
  if (typeof entry.value === 'number') {
    return { count: entry.value.toLocaleString(), unitText };
  }
  return null;
};

/*
 * When the Content Type corresponds to a resource type, the search will
 * also match the actual typed records.
 */
const CONTENT_TYPE_TO_RESOURCE_TYPE: Record<string, string> = {
  dataset: 'Dataset',
  sample: 'Sample',
  software: 'ComputationalTool',
};

/*
 * Builds the "Content Types" pills for a Resource Catalog card from `about`
 * alone, linking each pill to a search on `about.displayName`. When the
 * value is a known resource type, the search also matches records of
 * the corresponding `@type`.
 */
export const getResourceCatalogContentTypeItems = (
  data?: FormattedResource | null,
): SearchableItem[] => {
  const about = data?.about;
  if (!about) return [];
  const aboutArray = Array.isArray(about) ? about : [about];
  return aboutArray.map(a => {
    const value = a.displayName;
    const resourceType = value
      ? CONTENT_TYPE_TO_RESOURCE_TYPE[value.toLowerCase()]
      : undefined;

    return {
      name: value,
      value,
      field: 'about.displayName',
      ...(resourceType && {
        query: `(about.displayName:"${value}" OR @type:"${resourceType}")`,
      }),
    };
  });
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
