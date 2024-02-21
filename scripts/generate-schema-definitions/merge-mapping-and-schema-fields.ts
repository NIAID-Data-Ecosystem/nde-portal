import { dotfieldAndCamelCaseToHumanReadable } from './helpers';
import ADVANCED_SEARCH_CONFIG from 'configs/advanced-search-fields.json';
import { MappedFieldsWithCounts } from './fetch-fields-from-mapping';
import { SchemaFieldDetails } from './fetch-fields-from-schema';

// Match and merge the field details from the NDE schema and the mapping.
export const mergeMappingAndSchemaFields = (
  mappedFields: MappedFieldsWithCounts[],
  schema: SchemaFieldDetails,
) => {
  const matchedFields = {} as {
    [key: string]: {
      name: string;
      dotfield: string;
      property: string;
      count?: number;
      type: string;
      schemaType?: string;
      enum?: string[];
      format?: string;
      description?: {
        [key: string]: string;
      };
      abstract?: {
        [key: string]: string;
      };
      isAdvancedSearchField?: boolean;
    };
  };
  for (let i = 0; i < mappedFields.length; i++) {
    const mappedField = mappedFields[i];
    const dotfield = mappedField.dotfield;
    const schemaField = schema[dotfield];
    let mergedField = { ...mappedField, ...schemaField };

    matchedFields[dotfield] = {
      name: dotfieldAndCamelCaseToHumanReadable(mergedField.dotfield),
      dotfield: mergedField.dotfield,
      property: mergedField.property,
      count: mergedField.count,
      type: mergedField.type,
      schemaType: mergedField?.schemaType,
      enum: mergedField?.enum,
      format: mergedField?.format,
      description: mergedField?.description,
      abstract: mergedField?.abstract,
      isAdvancedSearchField: ADVANCED_SEARCH_CONFIG.fields.includes(
        mergedField.dotfield,
      ),
    };
  }
  return matchedFields;
};
