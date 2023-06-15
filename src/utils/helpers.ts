import REPOSITORIES from 'configs/repositories.json';
import { Citation, FormattedResource } from './api/types';

// Get image for repo based on config.
export const getRepositoryImage = (name: string) => {
  if (!name) {
    return null;
  }
  const { repositories } = REPOSITORIES;
  const sourceRepoIndex = repositories.findIndex(repo => {
    return repo.id === name;
  });

  const imageURL =
    sourceRepoIndex >= 0 ? repositories[sourceRepoIndex].imageURL : null;

  return imageURL;
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

// Format citation string according to :
// https://www.nlm.nih.gov/bsd/uniform_requirements.html
export const formatCitationString = (
  citation: Citation,
  asMarkdown?: boolean,
) => {
  const authors = formatAuthorsList2String(citation.author, ',', 3);

  const year = citation.datePublished
    ? `${new Date(citation.datePublished).getUTCFullYear()}`
    : '';

  const journal = citation.journalName ? `*${formatJournal(citation)}*` : '';

  const pmid = citation.pmid ? `PubMed PMID: ${citation.pmid}` : '';
  const doi = citation.doi ? `DOI: ${citation.doi}` : '';

  // Return the string as markdown

  const citation_strings = [
    shouldAppendPunctuation(authors),
    shouldAppendPunctuation(citation.name),
    shouldAppendPunctuation(journal),
    shouldAppendPunctuation(year),
    shouldAppendPunctuation(pmid),
    shouldAppendPunctuation(doi),
  ].filter(str => !!str);

  if (asMarkdown) {
    return citation_strings.join(' ');
  }
  return citation_strings.join(' ');
};

// Format DOI if url is included in string.
export const formatDOI = (doi: FormattedResource['doi']) => {
  if (!doi) {
    return null;
  }
  if (doi.includes('https://doi.org/')) {
    return doi?.split('https://doi.org/')[1];
  } else if (doi.includes('doi.org/')) {
    return doi?.split('doi.org/')[1];
  }
  return doi;
};

// Format number with thousands separator
export const formatNumber = (number: number, separator: string = ',') => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

// Retrieve img and name for license url.
export const formatLicense = (license: string) => {
  const formattedLicense = {
    type: '',
    title: '',
    img: '',
    url: '',
  };

  if (license.includes('http')) {
    formattedLicense.url = license;
    if (license.includes('by/4.0/')) {
      formattedLicense.type = 'Attribution';
      formattedLicense.title = 'Attribution 4.0 International (CC BY 4.0)';
      formattedLicense.img = '/assets/copyright/by.png';
    } else if (license.includes('by-sa/4.0/')) {
      formattedLicense.type = 'Attribution-ShareAlike';
      formattedLicense.title =
        'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)';
      formattedLicense.img = '/assets/copyright/by-sa.png';
    } else if (license.includes('by-nd/4.0/')) {
      formattedLicense.type = 'Attribution-NoDerivs';
      formattedLicense.title =
        'Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)';
      formattedLicense.img = '/assets/copyright/by-nd.png';
    } else if (license.includes('by-nc/4.0/')) {
      formattedLicense.type = 'Attribution-NonCommercial';
      formattedLicense.title =
        'Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)';
      formattedLicense.img = '/assets/copyright/by-nc.png';
    } else if (license.includes('by-nc-sa/4.0/')) {
      formattedLicense.type = 'Attribution-NonCommercial-ShareAlike';
      formattedLicense.title =
        'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)';
      formattedLicense.img = '/assets/copyright/by-nc-sa.png';
    } else if (license.includes('by-nc-nd/4.0/')) {
      formattedLicense.type = 'Attribution-NonCommercial-NoDerivs';
      formattedLicense.title =
        'Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)';
      formattedLicense.img = '/assets/copyright/by-nc-nd.png';
    } else if (
      license.includes('zero/1.0/') ||
      license.includes('/public-domain/cc0/')
    ) {
      formattedLicense.type = 'Public Domain';
      formattedLicense.title =
        'CC0 1.0 Universal (CC0 1.0) Public Domain Dedication';
      formattedLicense.img = '/assets/copyright/by-p.png';
    } else if (license.includes('immport')) {
      formattedLicense.type = 'Immport';
      formattedLicense.title =
        'User Agreement for the NIAID Immunology Database and Analysis Portal (ImmPort)';
      formattedLicense.img = '/assets/resources/immport.png';
    } else {
      formattedLicense.title = license;
      formattedLicense.url = license;
      formattedLicense.type = license;
    }
  } else {
    formattedLicense.title = license;
    formattedLicense.type = license;
  }
  return formattedLicense;
};

export const formatJournal = (citation: Citation) => {
  let name = '';
  if (citation.journalName) {
    name = citation.journalName;
  } else if (citation.journalNameAbbrev) {
    name = citation.journalNameAbbrev;
  }

  const { volumeNumber, issueNumber, pagination } = citation;

  // Remove commas, periods.
  const formatStr = (str: string) => str.replace(/[,.]/g, '');

  return `${formatStr(name)}${
    volumeNumber ? `, ${formatStr(volumeNumber)}` : ''
  }${issueNumber ? `(${formatStr(issueNumber)})` : ''}${
    pagination ? `: ${pagination}` : ''
  }`;
};
