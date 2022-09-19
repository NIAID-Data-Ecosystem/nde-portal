export interface DownloadArgs {
  dataObject: { [key: string]: any } | { [key: string]: any }[];
  downloadName: string;
}

// Retrieve column headers from data.
export const getColumnHeaders = (data: DownloadArgs['dataObject']) => {
  const headers: string[] = data.reduce(
    (r: string[], d: { [key: string]: any }) => {
      Object.keys(d).map(k => {
        // Remove ElasticSearch columns
        if (k !== '_id' && k.charAt(0) === '_') return;

        if (!r.includes(k)) {
          r.push(k);
        }
      });
      return r;
    },
    [],
  );
  return headers;
};

export const downloadAsCsv = (
  dataObject: DownloadArgs['dataObject'],
  downloadName: DownloadArgs['downloadName'],
) => {
  // if no data return an empty object
  if (!dataObject || typeof dataObject !== 'object') {
    return {};
  }
  const data = Array.isArray(dataObject) ? dataObject : [dataObject];
  const headers = getColumnHeaders(data);

  // replacer value for null/empty properties
  const replacer = (_: string, value: any) => (value === null ? '' : value); // specify how you want to handle null values here

  const csv = [
    headers.join(','), // header row firstq
    ...data.map(row =>
      headers
        .map(fieldName => {
          let v = row[fieldName];
          let fieldValue = JSON.stringify(v, replacer);

          // if field contains a quote we need to escape it to ensure that it is not split into another cell.
          if (fieldValue?.includes(',')) {
            // wrap in quotes to keep in cell.
            return `"${fieldValue.replace(
              /"/g,
              // to escape quotes in excel, replace with 2 double quotes.
              '""',
            )}"`;
          }

          return fieldValue;
        })
        .join(','),
    ),
  ].join('\r\n');

  let href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv);
  if (!href || !downloadName) {
    return null;
  }
  return { href, download: `${downloadName}.csv` };
};

export const downloadAsJson = (
  dataObject: DownloadArgs['dataObject'],
  downloadName: DownloadArgs['downloadName'],
) => {
  // if no data return an empty object
  if (!dataObject || typeof dataObject !== 'object') {
    return {};
  }

  // remove unwanted properties from object.
  const headers = getColumnHeaders(dataObject);
  dataObject.map((datum: { [key: string]: any }) => {
    Object.keys(datum).map(k => {
      if (!headers.includes(k)) {
        delete datum[k];
      }
    });
  });

  // add for array.
  let href =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(dataObject, null, 2));
  if (!href || !downloadName) {
    return null;
  }
  return { href, download: `${downloadName}.json` };
};
