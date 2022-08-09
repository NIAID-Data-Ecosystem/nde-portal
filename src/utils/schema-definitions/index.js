const fs = require('fs');
const axios = require('axios');
const fields = require('../../../configs/resource-metadata.json');

// Fetch schema information from biothings API
const fetchSchema = async () => {
  try {
    /*
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
      .then(d => d.data.properties);

    const niaidData = await axios
      .get(`https://discovery.biothings.io/api/registry/niaid`)
      .then(d => {
        // Filter data with needed types.
        return d.data.hits.filter(
          h => h.label === 'ComputationalTool' || h.label === 'Dataset',
        );
      });

    const data = [...schemaData, ...niaidData].reduce((r, d) => {
      const addProp = data => {
        if (!r[data.label]) {
          r[data.label] = {
            title: '',
            property: '',
            description: '',
          };
        }
        r[data.label] = { property: data.label, description: data.description };
      };

      addProp(d);
      if (d.properties) {
        d.properties.map(property => {
          addProp(property);
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
  // Update current metadata json with fetched fields if new.
  const updatedFields = [...fields];
  data.map(d => {
    const matchIndex = fields.findIndex(
      field => field.property.toLowerCase() === d.property.toLowerCase(),
    );

    if (matchIndex >= 0) {
      if (!updatedFields[matchIndex].description) {
        updatedFields[matchIndex].description = d.description;
      }
    } else {
      updatedFields.push(d);
    }
  });

  // Write update to json
  fs.writeFile(
    './configs/resource-metadata.json',
    JSON.stringify(updatedFields),
    err => {
      if (err) {
        console.error('error writing to file.');
      }
    },
  );
});
