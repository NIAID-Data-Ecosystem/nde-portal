import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

// /*
// Escape elastic search reserved characters.
// https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_reserved_characters
// str.replace(/([\-\=\!\*\+\&\|\(\)\[\]\{\}\^\~\?\:\/])/g, '\\$1'),
// */

export const RESERVED_CHARS = [
  '+',
  '=',
  '&',
  '&&',
  '||',
  '>',
  '<',
  '!',
  '{',
  '}',
  // '[',
  // ']',
  '^',
  '~',
  '?',
  '/',
];

const schemaProperties = new Set(
  [
    ...Object.values(SCHEMA_DEFINITIONS),
    { dotfield: '_exists_' },
    { dotfield: '-_exists_' },
  ].map(definition => {
    if (definition.dotfield === '@id') {
      return '_id';
    }
    return definition.dotfield;
  }),
);

export const encodeString = (str: string) => {
  // List of special characters that need to be escaped, excluding colon
  const escapeRegex = new RegExp(
    `(?<!\\\\)([${RESERVED_CHARS.map(char => '\\' + char).join('')}])`,
    'g',
  );

  // Function to escape necessary characters
  const escapeSpecialChars = (s: string) => {
    const escaped = s.replace(escapeRegex, '\\$1');
    // If the string doesn't include "AND" "OR" or "NOT" operators, escape parens.
    if (!str.includes('AND') && !str.includes('OR') && !str.includes('NOT')) {
      return escaped.replace(/(?<!\\)([\(\)])/g, '\\$1');
    }
    return escaped;
  };

  // Identify parts that could be field queries
  return str.split(':').reduce((acc, part, index, parts) => {
    // Always escape special characters
    const escapedPart = escapeSpecialChars(part);
    // Check if this part could be a field query
    if (index < parts.length - 1) {
      // Extract the potential field name (after cleaning up non-alpha characters (excluded @, . and _ for field names))
      const potentialField = part
        .split(' ')
        .pop()
        ?.replace(/[^a-zA-Z_@.]/g, '');
      // Append colon back if it's a valid field or escape it otherwise
      if (potentialField && schemaProperties.has(potentialField)) {
        return `${acc}${escapedPart}:`;
      } else {
        if (escapedPart.endsWith('\\')) {
          return `${acc}${escapedPart}:`; // the colon is already escaped, just append it
        } else {
          return `${acc}${escapedPart}\\:`; // Escape the colon
        }
      }
    }

    // Last part, just accumulate it
    return acc + escapedPart;
  }, '');
};
