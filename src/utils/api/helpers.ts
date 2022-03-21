import {
  Creator,
  Citation,
  Distribution,
  FormattedResource,
  Funding,
  ResourceType,
} from './types';

interface APICreator {
  '@id'?: string; // orcid id
  '@type'?: string;
  affiliation?: {name: string};
  name?: string;
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
      id: data['@id'] || null,
      type: data['@type'] || null,
      name: data['name'] || null,
      affiliation: data['affiliation'] || null,
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
  identifier?: string;
  date?: string;
  datePublished?: string;
  pmid?: string;
  doi?: string;
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
      author: data?.author || null,
      datePublished: data?.datePublished || null,
      date: data?.date || null,
      journalName: data?.journalName || null,
      name: data?.name || null,
      pmid: data?.pmid || null,
      url: data?.url || null,
      doi: data?.doi || null,
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
  funder?: {
    name?: string | null;
    role?: string | null;
    alternateName?: string | string[] | null;
    description?: string | null;
    parentOrganization?: string | null;
    url?: string | null;
  } | null;
  identifier?: string | null;
}

export const formatFunding = (
  fundingData?: APIFunding | APIFunding[],
): Funding[] | null => {
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

// Format the type of resource.
export const formatType = (type: string | null): ResourceType | null => {
  if (!type) {
    return null;
  } else if (type.toLowerCase() === 'dataset') {
    return 'dataset';
  } else if (type.toLowerCase() === 'softwaresourcecode') {
    return 'computational tool';
  } else {
    return 'other';
  }
};

export const formatAPIResource = (data: any) => {
  const formattedResource: FormattedResource = {
    id: data._id,
    type: formatType(data['@type']),
    name: data.name || 'null',
    author: formatCreator(data.author) || formatCreator(data.creator),
    citation: formatCitation(data.citation),
    citedBy: data.citedBy || null,
    codeRepository: data.codeRepository || null,
    condition: data.condition || null,
    conditionsOfAccess: data.conditionsOfAccess || null,
    curatedBy: data.curatedBy
      ? {
          name: data.curatedBy.name || null,
          url: data.curatedBy.url || null,
          versionDate: data.curatedBy.versionDate || null,
          image: data.image || null,
          identifier: data.curatedBy.identifier || null,
        }
      : null,
    date: data.date || null,
    dateCreated: data.dateCreated || null,
    dateModified: data.dateModified || null,
    datePublished: data.datePublished || null,
    description: data.description || null,
    disease: data.disease || null,
    distribution: formatDistribution(data.distribution),
    doi: data['doi'] || data['@id'] || null,
    funding: formatFunding(data.funding),
    includedInDataCatalog: data.includedInDataCatalog
      ? {
          name: data.includedInDataCatalog.name || null,
          url: data.includedInDataCatalog.url || null,
          versionDate: data.includedInDataCatalog.versionDate || null,
          image: data.image || null,
          identifier: data.includedInDataCatalog.identifier || null,
        }
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
    numberOfDownloads: data.numberOfDownloads || null,
    numberOfViews: data.numberOfViews || null,
    rawData: data,
    sameAs: data.sameAs || null,
    spatialCoverage:
      typeof data.spatialCoverage === 'string' ? data.spatialCoverage : null,
    species: data.species || null,
    temporalCoverage:
      typeof data.temporalCoverage === 'string' ? data.spatialCoverage : null,
    // Maybe add species or organism field to topic
    topic: data.topic
      ? Array.isArray(data.topic)
        ? data.topic
        : [data.topic]
      : null,
    url: data.url || null,
    variableMeasured: data.variableMeasured
      ? Array.isArray(data.variableMeasured)
        ? data.variableMeasured
        : [data.variableMeasured]
      : null,
    version: data.version || null,
  };
  return formattedResource;
};
