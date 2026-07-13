import {
  APIResourceType,
  formatAPIResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { TabType } from '../types';

// Tab labels
export const TAB_LABELS = {
  DATASET: formatAPIResourceTypeForDisplay('Dataset'),
  RESOURCE_CATALOG: formatAPIResourceTypeForDisplay('ResourceCatalog'),
  COMPUTATIONAL_TOOL: formatAPIResourceTypeForDisplay('ComputationalTool'),
  DISEASE_OVERVIEW: 'Disease Overview',
  OTHER_RESOURCES: 'Other Resources',
  SAMPLE: 'Sample',
  DATA_COLLECTION: 'Data Collection',
} as const;

// Tab configuration
export const tabs: TabType[] = [
  {
    id: 'd',
    types: [
      {
        label: `${TAB_LABELS.RESOURCE_CATALOG}s`,
        type: 'ResourceCatalog',
      },
      {
        label: `${TAB_LABELS.DATASET}s`,
        type: 'Dataset',
      },
      {
        label: `${TAB_LABELS.DISEASE_OVERVIEW}s`,
        type: 'Disease',
      },
    ],
    isDefault: true,
  },
  {
    id: 'ct',
    types: [
      {
        label: 'Tools',
        accordionLabel: `${TAB_LABELS.COMPUTATIONAL_TOOL}s`,
        type: 'ComputationalTool',
      },
    ],
  },
  {
    id: 's',
    types: [
      {
        label: `${TAB_LABELS.SAMPLE}s`,
        accordionLabel: 'Samples and Specimens',
        type: 'Sample',
      },
    ],
  },
  {
    id: 'dc',
    types: [
      {
        label: `${TAB_LABELS.DATA_COLLECTION}s`,
        type: 'DataCollection',
      },
    ],
  },
];

// Generate an accordion title for the "Other Resources" group
export const generateOtherResourcesTitle = (
  sections: Array<{ type: string; count: number }>,
): string => {
  const resourceCatalog = sections.find(s => s.type === 'ResourceCatalog');
  const disease = sections.find(s => s.type === 'Disease');

  const resourceCount = resourceCatalog?.count || 0;
  const diseaseCount = disease?.count || 0;
  const totalCount = resourceCount + diseaseCount;

  // If there are no diseases, show only Resource Catalogs
  if (diseaseCount === 0) {
    return `${
      TAB_LABELS.RESOURCE_CATALOG
    }s (${resourceCount.toLocaleString()})`;
  }

  // If there are diseases, show the full "Other Resources" breakdown
  const resourcePart = `${
    TAB_LABELS.RESOURCE_CATALOG
  }s (${resourceCount.toLocaleString()})`;
  const diseasePart = `${
    TAB_LABELS.DISEASE_OVERVIEW
  }s (${diseaseCount.toLocaleString()})`;

  return `${
    TAB_LABELS.OTHER_RESOURCES
  } (${totalCount.toLocaleString()}): ${resourcePart}, ${diseasePart}`;
};

/**
 * Get the tab ID from a type label
 * @param type - The label of the type (e.g., 'Dataset', 'ComputationalTool')
 * @returns The tab ID if found, otherwise undefined
 */
export const getTabIdFromResourceType = (
  type: APIResourceType,
): TabType['id'] | undefined => {
  return (
    tabs.find(tab => tab.types.some(tabType => tabType.type === type))?.id ||
    undefined
  );
};
