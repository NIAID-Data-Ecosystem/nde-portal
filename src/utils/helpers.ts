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
    const formattedAuthor = author.name.replace(/[^a-zA-Z- ]/g, '');

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
  if (!doi) {
    return null;
  }
  if (doi.includes('https://doi.org/')) {
    return doi?.split('https://doi.org/')[1];
  }
  return doi;
};

// Format number with thousands separator
export const formatNumber = (number: number, separator: string = ',') => {
  return number
    .toString()
    .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, separator);
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
    } else if (license.includes('zero/1.0/')) {
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
