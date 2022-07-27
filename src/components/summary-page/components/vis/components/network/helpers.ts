import * as d3 from 'd3';
import { parameters } from './components/chart';

// Round the number to the nearest tenth
export const roundCount = (c: number) => {
  if (c <= 5) {
    return 1;
  } else {
    return Math.ceil(c / 10) * 10;
  }
};

// Returns an alphanumeric class name.
export const formatClassName = (str: string) =>
  'c-' + str.replace(/[\W_]+/g, '');

export const highlightNodes = (selector: string) => {
  // Dim all the nodes except the currently selector node.
  d3.selectAll(`.node`).style('opacity', parameters.opacity.low);
  d3.selectAll(selector).style('opacity', parameters.opacity.full);
};
