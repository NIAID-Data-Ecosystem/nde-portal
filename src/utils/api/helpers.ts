import {
  Author,
  Citation,
  Distribution,
  FormattedResource,
  ResourceType,
  Funder,
  AccessTypes,
} from './types';

interface APIAuthor {
  identifier?: string; // orcid id
  '@type'?: string;
  affiliation?: { name: string };
  name?: string;
  familyName?: string;
  givenName?: string;
  role?: string;
  title?: string;
  url?: string;
}

// Format the author field
export const formatAuthor = (
  authorData?: APIAuthor | APIAuthor[],
): Author[] | null => {
  if (!authorData) {
    return null;
  }

  const getAuthorFields = (data: APIAuthor) => {
    return {
      identifier: data['identifier'] || null,
      type: data['@type'] || null,
      name: data['name'] || null,
      affiliation: data['affiliation'] || null,
      familyName: data['familyName'] || null,
      givenName: data['givenName'] || null,
      role: data['role'] || null,
      title: data['title'] || null,
      url: data['url'] || null,
    };
  };

  if (Array.isArray(authorData)) {
    return authorData.map(data => getAuthorFields(data));
  } else {
    return [getAuthorFields(authorData)];
  }
};

interface APICitation {
  url?: string;
  name?: string;
  author?: Author[] | null;
  journalName?: string;
  journalNameAbbrev?: string;
  identifier?: string;
  date?: string;
  datePublished?: string;
  pmid?: string;
  doi?: string;
  issueNumber?: string;
  volumeNumber?: string;
  pagination?: string;
}

// Format the citation field
export const formatCitation = (
  citationData?: APICitation | APICitation[],
): Citation[] | null => {
  if (!citationData) {
    return null;
  }
  const getCitationFields = (data?: APICitation) => {
    return {
      id: data?.identifier || null,
      url: data?.url || null,
      name: data?.name || null,
      author: data?.author || null,
      journalName: data?.journalName || null,
      journalNameAbbrev: data?.journalNameAbbrev || null,
      date: data?.date || null,
      datePublished: data?.datePublished || null,
      pmid: data?.pmid || null,
      doi: data?.doi || null,
      issueNumber: data?.issueNumber || null,
      volumeNumber: data?.volumeNumber || null,
      pagination: data?.pagination || null,
    };
  };

  if (Array.isArray(citationData)) {
    return citationData.map(data => getCitationFields(data));
  } else {
    return [getCitationFields(citationData)];
  }
};

// Format funding fields.
interface APIFunding {
  '@type'?: string;
  funder?: Funder;
  identifier?: string | null;
  description?: string | null;
  url?: string | null;
}

export const formatFunding = (fundingData?: APIFunding | APIFunding[]) => {
  if (!fundingData) {
    return null;
  }

  const getFundingFields = (data: APIFunding) => {
    return {
      funder: data.funder
        ? {
            name: data.funder.name || null,
            role: data.funder.role || null,
            alternateName: data.funder.alternateName || null,
            description: data.funder.description || null,
            parentOrganization: data.funder.parentOrganization || null,
            url: data.funder.url || null,
          }
        : null,
      identifier: data.identifier || null,
      description: data.description || null,
      url: data.url || null,
    };
  };

  if (Array.isArray(fundingData)) {
    return fundingData.map(data => getFundingFields(data));
  } else {
    return [getFundingFields(fundingData)];
  }
};

// Format distribution fields.
interface APIDistribution {
  '@id'?: string | null;
  '@type'?: string;
  encodingFormat?: string | null;
  contentUrl?: string | null;
  dateCreated?: Date | string | null;
  dateModified?: Date | string | null;
  datePublished?: Date | string | null;
  description?: string | null;
  name?: string | null;
}

export const formatDistribution = (
  distributionData?: APIDistribution | APIDistribution[],
): Distribution[] | null => {
  if (!distributionData) {
    return null;
  }

  const getDistributionFields = (data: APIDistribution) => {
    return {
      encodingFormat: data.encodingFormat || null,
      contentUrl: data.contentUrl || null,
      dateCreated: data.dateCreated || null,
      dateModified: data.dateModified || null,
      datePublished: data.datePublished || null,
      description: data.description || null,
      name: data.name || null,
      '@id': data['@id'] || null,
    };
  };

  if (typeof distributionData === 'string') {
    return [
      getDistributionFields({
        contentUrl: distributionData,
      }),
    ];
  } else if (Array.isArray(distributionData)) {
    return distributionData.map(data => getDistributionFields(data));
  } else {
    return [getDistributionFields(distributionData)];
  }
};

// Format the "type" of resource for display purposes.
export const formatType = (type: string): ResourceType => {
  if (type.toLowerCase() === 'dataset') {
    return 'Dataset';
  } else if (type.toLowerCase() === 'computationaltool') {
    return 'Computational Tool';
  } else if (type.toLowerCase() === 'scholarlyarticle') {
    return 'Scholarly Article';
  } else {
    return 'Other';
  }
};

// Format Date object to string  YYYY-MM-DD
export const formatDate = (date?: string | Date) => {
  if (!date) {
    return null;
  }
  // @ts-ignore
  return new Date(date.replace(/-/g, '/').replace(/T.+/, ''))
    .toISOString()
    .split('T')[0];

  // If the desired format is: Aug 03 2020. Change to:
  // return new Date(date.replace(/-/g, '/').replace(/T.+/, ''))
  //   .toDateString()
  //   .split(' ')
  //   .slice(1)
  //   .join(' ');
};

// Standardizes value to be an array.
const convertToArray = (property: any) => {
  return property ? (Array.isArray(property) ? property : [property]) : null;
};

/*
 Stardized conditions of access value. Feedback provided by NIAID proposes "controlled" access instead of "closed" or "restricted".
 See issue #59 for more information.
*/
type APIAccessTypes = 'Open' | 'Closed' | 'Embargoed' | 'Restricted';

const formatConditionsOfAccess = (
  access: APIAccessTypes,
): AccessTypes | null => {
  if (!access || access === undefined) {
    return null;
  } else if (
    access === 'Closed' ||
    access.toLowerCase().includes('closed') ||
    access.toLowerCase().includes('restricted')
  ) {
    return 'Controlled';
  } else {
    return access;
  }
};

export const formatAPIResource = (data: any) => {
  if (!data) {
    return undefined;
  }
  const formattedResource: FormattedResource = {
    ...data,
    id: data._id || null,
    type: data['@type'] ? formatType(data['@type']) : null,
    name: data.name || null,
    applicationCategory: convertToArray(data.applicationCategory),
    applicationSubCategory: convertToArray(data.applicationSubCategory),
    applicationSuite: convertToArray(data.applicationSuite),
    author: formatAuthor(data.author),
    citation: formatCitation(data.citation),
    citedBy: data.citedBy || null,
    codeRepository: data.codeRepository || null,
    condition: data.condition || null,
    conditionsOfAccess:
      formatConditionsOfAccess(data.conditionsOfAccess) || null,
    date: formatDate(data.date) || null,
    dateCreated: formatDate(data.dateCreated) || null,
    dateModified: formatDate(data.dateModified) || null,
    datePublished: formatDate(data.datePublished) || null,
    description: Array.isArray(data.description)
      ? data.description.join(' ')
      : data.description || null,
    disease: data.disease || null,
    distribution: formatDistribution(data.distribution),
    doi: data['doi'] || data['@id'] || null,
    funding: formatFunding(data.funding),
    hasPart: convertToArray(data.hasPart),
    healthCondition: convertToArray(data.healthCondition),
    includedInDataCatalog: data.includedInDataCatalog
      ? {
          name: data.includedInDataCatalog.name || null,
          url: data.includedInDataCatalog.url || null,
          versionDate: data.includedInDataCatalog.versionDate || null,
          image: data.image || null,
          identifier: data.includedInDataCatalog.identifier || null,
        }
      : null,
    infectiousAgent: convertToArray(data.infectiousAgent),
    isBasedOn: convertToArray(data.isBasedOn),
    isPartOf: convertToArray(data.isPartOf),
    isRelatedTo: convertToArray(data.isRelatedTo),
    keywords: convertToArray(data.keywords),
    inLanguage: data.inLanguage
      ? {
          alternateName: data.inLanguage.alternateName || null,
          name:
            typeof data.inLanguage === 'string'
              ? data.inLanguage
              : data.inLanguage.name,
        }
      : null,
    license: data.license || null,
    mainEntityOfPage: data.mainEntityOfPage || null,
    measurementTechnique: convertToArray(data.measurementTechnique),
    nctid: data['nctid'] || null,
    programmingLanguage: convertToArray(data.programmingLanguage),
    publisher: data.publisher || null,
    rawData: data,
    sameAs: data.sameAs || null,
    sdPublisher: convertToArray(data.sdPublisher),
    softwareVersion: convertToArray(data.softwareVersion),
    spatialCoverage: convertToArray(data.spatialCoverage),
    species: convertToArray(data.species),
    temporalCoverage: data.temporalCoverage || null,
    // Maybe add species or organism field to topic
    topic: convertToArray(data.topicCategory),
    url: data.url || null,
    usageInfo: data.usageInfo || null,
    variableMeasured:
      typeof data.variableMeasured === 'string' &&
      data.variableMeasured.toLowerCase() === 'unknown'
        ? null
        : convertToArray(data.variableMeasured),
    version: data.version || null,
  };
  return formattedResource;
};
