import { APIResourceType } from 'src/utils/formatting/formatResourceType';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

export interface SchemaDefinition {
  name: string;
  dotfield: keyof typeof SCHEMA_DEFINITIONS;
  property: string;
  count: number;
  type: string;
  schemaType?: string;
  enum?: string[];
  description?: {
    [key in APIResourceType]?: string;
  };
  abstract?: {
    [key in APIResourceType]?: string;
  };
  isAdvancedSearchField?: boolean;
}

export interface SchemaDefinitions {
  [key: string]: SchemaDefinition;
}
