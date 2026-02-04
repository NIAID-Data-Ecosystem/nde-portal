import { FilterConfig, FacetTermWithDetails } from '../types';
import { buildQueries, buildSourceQueries } from '../utils/query-builders';
import { formatDate, formatISOString } from 'src/utils/api/helpers';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  createCommonQuery,
  createNotExistsQuery,
  structureQueryData,
} from '../utils/queries';

import {
  formatConditionsOfAccess,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';
import { getMetadataDescription } from 'src/components/metadata';

/**
 * Filter configuration array. Order matters here as the filters will be rendered in the same order.
 */
export const FILTER_CONFIGS: FilterConfig[] = [
  {
    _id: 'date',
    name: 'Date',
    property: 'date',
    isDefaultOpen: true,
    description: '',
    tabIds: ['d', 'ct'],
    createQueries: (id, params, options) => {
      // Destructure options to exclude queryKey and gather other options, with defaults
      const { queryKey = [], ...queryOptions } = options || {};
      return [
        createCommonQuery({
          id,
          queryKey,
          params: {
            ...params,
            hist: 'date',
            facets: '',
          },
          ...queryOptions,
          placeholderData: undefined,
          select: (data: FetchSearchResultsResponse) => {
            return {
              id,
              facet: 'date',
              results: structureQueryData(data),
            };
          },
        }),
        createNotExistsQuery({
          id,
          queryKey,
          params: { ...params, facets: 'date' },
          ...queryOptions,
        }),
      ];
    },

    transformData: (item): FacetTermWithDetails => {
      if (item.term.includes('_exists_')) {
        return { ...item, label: item.label || '' };
      }
      return {
        ...item,
        label: formatDate(item.term)?.split('-')[0] || item.term,
        term: formatISOString(item.term),
      };
    },
  },
  {
    _id: 'includedInDataCatalog',
    vizId: 'sources',
    name: 'Sources',
    property: 'includedInDataCatalog.name',
    tabIds: ['d', 'ct'],
    description: getMetadataDescription('includedInDataCatalog') || '',
    createQueries: buildSourceQueries(),
    groupBy: [
      {
        property: 'IID',
        label: 'IID Repositories',
      },
      {
        property: 'Generalist',
        label: 'Generalist Repositories',
      },
    ],
  },
  {
    _id: 'sourceOrganization.name',
    vizId: 'sourceOrganization.name',
    name: 'Program Collection',
    property: 'sourceOrganization.name',
    tabIds: ['d', 'ct'],
    description: getMetadataDescription('sourceOrganization') || '',
    createQueries: (id, params, options) => [
      createCommonQuery({
        id,
        queryKey: options?.queryKey || [],
        params: {
          ...params,
          facets: 'sourceOrganization.name.raw',
          // multi_terms_fields:
          //   'sourceOrganization.parentOrganization,sourceOrganization.name.raw',
          // multi_terms_size: '100',
        },
        ...options,
      }),
    ],
    // transformData: (item): FacetTermWithDetails => {
    //   let label = item.label || item.term;
    //   if (label.toLocaleLowerCase().includes('creid')) {
    //     label = label.replace(/creid/g, 'CREID');
    //   }
    //   if (label.toLocaleLowerCase().includes('niaid')) {
    //     label = label.replace(/niaid/g, 'NIAID');
    //   }
    //   return { ...item, label };
    // },
  },
  {
    _id: 'healthCondition.name.raw',
    vizId: 'healthCondition.name.raw',
    name: 'Health Condition',
    property: 'healthCondition.name.raw',
    tabIds: ['d'],
    description: getMetadataDescription('healthCondition') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'infectiousAgent.displayName.raw',
    vizId: 'infectiousAgent.name',
    name: 'Pathogen Species',
    property: 'infectiousAgent.displayName.raw',
    tabIds: ['d'],
    description: getMetadataDescription('infectiousAgent') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'species.displayName.raw',
    vizId: 'species.name',
    name: 'Host Species',
    property: 'species.displayName.raw',
    tabIds: ['d'],
    description: getMetadataDescription('species') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'funding.funder.name.raw',
    vizId: 'funding.funder.name.raw',
    name: 'Funding',
    property: 'funding.funder.name.raw',
    tabIds: ['d', 'ct'],
    description: getMetadataDescription('funding') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'conditionsOfAccess',
    vizId: 'conditionsOfAccess',
    name: 'Conditions of Access',
    property: 'conditionsOfAccess',
    tabIds: ['d', 'ct'],
    description: getMetadataDescription('conditionsOfAccess') || '',
    createQueries: buildQueries(),
    transformData: (item): FacetTermWithDetails => {
      let term = item.label || item.term;
      // Ignore any and non specified
      if (item.term.includes('_exists_')) {
        return { ...item, label: item.label || '' };
      }
      return {
        ...item,
        label:
          transformConditionsOfAccessLabel(formatConditionsOfAccess(term)) ||
          '',
      };
    },
  },
  {
    _id: 'variableMeasured.name.raw',
    vizId: 'variableMeasured.name.raw',
    name: 'Variable Measured',
    property: 'variableMeasured.name.raw',
    tabIds: ['d'],
    description: getMetadataDescription('variableMeasured') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'measurementTechnique.name.raw',
    vizId: 'measurementTechnique.name.raw',
    name: 'Measurement Technique',
    property: 'measurementTechnique.name.raw',
    tabIds: ['d'],
    description: getMetadataDescription('measurementTechnique') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'topicCategory.name.raw',
    vizId: 'topicCategory.name.raw',
    name: 'Topic Category',
    property: 'topicCategory.name.raw',
    tabIds: ['d', 'ct'],
    description: getMetadataDescription('topicCategory') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'applicationCategory.raw',
    vizId: 'applicationCategory.raw',
    name: 'Application Category',
    property: 'applicationCategory.raw',
    tabIds: ['ct'],
    description: getMetadataDescription('applicationCategory') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'operatingSystem.raw',
    vizId: 'operatingSystem.raw',
    name: 'Operating System',
    property: 'operatingSystem.raw',
    tabIds: ['ct'],
    description: getMetadataDescription('operatingSystem') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'programmingLanguage.raw',
    vizId: 'programmingLanguage.raw',
    name: 'Programming Language',
    property: 'programmingLanguage.raw',
    tabIds: ['ct'],
    description: getMetadataDescription('programmingLanguage') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'featureList.name.raw',
    vizId: 'featureList.name.raw',
    name: 'Feature List',
    property: 'featureList.name.raw',
    tabIds: ['ct'],
    description: getMetadataDescription('featureList') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'input.name.raw',
    vizId: 'input.name.raw',
    name: 'Input',
    property: 'input.name.raw',
    tabIds: ['ct'],
    description: getMetadataDescription('input') || '',
    createQueries: buildQueries(),
  },
  {
    _id: 'output.name.raw',
    vizId: 'output.name.raw',
    name: 'Output',
    property: 'output.name.raw',
    tabIds: ['ct'],
    description: getMetadataDescription('output') || '',
    createQueries: buildQueries(),
  },
];
