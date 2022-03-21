import sourceData from 'configs/resource-sources.json';
import {Citation, FormattedResource} from './api/types';

// Get image for repo based on config.
export const getRepositoryImage = (repoName: string) => {
  if (!repoName) {
    return null;
  }
  const {repositories} = sourceData;
  const sourceRepoIndex = repositories.findIndex(source => {
    return source.name.toLowerCase().includes(repoName.toLowerCase());
  });

  const imageURL =
    sourceRepoIndex >= 0 ? repositories[sourceRepoIndex].imageUrl : null;

  return imageURL;
};

// Format authors name string with a given separator
export const formatAuthorsList2String = (
  authors: FormattedResource['author'],
  separator: string = ',',
) => {
  if (!authors) {
    return '';
  }

  let author_list = authors.map((author, i) => {
    if (!author.name) {
      return;
    }

    // remove all symbols from author name
    const formattedAuthor = author.name.replace(/[^a-zA-Z ]/g, '');

    // if only one author.
    if (authors.length === 1) {
      return formattedAuthor;
    }

    // remove all symbols from author name
    const formattedAuthorString =
      i === authors.length - 1
        ? `and ${formattedAuthor}`
        : formattedAuthor + `${separator}`;

    return formattedAuthorString;
  });

  return author_list.join(' ');
};

export const formatCitationString = (citation: Citation) => {
  const authors = formatAuthorsList2String(citation.author);

  const year = citation.datePublished
    ? `${new Date(citation.datePublished).getUTCFullYear()}`
    : '';

  const journal = citation.journalName ? `${citation.journalName}` : '';

  const pmid = citation.pmid ? `PubMed PMID: ${citation.pmid}` : '';
  return `${authors}. ${citation.name}. ${journal}. ${year}. ${pmid}`;
  return 'hi';
};
