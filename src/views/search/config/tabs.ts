import { formatResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { TabType } from '../types';

// is determined by the order of this array
export const tabs: TabType[] = [
  {
    id: 'd',
    types: [
      {
        label: formatResourceTypeForDisplay('ResourceCatalog') + 's',
        type: 'ResourceCatalog',
      },
      {
        label: formatResourceTypeForDisplay('Dataset') + 's',
        type: 'Dataset',
      },
    ],
    isDefault: true,
  },
  {
    id: 'ct',
    types: [
      {
        label: formatResourceTypeForDisplay('ComputationalTool') + 's',
        type: 'ComputationalTool',
      },
    ],
  },
];
