import { FormattedResource } from './api/types';

export const getFundedByNIAID = (name: string) => {
  if (!name) {
    return false;
  }
  const FUNDED_REPOS = [
    'AccessClinicalData@NIAID',
    'ClinEpiDB',
    'ImmPort',
    'MicrobiomeDB',
    'VDJServer',
    'VEuPathDB',
  ];
  return FUNDED_REPOS.includes(name);
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
    formattedLicense.title = 'License';
  } else {
    formattedLicense.title = license;
  }

  // Get image for license
  if (license.includes('by/4.0/') || license.includes('CC-BY')) {
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
  } else if (license.includes('dataverse.harvard')) {
    formattedLicense.type = 'Harvard Dataverse';
    formattedLicense.title = 'Harvard Dataverse Terms of Use';
    formattedLicense.img = '/assets/resources/dataverse-icon.png';
  } else {
    formattedLicense.title = license || 'License';
    formattedLicense.type = license;
  }

  return formattedLicense;
};
