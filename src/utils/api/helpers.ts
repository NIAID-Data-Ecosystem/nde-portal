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
  author?: {name?: string};
  journalName?: string;
  identifier?: string;
  date?: string;
  pmid?: string;
}

// Format the citation field
export const formatCitation = (
  citationData?: APICitation | APICitation[],
): Citation[] | null => {
  if (!citationData) {
    return null;
  }

  const getCitationFields = (data: APICitation) => {
    return {
      id: data.identifier || 'citationId',
      url: data.url || 'citationUrl',
      name: data.name || 'citationName',
      author: data?.author?.name
        ? {name: data?.author?.name}
        : {name: 'citationAuthor'},
      journalName: data.journalName || 'citationJournalName',
      date: data.date || 'citationDatePublished',
      pmid: data.pmid || 'citationPMID',
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
  } | null;
  identifier?: string | null;
  description?: string | null;
  url?: string | null;
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
        ? {name: data.funder.name || null, role: data.funder.role || null}
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
  dateCreated?: Date | null;
  dateModified?: Date | null;
  datePublished?: Date | null;
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
    doi: data['@id'] || null,
    type: formatType(data['@type']),
    name: data.name || 'null',
    appearsIn: formatCitation(data.citation),
    citation: formatCitation(data.citation),
    codeRepository: data.codeRepository || null,
    conditionsOfAccess: data.conditionsOfAccess || null,
    creator: formatCreator(data.creator),
    curatedBy: data.curatedBy
      ? {
          name: data.curatedBy.name || null,
          url: data.curatedBy.url || null,
          versionDate: data.curatedBy.versionDate || null,
          image: data.image || null,
          identifier: data.curatedBy.identifier || null,
        }
      : null,
    dateCreated: data.dateCreated || null,
    dateModified: data.dateModified || null,
    datePublished: data.datePublished || null,
    description: data.description || null,
    distribution: formatDistribution(data.distribution),
    funding: formatFunding(data.funding),
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
    sameAs: data.sameAs || null,
    spatialCoverage:
      typeof data.spatialCoverage === 'string' ? data.spatialCoverage : null,
    temporalCoverage:
      typeof data.temporalCoverage === 'string' ? data.spatialCoverage : null,
    topic: data.topic
      ? Array.isArray(data.topic)
        ? data.topic
        : [data.topic]
      : null,
    url: data.url || null, //link to dataset on the repo
    variableMeasured: data.variableMeasured
      ? Array.isArray(data.variableMeasured)
        ? data.variableMeasured
        : [data.variableMeasured]
      : null,
    version: data.version || null,
    numberOfViews: data.numberOfViews || null,
  };
  return formattedResource;
};
