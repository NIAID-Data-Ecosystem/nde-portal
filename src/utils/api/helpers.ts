import { formatConditionsOfAccess } from '../formatting/formatConditionsOfAccess';
import {
  APIAuthor,
  APICitation,
  APIDistribution,
  APIResource,
  Author,
  Citation,
  Distribution,
  FormattedResource,
  OneOrMany,
} from './types';

// Treats null, undefined and '' as missing. Unlike `|| null`, this keeps
// meaningful falsy values such as `false` and `0`.
const orNull = <T>(value: T | null | undefined): T | null =>
  value == null || value === '' ? null : value;

// Standardizes value to be an array.
const convertToArray = <T>(
  value: OneOrMany<T> | null | undefined,
): T[] | null => {
  const present = orNull(value);
  if (present === null) {
    return null;
  }
  return Array.isArray(present) ? present : [present];
};

// Format the author field
export const formatAuthor = (
  authorData?: OneOrMany<APIAuthor> | null,
): Author[] | null => {
  const getAuthorFields = (data: APIAuthor): Author => ({
    identifier: orNull(data.identifier),
    type: orNull(data['@type']),
    name: orNull(data.name),
    affiliation: orNull(data.affiliation),
    familyName: orNull(data.familyName),
    givenName: orNull(data.givenName),
    role: orNull(data.role),
    title: orNull(data.title),
    url: orNull(data.url),
    email: orNull(data.email),
  });

  return convertToArray(authorData)?.map(getAuthorFields) ?? null;
};

// Format the citation field
export const formatCitation = (
  citationData?: OneOrMany<APICitation> | null,
): Citation[] | null => {
  const getCitationFields = (data?: APICitation): Citation => ({
    abstract: orNull(data?.abstract),
    author: orNull(data?.author),
    citation: orNull(data?.citation),
    datePublished: orNull(data?.datePublished),
    description: orNull(data?.description),
    doi: orNull(data?.doi),
    id: orNull(data?.identifier),
    issueNumber: orNull(data?.issueNumber),
    journalName: orNull(data?.journalName),
    journalNameAbbrev: orNull(data?.journalNameAbbrev),
    name: orNull(data?.name),
    pagination: orNull(data?.pagination),
    pmcid: orNull(data?.pmcid),
    pmid: orNull(data?.pmid),
    url: orNull(data?.url),
    volumeNumber: orNull(data?.volumeNumber),
  });

  return convertToArray(citationData)?.map(getCitationFields) ?? null;
};

// Format distribution fields.
export const formatDistribution = (
  distributionData?: OneOrMany<APIDistribution> | string | null,
): Distribution[] | null => {
  const getDistributionFields = (data: APIDistribution): Distribution => ({
    ...data,
    encodingFormat: orNull(data.encodingFormat),
    contentUrl: orNull(data.contentUrl),
    contentSize: orNull(data.contentSize),
    dateCreated: orNull(data.dateCreated),
    dateModified: orNull(data.dateModified),
    datePublished: orNull(data.datePublished),
    description: orNull(data.description),
    name: orNull(data.name),
    '@id': orNull(data['@id']),
  });

  const distribution = orNull(distributionData);
  if (typeof distribution === 'string') {
    return [getDistributionFields({ contentUrl: distribution })];
  }
  return convertToArray(distribution)?.map(getDistributionFields) ?? null;
};

// Convert ISO date to format YYYY-MM-DD
export const formatISOString = (date: string) => {
  return date.substring(0, 10);
};

// Format Date object to string  YYYY-MM-DD
export const formatDate = (date?: string | Date | null) => {
  if (!date) {
    return null;
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  // Keep calendar dates stable across environments (SSR/client) by preferring
  // the explicit YYYY-MM-DD portion over local timezone date parsing.
  const isoDateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString().split('T')[0];
};

// The API sends inLanguage as either a bare name or an object.
const formatInLanguage = (
  inLanguage: APIResource['inLanguage'],
): FormattedResource['inLanguage'] => {
  const language = orNull(inLanguage);
  if (language === null) {
    return null;
  }
  if (typeof language === 'string') {
    return { alternateName: null, name: language };
  }
  return {
    alternateName: orNull(language.alternateName),
    name: orNull(language.name),
  };
};

export const formatAPIResource = (
  data?: APIResource | null,
): FormattedResource | undefined => {
  if (!data) {
    return undefined;
  }
  // FormattedResource types some fields as always present (about, hasAPI, ...)
  // or non-null (name, includedInDataCatalog), which the API doesn't
  // guarantee, so the result can't be checked against it directly.
  return {
    ...data,
    id: data._id,
    name: orNull(data.name),
    aggregateRating: orNull(data.aggregateRating),
    applicationCategory: convertToArray(data.applicationCategory),
    applicationSubCategory: convertToArray(data.applicationSubCategory),
    applicationSuite: convertToArray(data.applicationSuite),
    availableOnDevice: orNull(data.availableOnDevice),
    author: formatAuthor(data.author),
    citation: formatCitation(data.citation),
    citedBy: convertToArray(data.citedBy),
    codeRepository: orNull(data.codeRepository),
    collectionSize: convertToArray(data.collectionSize),
    condition: orNull(data.condition),
    conditionsOfAccess: formatConditionsOfAccess(data.conditionsOfAccess),
    date: formatDate(data.date),
    dateCreated: formatDate(data.dateCreated),
    dateModified: formatDate(data.dateModified),
    datePublished: formatDate(data.datePublished),
    description: orNull(
      Array.isArray(data.description)
        ? data.description.join(' ')
        : data.description,
    ),
    discussionUrl: convertToArray(data.discussionUrl),
    disease: orNull(data.disease),
    distribution: formatDistribution(data.distribution),
    doi: orNull(data.doi) ?? orNull(data['@id']),
    downloadUrl: convertToArray(data.downloadUrl),
    funding: convertToArray(data.funding),
    genre: orNull(data.genre),
    hasPart: convertToArray(data.hasPart),
    healthCondition: convertToArray(data.healthCondition),
    includedInDataCatalog: orNull(data.includedInDataCatalog),
    infectiousAgent: convertToArray(data.infectiousAgent),
    input: convertToArray(data.input),
    interactionStatistics: orNull(data.interactionStatistics),
    isAccessibleForFree: orNull(data.isAccessibleForFree),
    isBasedOn: convertToArray(data.isBasedOn),
    isBasisFor: convertToArray(data.isBasisFor),
    isPartOf: convertToArray(data.isPartOf),
    isRelatedTo: convertToArray(data.isRelatedTo),
    keywords: convertToArray(data.keywords),
    inLanguage: formatInLanguage(data.inLanguage),
    license: orNull(data.license),
    mainEntityOfPage: orNull(data.mainEntityOfPage),
    measurementTechnique: convertToArray(data.measurementTechnique),
    nctid: orNull(data.nctid),
    output: convertToArray(data.output),
    processorRequirements: convertToArray(data.processorRequirements),
    programmingLanguage: convertToArray(data.programmingLanguage),
    publisher: orNull(data.publisher),
    sameAs: orNull(data.sameAs),
    sdPublisher: convertToArray(data.sdPublisher),
    softwareAddOn: convertToArray(data.softwareAddOn),
    softwareHelp: convertToArray(data.softwareHelp),
    softwareRequirements: convertToArray(data.softwareRequirements),
    softwareVersion: convertToArray(data.softwareVersion),
    sourceOrganization: convertToArray(data.sourceOrganization),
    spatialCoverage: convertToArray(data.spatialCoverage),
    species: convertToArray(data.species),
    temporalCoverage: convertToArray(data.temporalCoverage),
    topicCategory: convertToArray(data.topicCategory),
    url: orNull(data.url),
    usageInfo: orNull(data.usageInfo),
    variableMeasured: convertToArray(data.variableMeasured),
    version: orNull(data.version),
  } as FormattedResource;
};
