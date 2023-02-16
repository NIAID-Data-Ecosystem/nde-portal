import MetadataFieldsConfig from 'configs/resource-fields.json';

export type UnionTypes = 'AND' | 'OR' | 'NOT';

export interface QueryValue {
  term: string;
  querystring: string;
  field: (typeof MetadataFieldsConfig)[number]['property'];
  union: UnionTypes | '';
}
