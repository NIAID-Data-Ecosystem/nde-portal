// Format display title for property.
const getPropertyTitle = (str, data) => {
  let property = str;
  const standardized_item =
    data && data.find(item => item.property === property);
  if (standardized_item) {
    property = standardized_item.name;
  } else if (str === 'url') {
    property = 'URL';
  } else if (str.toLowerCase() === 'sdpublisher') {
    property = 'Source publisher';
  } else if (str.toLowerCase() === 'issn') {
    property = 'ISSN';
  } else if (str.toLowerCase() === 'includedindatacatalog') {
    property = 'Source';
  } else if (str.toLowerCase() === 'infectiousagent') {
    property = 'Pathogen';
  } else if (str.toLowerCase() === 'spatialcoverage') {
    property = 'Geographical Information';
  } else if (str.toLowerCase() === 'temporalcoverage') {
    property = 'Period';
  } else {
    // basic formatting for handling most property labels, split on camelCase and uppercase the first letter in each word.
    property = str
      .split(/(?=[A-Z])/)
      .map(
        word => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase(),
      )
      .join(' ');
  }

  return property;
};

module.exports = {
  getPropertyTitle,
};
