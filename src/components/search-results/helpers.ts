import {FacetTerm} from 'src/utils/api/types';

// Filters all the filter terms that belong to a certain filter.
export const filterFilterList = (
  terms: FacetTerm[],
  filterText: string,
  size: number,
) => {
  let searchText = filterText.toLowerCase();
  let filteredTerms = terms
    .filter(t => t.term.toLowerCase().includes(searchText))
    .slice(0, size);

  return {items: filteredTerms, hasMore: terms.length > size};
};

// Convert filters object to string for url routing + api call.
export const queryFilterObject2String = (selectedFilters: any) => {
  // create querystring for filters where values are provided.
  let querystring = Object.keys(selectedFilters)
    .filter(filterName => selectedFilters[filterName].length > 0)
    .map(filterName => {
      let values = `("${selectedFilters[filterName].join('" OR "')}")`;
      return `${filterName}:${values}`;
    })
    .join(' AND ');
  return querystring ? querystring : null;
};

// Convert filters url string to object for state management.
export const queryFilterString2Object = (str?: string | string[]) => {
  if (!str || Array.isArray(str)) {
    return null;
  }
  let filters = str.includes(' AND ') ? str.split(' AND ') : [str];
  let queryObject = filters.reduce((r: any, filter) => {
    let filterKeyValue = filter.split(':');
    let name = filterKeyValue[0].replaceAll('("', '').replaceAll('")', '');
    let value = filterKeyValue[1]
      .replace('("', '')
      .replace('")', '')
      .split('" OR "');
    r[name] = value;
    return r;
  }, {});
  return queryObject;
};
