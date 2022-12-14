const fs = require('fs');
const axios = require('axios');
const { getPropertyTitle } = require('./helpers.js');

const filterFields = field => {
  return (
    !field.toLowerCase().includes('email') &&
    !field.toLowerCase().includes('url') &&
    !field.toLowerCase().includes('mainEntityOfPage') &&
    !(field.includes('@') && field !== '@type')
  );
};
// Fetch Fields info from metadata and retrieve counts for each field.
const fetchFields = async () => {
  try {
    const fieldsData = await axios
      .get('https://api-staging.data.niaid.nih.gov/v1/metadata/fields')
      .then(response => {
        return response.data;
      });

    const fields = Object.keys(fieldsData);
    let results = [];
    try {
      results = await Promise.all(
        fields.filter(filterFields).map(async property => {
          const response = await axios.get(
            `https://api-staging.data.niaid.nih.gov/v1/query?&q=_exists_:${property}`,
          );
          const count = response.data.total;

          return {
            name: getPropertyTitle(property),
            property,
            type: fieldsData[property]?.type || 'None',
            count,
          };
        }),
      );
    } catch (e) {
      // do something to handle the error here
      console.log(e);
    }
    return results.filter(f => f.type !== 'object' && f.count >= 100);
  } catch (err) {
    throw err;
  }
};

fetchFields().then(data => {
  // Write update to json
  fs.writeFile('./configs/resource-fields.json', JSON.stringify(data), err => {
    if (err) {
      console.error('error writing to file.');
    }
  });
});
