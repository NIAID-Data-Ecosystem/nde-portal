export const getQueryString = (str: string | string[] | undefined) => {
  let querystring = str;
  if (!str) {
    querystring = defaultQuery.q;
  } else {
    querystring = Array.isArray(str)
      ? `${str.map(s => s.trim()).join('+')}`
      : `${str.trim()}`;
  }
  return querystring;
};
