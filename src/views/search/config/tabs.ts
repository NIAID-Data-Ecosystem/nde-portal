import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { TabType } from '../types';

// Tab labels
export const TAB_LABELS = {
  DATASET: formatAPIResourceTypeForDisplay('Dataset'),
  RESOURCE_CATALOG: formatAPIResourceTypeForDisplay('ResourceCatalog'),
  COMPUTATIONAL_TOOL: formatAPIResourceTypeForDisplay('ComputationalTool'),
  DISEASE_OVERVIEW: 'Disease Overview',
  OTHER_RESOURCES: 'Other Resources',
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
        label: `${TAB_LABELS.COMPUTATIONAL_TOOL}s`,
        type: 'ComputationalTool',
      },
    ],
  },
];

// Helper to check if a type is part of the "Other Resources" group
export const isOtherResourceType = (type: string): boolean => {
  return type === 'ResourceCatalog' || type === 'Disease';
};

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
