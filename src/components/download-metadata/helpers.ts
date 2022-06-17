export const downloadAsCsv = (
  dataObject: { [key: string]: any },
  downloadName: string,
) => {
  // if no data return an empty object
  if (!dataObject || typeof dataObject !== 'object') {
    return {};
  }
  const data = Array.isArray(dataObject) ? dataObject : [dataObject];

  // Get all unique table headers in data
  const headers: string[] = data.reduce((r, d) => {
    Object.keys(d).map(k => {
      if (!r.includes(k)) {
        r.push(k);
      }
    });
    return r;
  }, []);

  // replacer value for null/empty properties
  const replacer = (_: string, value: any) => (value === null ? '' : value); // specify how you want to handle null values here

  const csv = [
    headers.join(','), // header row first
    ...data.map(row =>
      headers
        .map((fieldName, i) => {
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

  return { href, download: `${downloadName}.csv` };
};

export const downloadAsJson = (
  dataObject: { [key: string]: any },
  downloadName: string,
) => {
  // if no data return an empty object
  if (!dataObject || typeof dataObject !== 'object') {
    return {};
  }
  // add for array.
  let href =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(dataObject, null, 2));
  return { href, download: `${downloadName}.json` };
};
