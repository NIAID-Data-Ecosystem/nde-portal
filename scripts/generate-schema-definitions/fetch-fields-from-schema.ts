import axios from 'axios';
import { RESOURCE_TYPES, ResourceType } from '.';

// Fetch details for each field from the DDE NDE schema.
interface SchemaResponseField {
  label: string;
  dotfield: string;
  description?: string;
  abstract?: string;
  type?: string;
  enum?: string[];
  format?: string;
  properties?: any[];
}
const SCHEMA_API_URL = 'https://discovery.biothings.io/api/registry/nde';
export const getDotfieldNotation = (
  field: Pick<SchemaResponseField, 'dotfield' | 'label'>,
) => {
  // Create a dynamic regular expression from the TYPES array
  // const typesRegex = new RegExp(`(${RESOURCE_TYPES.join('|')})`, 'g');

  const typesRegex = new RegExp(`(@type)`, 'g');

  // Replace occurrences of any type in TYPES from the dotfield
  const newDotfield = field.dotfield.replace(typesRegex, '');

  // Append the label with a dot prefix if newDotfield is not empty
  return `${newDotfield ? newDotfield + '.' : ''}${field.label}`;
};

// Transform a schema object into an array of SchemaResponseField objects.
export const getNestedSchemaProperties = (
  schemaObject: any,
): SchemaResponseField[] => {
  // Check if schemaObject is not empty before processing
  return Object.keys(schemaObject || {}).length > 0
    ? Object.keys(schemaObject).map(key => {
        const item = schemaObject[key];
        // Return a new SchemaResponseField object for each key
        return {
          ...item,
          label: key,
          dotfield: key,
          properties: item.items,
        };
      })
    : [];
};

// Define the structure for detailed schema field information.
export interface SchemaFieldDetails {
  [key: string]: {
    name: string;
    dotfield: string;
    description?: { [key: string]: string };
    abstract?: { [key: string]: string };
    enum?: string[];
    format?: string;
    schemaType?: string;
  };
}

export const fetchFieldDetails = async () => {
  try {
    const fields = {} as SchemaFieldDetails;
    // Recursive function to format field details.
    const formatFieldDetails = async (
      schemaField: SchemaResponseField,
      resourceType: ResourceType,
    ) => {
      const {
        abstract,
        description,
        dotfield,
        format,
        label,
        type,
        properties,
        ...rest
      } = schemaField;

      if (properties && properties.length > 0) {
        for (let i = 0; i < properties.length; i++) {
          const item = properties[i];

          const currentDotfield = getDotfieldNotation({
            dotfield,
            label: item.label,
          });

          let nestedProperties = [] as any[];
          let nestedEnum = item?.enum;
          if (item?.oneOf && Array.isArray(item?.oneOf)) {
            item?.oneOf.map((oneOfItem: any) => {
              if (oneOfItem?.items?.properties) {
                nestedProperties = [
                  ...nestedProperties,
                  ...getNestedSchemaProperties(oneOfItem?.items?.properties),
                ];
              }
              if (oneOfItem?.properties) {
                nestedProperties = [
                  ...nestedProperties,
                  ...getNestedSchemaProperties(oneOfItem?.properties),
                ];
              }
              if (oneOfItem?.items && !Array.isArray(oneOfItem?.items)) {
                nestedEnum = oneOfItem?.items.enum;
              }
            });
          }

          if (item?.anyOf && Array.isArray(item?.anyOf)) {
            item?.anyOf.map((anyOfItem: any) => {
              if (anyOfItem?.enum) {
                nestedEnum = anyOfItem.enum;
              }
              if (anyOfItem?.items?.properties) {
                nestedProperties = [
                  ...nestedProperties,
                  ...getNestedSchemaProperties(anyOfItem?.items?.properties),
                ];
              }
              if (anyOfItem?.properties) {
                nestedProperties = [
                  ...nestedProperties,
                  ...getNestedSchemaProperties(anyOfItem?.properties),
                ];
              }
            });
          }

          formatFieldDetails(
            {
              label: item.label,
              dotfield: currentDotfield,
              description: item.description,
              abstract: item.abstract,
              type: item.type,
              enum: item.enum || nestedEnum,
              properties: nestedProperties,
            },
            resourceType,
          );
        }
      }

      // if field already exists, add the new resourceType to the description and abstract
      if (fields[dotfield]) {
        if (abstract) {
          fields[dotfield].abstract ||= {}; // Ensure abstract object exists
          // @ts-ignore
          fields[dotfield].abstract[resourceType] = abstract;
        }
        if (description) {
          fields[dotfield].description ||= {}; // Ensure description object exists
          // @ts-ignore
          fields[dotfield].description[resourceType] = description;
        }

        fields[dotfield] = {
          ...fields[dotfield],
          format,
          schemaType: type,
          enum: schemaField.enum,
        };
        return;
      }

      const fieldDetails = {
        ...rest,
        name: label,
        property: label,
        dotfield,
        format,
        schemaType: type,
        ...(description && { description: { [resourceType]: description } }),
        ...(abstract && { abstract: { [resourceType]: abstract } }),
      } as SchemaFieldDetails[string];

      fields[dotfield] = fieldDetails;
    };

    await axios
      .get(SCHEMA_API_URL)
      .then(
        (response: { data: { hits: any[]; source: { '@graph': any[] } } }) => {
          const types_enum = [] as string[];
          return response.data.hits.map((schema, idx) => {
            let schemaType;
            if (schema?.label && RESOURCE_TYPES.includes(schema.label)) {
              schemaType = schema.label;
              types_enum.push(schema.label);
              const properties = [
                ...schema?.properties,
                ...getNestedSchemaProperties(schema?.validation?.properties),
              ];
              const abstract =
                response.data.source['@graph'][idx]?.abstract || '';
              // Create a type field with the definitions of the schema type
              formatFieldDetails(
                {
                  label: '@type',
                  dotfield: '@type',
                  description: schema.description,
                  abstract,
                  type: schema.type,
                  properties,
                  enum: types_enum,
                },
                schemaType,
              );

              return;
            }
          });
        },
      );

    return fields;
  } catch (error: any) {
    console.error(`Error fetching field details:`, error.message);
    throw error;
  }
};
