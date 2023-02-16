import MetadataFieldsConfig from 'configs/resource-fields.json';

export type UnionTypes = 'AND' | 'OR' | 'NOT';

/**
 * @interface QueryValue
 *
 * @term The term to search for.
 * @querystring The formatted term to search for (i.e. wildcarded or in quotes for exact sera h).
 * @field The field to search for the term in.
 * @union The union type to use for the term.
 */
export interface QueryValue {
  term: string;
  querystring: string;
  field: (typeof MetadataFieldsConfig)[number]['property'];
  union: UnionTypes | '';
}
