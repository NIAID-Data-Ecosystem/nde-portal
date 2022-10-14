import { FilterTerm } from '../../types';

export const aggregateDatesByYear = (dates: FilterTerm[]) => {
  // Aggregate data by year.
  let aggregatedData = Object.values(
    dates.reduce((r, v) => {
      const year = v.term === '-_exists_' ? v.term : v.term.split('-')[0];
      if (!r[year]) {
        r[year] = { term: year, displayAs: year, count: 0 };
      }
      r[year]['count'] += v.count;
      return r;
    }, {} as { [key: string]: FilterTerm }),
  );

  // Sort dates chronologically.
  const arr = aggregatedData.sort((a, b) => {
    return a.term < b.term ? -1 : a.term > b.term ? 1 : 0;
  });

  //  Add in missing years (with a count of 0)
  arr.forEach(({ term }, i) => {
    if (i < arr.length - 1 && +arr[i + 1].term - +term > 1) {
      const year = +term + 1;
      arr.splice(i + 1, 0, {
        term: `${year}`,
        displayAs: `${year}`,
        count: 0,
      });
    }
  });

  return arr;
};
