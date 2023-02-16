import { DragItem } from '../../index';

export const getTypeLabel = (value: DragItem['value']) => {
  if (value?.searchType?.name) {
    return value.searchType.name;
  } else if (value.field === '_exists_') {
    return 'Field exists';
  } else if (value.field === '-_exists_') {
    return "Field doesn't exist";
  } else if (value.querystring) {
    if (value.querystring.startsWith('"') && value.querystring.endsWith('"')) {
      return 'Exact Match';
    } else if (
      value.querystring.startsWith('*') &&
      value.querystring.endsWith('*')
    ) {
      return 'Contains';
    } else if (value.querystring.startsWith('*')) {
      return 'Starts With';
    } else if (value.querystring.endsWith('*')) {
      return 'Ends With';
    }
  }
  return 'Contains';
};
