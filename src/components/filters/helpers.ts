import { NextRouter } from 'next/router';
import { formatDate, formatType } from 'src/utils/api/helpers';

// Given a query object, update the route to reflect the change.
export const updateRoute = (update: {}, router: NextRouter) => {
  return router.push(
    {
      query: {
        ...router.query,
        ...update,
      },
    },
    undefined,
    {
      shallow: true,
      scroll: true,
    },
  );
};

// Convert filters object to string for url routing + api call.
export const queryFilterObject2String = (selectedFilters: any) => {
  // create querystring for filters where values are provided.
  let filterString = Object.keys(selectedFilters)
    .filter(filterName => selectedFilters[filterName].length > 0)
    .map(filterName => {
      // Retrieve string filter values
      const filter_strings = selectedFilters[filterName].filter(
        (v: any) => typeof v === 'string' && v !== '',
      );
      // Retrieve object filter values (notably used when checking for dataset where facet is not represented i.e.{-_exists_: [facet]} )
      const filter_objects = selectedFilters[filterName].filter(
        (v: any) => typeof v === 'object',
      );

      let values = '';
      if (filter_strings.length > 0 && filterName === '@type') {
        // check if filter string exists and format the @type value if needed.
        values = `("${formatTypeForAPI(filter_strings).join('" OR "')}")`;
      } else if (filter_strings.length > 0 && filterName === 'date') {
        // if type is date we join with "TO"
        values = `["${filter_strings.join('" TO "')}"]`;
      } else if (filter_strings.length > 0) {
        values = `("${filter_strings.join('" OR "')}")`;
      } else {
        values = '';
      }

      // handle case where filters is an object such as when {-_exists_: keywords}
      if (filter_objects.length > 0) {
        filter_objects.map((obj: Record<string, any>) => {
          if (!values) {
            values = `${queryFilterObject2String(obj)}`;
          } else {
            values += ' OR ' + `${queryFilterObject2String(obj)}`;
          }
        });
      }
      return `(${filterName}:${values})`;
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
    let filter_string = filter;
    if (
      filter_string.charAt(0) === '(' &&
      filter_string.charAt(filter_string.length - 1) === ')'
    ) {
      filter_string = filter_string.slice(1, filter_string.length - 1);
    }

    // split on first occurence of ":" to retrieve [key, value] pair
    let filterKeyValue = filter_string.split(/:(.*)/s);
    let name = filterKeyValue[0].replaceAll('("', '').replaceAll('")', '');

    let value = filterKeyValue[1]
      .replace('("', '')
      .replace('")', '')
      .replace('["', '')
      .replace('"]', '')
      .split(/(?:" OR ")| OR |(?:" TO ")| TO /)
      .map(v => {
        // Handle exists filter
        if (v.includes('_exists_')) {
          return queryFilterString2Object(v);
        }
        return v;
      });

    // if (name === '@type') {
    //   value = value.map(v => formatType(v));
    // }

    r[name] = value;
    return r;
  }, {});
  return queryObject;
};

/////////////////////////////////////////////////////
/////// Format Terms (for display purposes) /////////
/////////////////////////////////////////////////////

// Format the dataset type(if changed for display) to the @type accepted in the API.
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
