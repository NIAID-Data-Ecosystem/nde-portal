import sourceData from 'configs/resource-sources.json';
import {Citation, FormattedResource} from './api/types';

// Get image for repo based on config.
export const getRepositoryImage = (repoName: string) => {
  if (!repoName) {
    return null;
  }
  const {repositories} = sourceData;
  const sourceRepoIndex = repositories.findIndex(source => {
    return source.sourceName.toLowerCase().includes(repoName.toLowerCase());
  });

  const imageURL =
    sourceRepoIndex >= 0 ? repositories[sourceRepoIndex].imageUrl : null;

  return imageURL;
};

export const getRepositoryName = (sourceName: string | null) => {
  if (!sourceName) {
    return null;
  }
  const {repositories} = sourceData;
  const sourceRepoIndex = repositories.findIndex(source => {
    return source.sourceName.toLowerCase().includes(sourceName.toLowerCase());
  });
  return sourceRepoIndex >= 0 ? repositories[sourceRepoIndex].name : sourceName;
};

// Format authors name string with a given separator
export const formatAuthorsList2String = (
  authors: FormattedResource['author'],
  separator: string = ',',
  maxLength?: number,
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
  if (maxLength && author_list.length > maxLength) {
    return author_list.slice(0, maxLength).join(' ') + ' et al.';
  }
  return author_list.join(' ');
};

// Format citation string according to :
// https://www.nlm.nih.gov/bsd/uniform_requirements.html
export const formatCitationString = (citation: Citation) => {
  const authors = formatAuthorsList2String(citation.author);

  const year = citation.datePublished
    ? `${new Date(citation.datePublished).getUTCFullYear()}`
    : '';

  const journal = citation.journalName ? `${citation.journalName}` : '';

  const pmid = citation.pmid ? `PubMed PMID: ${citation.pmid}` : '';
  return `${authors}. ${citation.name}. ${journal}. ${year}. ${pmid}`;
};

// Format Date object to string with no weekday
export const formatDate = (date: Date | string) => {
  return new Date(date).toDateString().split(' ').slice(1).join(' ');
};

// Format DOI if url is included in string.
export const formatDOI = (doi: FormattedResource['doi']) => {
  if (doi.includes('https://doi.org/')) {
    return doi?.split('https://doi.org/')[1];
  }
  return doi;
};
