import { FilterItem } from 'src/views/search-results-page/components/filters/types';

export const addMissingYears = (dates: FilterItem[]) => {
  //  Add in missing years (with a count of 0)
  dates
    .sort((a, b) => new Date(a.term).valueOf() - new Date(b.term).valueOf())
    .forEach(({ term }, i) => {
      if (term === '-_exists_' || dates[i + 1]?.term === '-_exists_') {
        return;
      }
      const year = term.split('-')[0];
      const nextYear =
        i < dates.length ? +dates[i + 1]?.term.split('-')[0] : null;

      // Check if the next value in the array is more than 1 year larger than the current value
      if (nextYear && +nextYear - +year > 1) {
        dates.splice(i + 1, 0, {
          count: 0,
          term: `${+year + 1}-01-01`,
          label: `${+year + 1}`,
        });
      }
    });

  return dates;
};
