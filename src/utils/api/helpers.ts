import { formatConditionsOfAccess } from '../formatting/formatConditionsOfAccess';
import { Author, Citation, Distribution, FormattedResource } from './types';

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
  abstract?: string | null;
  author?: Author[] | null;
  citation?: string | null;
  datePublished?: string | null;
  description?: string | null;
  doi?: string | null;
  identifier?: string | null;
  issueNumber?: string | null;
  journalName?: string | null;
  journalNameAbbrev?: string | null;
  name?: string | null;
  pagination?: string | null;
  pmcid?: string | null;
  pmid?: string | null;
  url?: string | null;
  volumeNumber?: string | null;
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
      abstract: data?.abstract || null,
      author: data?.author || null,
      citation: data?.citation || null,
      datePublished: data?.datePublished || null,
      description: data?.description || null,
      doi: data?.doi || null,
      id: data?.identifier || null,
      issueNumber: data?.issueNumber || null,
      journalName: data?.journalName || null,
      journalNameAbbrev: data?.journalNameAbbrev || null,
      name: data?.name || null,
      pagination: data?.pagination || null,
      pmcid: data?.pmcid || null,
      pmid: data?.pmid || null,
      url: data?.url || null,
      volumeNumber: data?.volumeNumber || null,
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
    genre: data.genre || null,
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
    sourceOrganization: convertToArray(data.sourceOrganization),
    spatialCoverage: convertToArray(data.spatialCoverage),
    species: convertToArray(data.species),
    temporalCoverage: convertToArray(data.temporalCoverage) || null,
    topicCategory: convertToArray(data.topicCategory),
    url: data.url || null,
    usageInfo: data.usageInfo || null,
    variableMeasured: convertToArray(data.variableMeasured) || null,
    version: data.version || null,
  };
  return formattedResource;
};
