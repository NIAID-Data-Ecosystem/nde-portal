import ADVANCED_SEARCH_CONFIG from 'configs/advanced-search-fields.json';

const NAMING_EXCEPTIONS = ADVANCED_SEARCH_CONFIG['namingChanges'] as {
  [key: string]: string;
};

export function dotfieldAndCamelCaseToHumanReadable(input: string) {
  if (NAMING_EXCEPTIONS[input]) {
    return NAMING_EXCEPTIONS[input];
  }
  // Function to split camelCase into words
  function splitCamelCase(s: string) {
    if (NAMING_EXCEPTIONS[s]) {
      return NAMING_EXCEPTIONS[s];
    }
    return s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  }

  // Split the input on dots, then split or transform each part from camelCase to words
  const parts = input.split('.').map(part => {
    // Check if the part is exactly an exception before splitting
    return NAMING_EXCEPTIONS[part] || splitCamelCase(part);
  });

  // Capitalize the first letter of each word and join everything with spaces
  const result = parts
    .map(part =>
      part
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    )
    .join(' ');

  return result;
}
