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
    // Format data.
    let MetadataNamesJSON = fs.readFileSync(
      'configs/metadata-standard-names.json',
    );
    let metadataNamesData = [];
    try {
      let parsed = JSON.parse(MetadataNamesJSON);
      metadataNamesData = parsed;
    } catch (err) {
      if (err) {
        metadataNamesData = [];
      }
    }
    const data = [...ndeSchema].reduce((r, schemaData) => {
      const resource_type = schemaData.label;
      // Add property details to JSON
      const addProperty = (data, dataObj) => {
        const property = data.label;
        if (!dataObj[property]) {
          dataObj[property] = {
            title: getPropertyTitle(
              data.dotfield || property,
              metadataNamesData,
            ),
            property: property,
            dotfield: data.dotfield || property,
          };
        }
        // Metadata description.
        if (data.description) {
          if (!dataObj[property]['description']) {
            dataObj[property].description = {};
          }
          dataObj[property]['description'][resource_type.toLowerCase()] =
            data.description;
        }
        // Metadata short description.
        if (data.abstract) {
          if (!dataObj[property]['abstract']) {
            dataObj[property].abstract = {};
          }
          dataObj[property]['abstract'][resource_type.toLowerCase()] =
            data.abstract;
        }
        // Metadata type.
        if (data.type) {
          if (!dataObj[property]['type']) {
            dataObj[property].type = data.type;
          }
        }
        // Metadata format includes enum, etc.
        if (data.format) {
          if (!dataObj[property]['format']) {
            dataObj[property].format = data.format;
          }
        }

        // Metadata sub properties descriptions.
        if (data.oneOf) {
          const handleNested = data =>
            data.map(o => {
              if (!o.items || (!o.items && !r[property]['type'])) {
                dataObj[property]['type'] = o.type;
                dataObj[property]['enum'] = o.enum;
                return;
              }
              dataObj[property]['type'] = o.items.type;
              if (o.items.properties) {
                Object.entries(o.items.properties).map(
                  ([childProperty, item]) => {
                    if (!dataObj[property].items) {
                      dataObj[property]['items'] = {};
                    }
                    addProperty(
                      {
                        ...item,
                        label: childProperty,
                        dotfield: `${property}.${childProperty}`,
                      },
                      dataObj[property]['items'],
                    );
                  },
                );
              }
            });

          handleNested(data.oneOf);
          return dataObj;
        }
      };

      addProperty(schemaData, r);

      if (schemaData?.validation?.properties) {
        Object.entries(schemaData.validation.properties).map(([label, obj]) => {
          addProperty({ ...obj, label }, r);
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

// UPDATE footer
const fetchRepositoryInfo = async () => {
  // Fetch source information from github
  try {
    const owner = 'NIAID-Data-Ecosystem';
    const repo = 'nde-portal';
    const branch = process.env.GITHUB_BRANCH;
    const url = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`;
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.data;
    return { data };
  } catch (err) {
    return {
      data: [],
      error: {
        type: 'error',
        status: err.response.status,
        message: err.response.statusText,
      },
    };
  }
};

fetchRepositoryInfo().then(response => {
  const file_path = './configs/footer.json';
  let rawdata = fs.readFileSync(file_path);
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
  // Write update to json
  fs.writeFile(
    file_path,
    JSON.stringify({
      ...properties,
      lastUpdate: [
        {
          label:
            response &&
            response.data &&
            response.data.commit.commit.committer.date
              ? `Content updated: ${
                  response.data.commit.commit.committer.date.split('T')[0]
                }`
              : '',
          href: '/changelog/',
        },
      ],
    }),
    err => {
      if (err) {
        console.error('error writing to file.');
      }
    },
  );
});
