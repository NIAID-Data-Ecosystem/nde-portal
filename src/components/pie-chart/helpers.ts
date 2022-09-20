import { scaleOrdinal } from '@visx/scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { DataProps, RawDataProps } from './types';

export const formatPieChartData = (data: RawDataProps[]) => {
  const MIN_COUNT = 10000;

  const formatted = data.reduce((r, d, i) => {
    // if the data has records that are less than the minimum count (MIN_COUNT) we group them together to make a larger slice of pie
    if (d.count < MIN_COUNT) {
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
