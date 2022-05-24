import {
  Creator,
  Citation,
  Distribution,
  FormattedResource,
  ResourceType,
  Funder,
} from './types';

interface APICreator {
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

// Format the creator field
export const formatCreator = (
  creatorData?: APICreator | APICreator[],
): Creator[] | null => {
  if (!creatorData) {
    return null;
  }

  const getCreatorFields = (data: APICreator) => {
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

  if (Array.isArray(creatorData)) {
    return creatorData.map(data => getCreatorFields(data));
  } else {
    return [getCreatorFields(creatorData)];
  }
};

interface APICitation {
  url?: string;
  name?: string;
  author?: Creator[] | null;
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
  } else {
    return 'Other';
  }
};

export const formatAPIResource = (data: any) => {
  const formattedResource: FormattedResource = {
    ...data,
    id: data._id,
    type: data['@type'] ? formatType(data['@type']) : null,
    name: data.name || null,
    author: formatCreator(data.author) || formatCreator(data.creator),
    citation: formatCitation(data.citation),
    citedBy: data.citedBy || null,
    codeRepository: data.codeRepository || null,
    condition: data.condition || null,
    conditionsOfAccess: data.conditionsOfAccess || null,
    date: data.date || null,
    dateCreated: data.dateCreated || null,
    dateModified: data.dateModified || null,
    datePublished: data.datePublished || null,
    description: data.description || null,
    disease: data.disease || null,
    distribution: formatDistribution(data.distribution),
    doi: data['doi'] || data['@id'] || null,
    funding: formatFunding(data.funding),
    healthCondition: data.healthCondition || null,
    includedInDataCatalog: data.includedInDataCatalog
      ? {
          name: data.includedInDataCatalog.name || null,
          url: data.includedInDataCatalog.url || null,
          versionDate: data.includedInDataCatalog.versionDate || null,
          image: data.image || null,
          identifier: data.includedInDataCatalog.identifier || null,
        }
      : null,
    infectiousAgent: data.infectiousAgent
      ? Array.isArray(data.infectiousAgent)
        ? data.infectiousAgent
        : [data.infectiousAgent]
      : null,
    infectiousDisease: data.infectiousDisease
      ? Array.isArray(data.infectiousDisease)
        ? data.infectiousDisease
        : [data.infectiousDisease]
      : null,
    keywords: data.keywords
      ? Array.isArray(data.keywords)
        ? data.keywords
        : [data.keywords]
      : null,
    language: data.inLanguage
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
    measurementTechnique: data.measurementTechnique
      ? Array.isArray(data.measurementTechnique)
        ? data.measurementTechnique
        : [data.measurementTechnique]
      : null,
    nctid: data['nctid'] || null,
    numberOfDownloads: data.numberOfDownloads || null,
    numberOfViews: data.numberOfViews || null,
    pmid: data['pmid'] || null,
    publisher: data.publisher || null,
    rawData: data,
    sameAs: data.sameAs || null,
    spatialCoverage:
      typeof data.spatialCoverage === 'string' ? data.spatialCoverage : null,
    species: data.species
      ? Array.isArray(data.species)
        ? data.species
        : [data.species]
      : null,
    temporalCoverage:
      typeof data.temporalCoverage === 'string' ? data.spatialCoverage : null,
    // Maybe add species or organism field to topic
    topic: data.topicCategory
      ? Array.isArray(data.topicCategory)
        ? data.topicCategory
        : [data.topicCategory]
      : null,
    url: data.url || null,
    variableMeasured:
      data.variableMeasured && data.variableMeasured.toLowerCase() !== 'unknown'
        ? Array.isArray(data.variableMeasured)
          ? data.variableMeasured
          : [data.variableMeasured]
        : null,
    version: data.version || null,
  };
  return formattedResource;
};
