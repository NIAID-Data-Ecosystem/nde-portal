import { FormattedResource } from 'src/utils/api/types';

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

// Format authors name string with a given separator
export const formatAuthorsList2String = (
  authorsData: FormattedResource['author'],
  separator: string = ',',
  maxLength?: number,
) => {
  if (!authorsData) {
    return '';
  }
  let authors = !Array.isArray(authorsData) ? [authorsData] : authorsData;

  let author_list = authors.map((author, i) => {
    // Not author name fields exist.
    let author_name = '';

    if (author.name) {
      author_name = author.name;

      // If name has comma format so that first name goes after last name.
      // [NOTE]: might cause issues. Not sure this is the best way of handling.
      if (author.name.includes(',')) {
        let [familyName, givenName] = author.name.split(',');
        author_name = `${givenName} ${familyName}`;
      }
    } else if (author.givenName || author.familyName) {
      author_name = `${author.givenName ? `${author.givenName} ` : ''}${
        author?.familyName || ''
      }`;
    }

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
