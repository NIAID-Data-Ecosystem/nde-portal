import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { TabType } from '../types';

// is determined by the order of this array
export const tabs: TabType[] = [
  {
    id: 'd',
    types: [
      {
        label: formatAPIResourceTypeForDisplay('ResourceCatalog') + 's',
        type: 'ResourceCatalog',
      },
      {
        label: formatAPIResourceTypeForDisplay('Dataset') + 's',
        type: 'Dataset',
      },
      {
        label: 'Disease Overviews',
        type: 'Disease',
      },
    ],
    isDefault: true,
  },
  {
    id: 'ct',
    types: [
      {
        label: formatAPIResourceTypeForDisplay('ComputationalTool') + 's',
        type: 'ComputationalTool',
      },
    ],
  },
];
