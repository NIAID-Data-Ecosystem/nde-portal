import { scaleOrdinal } from '@visx/scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { DataProps, RawDataProps } from './types';
import NIAID_FUNDED from 'configs/niaid-sources.json';

export const formatPieChartData = (data: RawDataProps[]) => {
  const MIN_COUNT = 10000;

  const formatted = data.reduce((r, d, i) => {
    const NIAIDrepos = NIAID_FUNDED.niaid.repositories as { id: string }[];
    const isNIAIDSource =
      NIAIDrepos.filter(({ id }) => id === d.term).length > 0;
    if (isNIAIDSource) {
      if (!r['Other']) {
        r['Other'] = {
          count: 0,
          term: 'NIAID funded',
          data: [],
        };
      }
      r['Other'].count += d.count;
      r['Other'].data?.push(d);
    }
    // if the data has records that are less than the minimum count (MIN_COUNT) we group them together to make a larger slice of pie
    else if (d.count < MIN_COUNT) {
      if (!r['Other']) {
        r['Other'] = { count: 0, term: 'Other', data: [] };
      }
      r['Other'].count += d.count;
      r['Other'].data?.push(d);
    } else {
      r[d.term] = d;
    }

    return r;
  }, {} as { [key: string]: DataProps });

  return Object.values(formatted).sort((a, b) => b.count - a.count);
};

// colors for pie chart
export const colorScale = (data: DataProps[]) =>
  scaleOrdinal({
    domain: data.map(d => d.term),
    // @ts-ignore
    range: schemeTableau10,
  });

// accessor function for pie slice values
export const getCount = (d: DataProps) => d.count;
