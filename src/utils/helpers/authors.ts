import { Author, FormattedResource } from 'src/utils/api/types';

// Add punctuation to end of string if needed.
export const shouldAppendPunctuation = (
  str: string | null,
  symbol: string = '.',
) => {
  if (!str) {
    return '';
  }
  return str.slice(-1) === symbol ? str : str + symbol;
};

// Format a single author's name, returning an empty string if no name fields exist.
export const formatAuthorName = (author: Author): string => {
  if (author.name) {
    // If name has comma format so that first name goes after last name.
    // [NOTE]: might cause issues. Not sure this is the best way of handling.
    if (author.name.includes(',')) {
      let [familyName, givenName] = author.name.split(',');
      return `${givenName} ${familyName}`;
    }
    return author.name;
  }
  if (author.givenName || author.familyName) {
    return `${author.givenName ? `${author.givenName} ` : ''}${
      author?.familyName || ''
    }`;
  }
  return '';
};

// Format authors name string with a given separator
export const formatAuthorsList2String = (
  authorsData: FormattedResource['author'],
  separator: string = ',',
  maxLength?: number,
): string => {
  if (!authorsData) {
    return '';
  }
  let authors = !Array.isArray(authorsData) ? [authorsData] : authorsData;

  let author_list = authors.map((author, i) => {
    const author_name = formatAuthorName(author);

    // if only one author.
    if (authors.length === 1) {
      return author_name;
    }

    // Add separator between names.
    const formattedAuthorString =
      i === authors.length - 1
        ? `and ${author_name}`
        : shouldAppendPunctuation(author_name, separator);

    return formattedAuthorString;
  });

  // If max length is provided, cut off author list string and add et al.
  if (maxLength && author_list.length > maxLength) {
    return author_list.slice(0, maxLength).join(' ') + ' et al';
  }

  return author_list.join(' ');
};
