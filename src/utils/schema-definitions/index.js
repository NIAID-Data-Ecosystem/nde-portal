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
    const schemaData = await axios
      .get(`https://discovery.biothings.io/api/registry/schema/schema:Dataset`)
      .then(response => {
        return [
          { label: response.data.label, properties: response.data.properties },
        ];
      });

    const niaidData = await axios
      .get(`https://discovery.biothings.io/api/registry/niaid`)
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
    const data = [...schemaData, ...niaidData].reduce((r, d) => {
      const type = d.label;
      const addProperty = data => {
        if (!r[data.label]) {
          r[data.label] = {
            title: getPropertyTitle(data.label),
            property: data.label,
            description: {},
          };
        }
        r[data.label]['description'][type.toLowerCase()] = data.description;
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
