import { formatResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';
import { TabType } from '../types';

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
