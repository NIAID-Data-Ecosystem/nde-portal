import fs from 'fs';
import {
  fetchFieldCounts,
  fetchFieldsFromMapping,
} from './fetch-fields-from-mapping';
import { fetchFieldDetails } from './fetch-fields-from-schema';
import { mergeMappingAndSchemaFields } from './merge-mapping-and-schema-fields';

// Define the path where the output will be saved.
const OUTPUT_PATH = './configs/schema-definitions.json';

// Types of data to be fetched from the NDE API. Note that 'ComputationalTool' is omitted pending NIAID approval.
export enum ResourceType {
  Dataset,
  ResourceCatalog,
  ComputationalTool,
}

// Array of supported resource types.
export const RESOURCE_TYPES = Object.values(ResourceType);

const getCustomFields = () => {
  // Hardcoded additional custom fields
  // [type]: A general type definition
  const type = {
    name: 'Type',
    dotfield: 'type',
    property: 'type',
    count: 0,
    type: 'text',
    description: {
      Dataset:
        'Type is used to categorize the nature or genre of the content of the resource.',
      ResourceCatalog:
        'Type is used to categorize the nature or genre of the content of the resource.',
    },
    abstract: {
      Dataset:
        'Type is used to categorize the nature or genre of the content of the resource.',
      ResourceCatalog:
        'Type is used to categorize the nature or genre of the content of the resource.',
    },
    isAdvancedSearchField: false,
  };

  // [domain]: "generalist"/"iid" domain definition from NCIT
  const domain = {
    name: 'Domain',
    dotfield: 'domain',
    property: 'domain',
    count: 0,
    type: 'text',
    description: {
      Dataset: 'An area of knowledge or field(s) of study.',
      ResourceCatalog: 'An area of knowledge or field(s) of study.',
    },
    abstract: {
      Dataset: 'An area of knowledge or field(s) of study.',
      ResourceCatalog: 'An area of knowledge or field(s) of study.',
    },
    isAdvancedSearchField: false,
  };
  return { type, domain };
};

const generateSchemaDefinitions = async () => {
  try {
    console.log('Updating schema definitions + counts...');

    // Fetch fields from NDE API.
    const fieldsInMapping = await fetchFieldsFromMapping();

    // Retrieve counts for each field using the NDE API.
    const fieldsInMappingWithCounts = await fetchFieldCounts(fieldsInMapping);

    //  Retrieve names, types, abstract and definitions for each field using Biothings NDE schema.
    const fieldsDetailsFromSchema = await fetchFieldDetails();

    // Match and merge the field details from the NDE schema and the mapping.
    const matchedFields = mergeMappingAndSchemaFields(
      fieldsInMappingWithCounts,
      fieldsDetailsFromSchema,
    );

    const additionalFields = getCustomFields();

    return { ...matchedFields, ...additionalFields };
  } catch (error: any) {
    console.error('Error generating schema definitions:', error.message);
    throw error;
  }
};

// Function to generate schema definitions and then process the data
generateSchemaDefinitions()
  .then(newSchemaData => {
    fs.writeFile(OUTPUT_PATH, JSON.stringify(newSchemaData, null, 2), error => {
      if (error) {
        console.error('Error writing to file:', error.message);
      } else {
        console.log('Schema definitions updated successfully.');
      }
    });
  })
  .catch(error => {
    // Handle errors from the entire schema generation process
    console.error('Failed to update schema definitions:', error.message);
  });
