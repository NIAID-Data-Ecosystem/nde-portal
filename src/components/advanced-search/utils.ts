import type { DragItem } from './components/SortableWithCombine';
import MetadataConfig from 'configs/resource-metadata.json';
import MetadataNames from 'configs/metadata-standard-names.json';

type UnionTypes = 'AND' | 'OR' | 'NOT';

export const unionOptions = ['AND', 'OR', 'NOT'] as UnionTypes[];

export const getUnionTheme = (term: UnionTypes) => {
  if (term === 'AND') {
    return {
      background: 'primary.500',
      bg: 'primary.500',
      colorScheme: 'primary',
      _hover: { bg: 'primary.600' },
    };
  }
  if (term === 'OR') {
    return {
      background: 'secondary.500',
      bg: 'secondary.500',
      colorScheme: 'secondary',
      _hover: { bg: 'secondary.600' },
    };
  }
  if (term === 'NOT') {
    return {
      background: 'red.500',
      bg: 'red.500',
      colorScheme: 'red',
      _hover: { bg: 'red.600' },
    };
  }
  return {};
};

/**
 * [convertObject2QueryString]: Converts a nested query object (tree)
 * to a string for querying the API.
 */
export const convertObject2QueryString = (items: DragItem[]) => {
  const reduceQueryString = (items: DragItem[]) =>
    items.reduce((r, item) => {
      const union = `${item.value.union ? ` ${item.value.union} ` : ''}`;
      if (item.children.length > 0) {
        r += `${union}(${reduceQueryString(item.children)})`;
      } else {
        let str = '';
        const { field, term, querystring } = item.value;
        if (field) {
          str += `${field}:`;
        }
        let formattedTerm = querystring ? querystring : term;

        // wrap querystring in parenthesis if a field is selected so that the term is applied to the field.
        str += field ? `(${formattedTerm})` : formattedTerm;
        r += `${union}(${str})`;
      }

      return r;
    }, '');

  return reduceQueryString(items);
};

/**
 * [getMetadataNameByProperty]: Given a metadata property retrieves the associated display name.
 * Searches for name in standard config, followed by transformed API config, followed by basic formatting.
 */

const MetadataNamesConfig = MetadataNames as {
  property: string;
  name: string;
}[];

export const getMetadataNameByProperty = (property: string) => {
  const standardized_name = MetadataNamesConfig.find(
    item => item.property === property,
  );
  const config_name = MetadataConfig.find(item => item.property === property);
  let name = '';
  if (standardized_name) {
    name = standardized_name.name;
  } else if (config_name) {
    name = config_name.title;
  } else {
    // apply some basic formatting.
    name = property
      .split('.')
      .join(' ')
      .split(/(?=[A-Z])/)
      .join(' ');
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
};
