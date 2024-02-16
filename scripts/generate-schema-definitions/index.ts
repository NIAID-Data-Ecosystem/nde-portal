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
}

// Array of supported resource types.
export const RESOURCE_TYPES = Object.values(ResourceType);

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
    return matchedFields;
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
