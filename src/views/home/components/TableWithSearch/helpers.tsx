import { TableData } from '.';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

export const getColorSchemeForCollectionType = (
  collectionType: TableData['type'],
) => {
  if (!collectionType) {
    return '';
  }

  const types = [
    ...(schema['collectionType']['enum'] || []),
    'iid',
    'generalist',
  ];

  const themes = [
    'gray',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
    'purple',
    'pink',
    'primary',
    'tertiary',
    'secondary',
  ];

  const idx = types.indexOf(collectionType);
  const theme = themes[idx % themes.length];

  return theme;
};

export const getColorSchemeForDataType = (type: TableData['dataType']) => {
  if (type === 'ResourceCatalog') {
    return 'primary';
  } else {
    return 'blue';
  }
};

export const getDataTypeName = (type: TableData['dataType']) => {
  if (type === 'ResourceCatalog') {
    return 'Resource Catalog';
  } else {
    return 'Dataset Repository';
  }
};

export const getRepositoryTypeName = (type: string) => {
  if (type === 'iid') {
    return 'IID';
  } else if (type === 'generalist') {
    return 'Generalist';
  } else {
    return type;
  }
};
