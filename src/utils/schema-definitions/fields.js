const fs = require('fs');
const axios = require('axios');
const { getPropertyTitle } = require('./helpers.js');

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
        fields.map(async property => {
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

    // Add more information to the fields from the schema (format, descriptions, abstract).
    const ndeSchema = await axios
      .get(`https://discovery.biothings.io/api/registry/nde`)
      .then(response => {
        // Filter data with needed types.
        return response.data.hits.filter(datum => {
          if (
            datum.label === 'ComputationalTool' ||
            datum.label === 'Dataset'
          ) {
            return datum.properties;
          }
        });
      });

    const data = [...ndeSchema].reduce((r, schemaData) => {
      // Dataset or ComputationalTool
      const resource_type = schemaData.label;
      const fieldIndex = results.findIndex(f => f.property === '@type');

      // Add enum field for type property.
      if (results[fieldIndex]) {
        results[fieldIndex]['format'] = 'enum';
        if (!results[fieldIndex]['enum']) {
          results[fieldIndex]['enum'] = [];
        }
        results[fieldIndex]['enum'].push(resource_type);
      }

      // Add property details to JSON
      const updateField = data => {
        const property = data.dotfield || data.label;
        const fieldIndex = results.findIndex(f => f.property === property);
        if (!results[fieldIndex]) {
          return;
        }

        // Add description.
        if (data.description) {
          if (!results[fieldIndex]?.description) {
            results[fieldIndex]['description'] = {};
          }
          results[fieldIndex]['description'][resource_type.toLowerCase()] =
            data.description;
        }
        // Add abstract (shorter description).
        if (data.abstract) {
          if (!results[fieldIndex]?.abstract) {
            results[fieldIndex]['abstract'] = {};
          }
          results[fieldIndex]['abstract'][resource_type.toLowerCase()] =
            data.abstract;
        }

        // Add data format (e.g. text, date)
        if (data.format) {
          results[fieldIndex]['format'] = data.format;
        }

        // Metadata sub properties descriptions.
        if (data.oneOf) {
          const handleNested = data =>
            data.map(o => {
              if (!o.items || (!o.items && !r[property]['type'])) {
                if (o.enum) {
                  results[fieldIndex]['format'] = 'enum';
                  results[fieldIndex]['enum'] = o.enum;
                }
                return;
              }
              if (o.items.properties) {
                Object.entries(o.items.properties).map(
                  ([childProperty, item]) => {
                    updateField({
                      ...item,
                      dotfield: `${property}.${childProperty}`,
                    });
                  },
                );
              }
            });

          handleNested(data.oneOf);
          return data;
        }
      };

      updateField(schemaData, r);

      if (schemaData?.validation?.properties) {
        Object.entries(schemaData.validation.properties).map(([label, obj]) => {
          updateField({ ...obj, label }, r);
        });
      }
      return r;
    }, {});
    return results;
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
