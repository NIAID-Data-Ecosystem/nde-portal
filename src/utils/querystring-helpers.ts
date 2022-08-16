/*
Escape elastic search reserved characters.
https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_reserved_characters
str.replace(/([\-\=\!\*\+\&\|\(\)\[\]\{\}\^\~\?\:\/])/g, '\\$1'),
*/
export const encodeString = (str: string) => {
  return str.replace(/([\|\(\)\[\]\:\/])/g, '\\$1');
};
