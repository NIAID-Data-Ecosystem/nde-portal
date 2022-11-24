const fs = require('fs');
const axios = require('axios');
const { getPropertyTitle } = require('./helpers.js');

// Fetch schema information from biothings API
const fetchSchema = async () => {
  try {
    /*
    Fetch schema property definitions
    This has: includedInDataCatalog, variableMeasured, measurementTechnique
    https://discovery.biothings.io/api/registry/schema/schema:Dataset

    This has: infectiousAgent, healthCondition, funding, species, measurementTechnique in validation
    https://discovery.biothings.io/api/registry/niaid/niaid:Dataset

    This has: infectiousAgent, healthCondition, funding, species
    https://discovery.biothings.io/api/registry/niaid/niaid:ComputationalTool

    This has comments about what computational tool and has almost all things except variableMeasured and includedInDataCatalog
    https://discovery.biothings.io/api/registry/niaid
  */
    // const schemaData = await axios
    //   .get(`https://discovery.biothings.io/api/registry/schema/schema:Dataset`)
    //   .then(response => {
    //     return [
    //       { label: response.data.label, properties: response.data.properties },
    //     ];
    //   });

    const niaidData = await axios
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
    // Format data.

    let MetadataNames = fs.readFileSync('configs/metadata-standard-names.json');
    let items = [];
    try {
      let parsed = JSON.parse(MetadataNames);
      items = parsed;
    } catch (err) {
      if (err) {
        items = [];
      }
    }
    const data = [...niaidData].reduce((r, d) => {
      const type = d.label;
      const addProperty = data => {
        if (!r[data.label]) {
          r[data.label] = {
            title: getPropertyTitle(data.label, items),
            property: data.label,
          };
        }
        // Metadata description.
        if (data.description) {
          if (!r[data.label]['description']) {
            r[data.label].description = {};
          }
          r[data.label]['description'][type.toLowerCase()] = data.description;
        }
        // Metadata short description.
        if (data.abstract) {
          if (!r[data.label]['abstract']) {
            r[data.label].abstract = {};
          }
          r[data.label]['abstract'][type.toLowerCase()] = data.abstract;
        }
        // Metadata type.
        if (data.type) {
          if (!r[data.label]['type']) {
            r[data.label].type = data.type;
          }
        }
        if (data.format) {
          if (!r[data.label]['format']) {
            r[data.label].format = data.format;
          }
        }
        // Metadata sub properties descriptions.
        if (data.oneOf) {
          data.oneOf.map(o => {
            if (!o.items || (!o.items && !r[data.label]['type'])) {
              r[data.label]['type'] = o.type;
              r[data.label]['enum'] = o.enum;
              return;
            }

            r[data.label]['type'] = o.items.type;
            if (!o.items.properties) return;

            Object.entries(o.items.properties).map(([property, item]) => {
              if (!r[data.label]['items']) {
                r[data.label]['items'] = {};
              }

              if (!r[data.label]['items'][property]) {
                r[data.label]['items'][property] = {
                  title: getPropertyTitle(`${data.label}.${property}`, items),
                  description: item.description,
                  property: property,
                  type: item.type || item.oneOf[0].type,
                  format: item.format,
                  enum: item.enum,
                };
              }
            });
          });
        }
      };

      addProperty(d);
      if (d.properties) {
        d.properties.map(property => {
          addProperty(property);
        });
      }
      if (d?.validation?.properties) {
        Object.entries(d.validation.properties).map(([label, obj]) => {
          addProperty({ ...obj, label });
        });
      }
      return r;
    }, {});

    return Object.values(data);
  } catch (err) {
    throw err;
  }
};

fetchSchema().then(data => {
  let rawdata = fs.readFileSync('configs/resource-metadata.json');
  let properties = [];
  try {
    let prevData = JSON.parse(rawdata);
    properties = prevData;
  } catch (err) {
    // JSON file is empty.
    if (err) {
      properties = [];
    }
  }

  // Update current metadata json with fetched properties if new.
  const updatedProperties = [...properties];
  data.map(d => {
    const matchIndex = properties.findIndex(
      field => field.property.toLowerCase() === d.property.toLowerCase(),
    );

    if (matchIndex >= 0) {
      if (!updatedProperties[matchIndex].description) {
        updatedProperties[matchIndex].description = d.description;
      }
    } else {
      updatedProperties.push(d);
    }
  });

  // Write update to json
  fs.writeFile(
    './configs/resource-metadata.json',
    JSON.stringify(updatedProperties),
    err => {
      if (err) {
        console.error('error writing to file.');
      }
    },
  );
});
