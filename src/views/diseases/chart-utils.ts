import { scaleOrdinal } from '@visx/scale';
import { schemeObservable10 } from 'd3-scale-chromatic';

// Color scale for data types.
export const getFillColor = scaleOrdinal({
  domain: [
    'Dataset',
    'ComputationalTool',
    'ResourceCatalog',
    'Sample',
    'DataCollection',
  ],
  range: schemeObservable10 as string[],
});
