import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

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
