import {
  Author,
  Citation,
  Distribution,
  FormattedResource,
  AccessTypes,
} from './types';

interface APIAuthor {
  identifier?: string; // orcid id
  '@type'?: string;
  affiliation?: { name: string; sameAs?: string };
  email?: string;
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
      email: data['email'] || null,
    };
  };

  if (Array.isArray(authorData)) {
    return authorData.map(data => getAuthorFields(data));
  } else {
    return [getAuthorFields(authorData)];
  }
};

export interface APICitation {
  url?: string;
  name?: string;
  citation?: string;
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
      citation: data?.citation || null,
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

// Format distribution fields.
interface APIDistribution {
  '@id'?: string | null;
  '@type'?: string;
  encodingFormat?: string | null;
  contentSize?: number | null;
  contentUrl?: string | null;
  dateCreated?: string | null;
  dateModified?: string | null;
  datePublished?: string | null;
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
      ...data,
      encodingFormat: data.encodingFormat || null,
      contentUrl: data.contentUrl || null,
      contentSize: data.contentSize || null,
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

// Convert ISO date to format YYYY-MM-DD
export const formatISOString = (date: string) => {
  return date.substring(0, 10);
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
    /*
     Group "closed" and "restricted" access types as "controlled".
     https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/59
    */
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
    name: data.name || null,
    aggregateRating: data.aggregateRating || null,
    applicationCategory: convertToArray(data.applicationCategory),
    applicationSubCategory: convertToArray(data.applicationSubCategory),
    applicationSuite: convertToArray(data.applicationSuite),
    availableOnDevice: data.availableOnDevice || null,
    author: formatAuthor(data.author),
    citation: formatCitation(data.citation),
    citedBy: convertToArray(data.citedBy) || null,
    codeRepository: data.codeRepository || null,
    collectionSize: convertToArray(data.collectionSize) || null,
    condition: data.condition || null,
    conditionsOfAccess:
      formatConditionsOfAccess(data.conditionsOfAccess) || null,
    curatedBy: data.curatedBy || null,
    date: formatDate(data.date) || null,
    dateCreated: formatDate(data.dateCreated) || null,
    dateModified: formatDate(data.dateModified) || null,
    datePublished: formatDate(data.datePublished) || null,
    description: Array.isArray(data.description)
      ? data.description.join(' ')
      : data.description || null,
    discussionUrl: convertToArray(data.discussionUrl),
    disease: data.disease || null,
    distribution: formatDistribution(data.distribution),
    doi: data['doi'] || data['@id'] || null,
    downloadUrl: convertToArray(data.downloadUrl),
    funding: convertToArray(data.funding),
    hasPart: convertToArray(data.hasPart),
    healthCondition: convertToArray(data.healthCondition),
    includedInDataCatalog: data.includedInDataCatalog ?? null,
    infectiousAgent: convertToArray(data.infectiousAgent),
    input: convertToArray(data.input),

    interactionStatistics: data.interactionStatistics || null,
    isAccessibleForFree: data.isAccessibleForFree || null,
    isBasedOn: convertToArray(data.isBasedOn),
    isBasisFor: convertToArray(data.isBasisFor),
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
    output: convertToArray(data.output),
    processorRequirements: convertToArray(data.processorRequirements),
    programmingLanguage: convertToArray(data.programmingLanguage),
    publisher: data.publisher || null,
    sameAs: data.sameAs || null,
    sdPublisher: convertToArray(data.sdPublisher),
    softwareAddOn: convertToArray(data.softwareAddOn),
    softwareHelp: convertToArray(data.softwareHelp),
    softwareRequirements: convertToArray(data.softwareRequirements),
    softwareVersion: convertToArray(data.softwareVersion),
    spatialCoverage: convertToArray(data.spatialCoverage),
    species: convertToArray(data.species),
    temporalCoverage: convertToArray(data.temporalCoverage) || null,
    topicCategory: convertToArray(data.topicCategory),
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
