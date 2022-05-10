import {formatType} from 'src/utils/api/helpers';

// Filters + sorts all the filter terms that belong to a certain filter.
export const filterFilterList = (
  terms: {
    count?: number;
    term: string;
  }[],
  filterText: string,
  size: number,
) => {
  if (!terms) {
    return {items: [], hasMore: false};
  }
  let searchText = filterText.toLowerCase();
  let filteredTerms = terms
    .filter(t => t.term.toLowerCase().includes(searchText))
    .slice(0, size)
    .sort((a, b) => {
      let a_count = a?.count || 0;
      let b_count = b?.count || 0;
      return b_count - a_count;
    });

  return {items: filteredTerms, hasMore: terms.length > size};
};

// Format the type of resource so that the query term is recognizable by the api.
export const formatTypeForAPI = (types: string[]) => {
  return types.map(type => {
    let t = type.toLowerCase().replace(/ /g, '');
    if (t === 'dataset') {
      return 'Dataset';
    } else if (t === 'computationaltool') {
      return 'ComputationalTool';
    } else {
      return type;
    }
  });
};

// Convert filters object to string for url routing + api call.
export const queryFilterObject2String = (selectedFilters: any) => {
  // create querystring for filters where values are provided.
  let filterString = Object.keys(selectedFilters)
    .filter(filterName => selectedFilters[filterName].length > 0)
    .map(filterName => {
      let values = `("${formatTypeForAPI(selectedFilters[filterName]).join(
        '" OR "',
      )}")`;
      return `${filterName}:${values}`;
    })
    .join(' AND ');
  return filterString ? filterString : null;
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

    if (name === '@type') {
      value = value.map(v => formatType(v));
    }

    r[name] = value;
    return r;
  }, {});
  return queryObject;
};
