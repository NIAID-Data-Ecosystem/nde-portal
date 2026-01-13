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

// Generate an accordion title for the "Resource Catalog" group
export const generateResourceCatalogTitle = (
  sections: Array<{ type: string; count: number }>,
): string => {
  const resourceCatalog = sections.find(s => s.type === 'ResourceCatalog');
  const resourceCount = resourceCatalog?.count || 0;

  return `${TAB_LABELS.RESOURCE_CATALOG}s (${resourceCount.toLocaleString()})`;
};
