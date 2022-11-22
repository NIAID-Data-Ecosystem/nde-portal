import { encodeString } from 'src/utils/querystring-helpers';
import type { DragItem } from './components/SortableWithCombine';

type UnionTypes = 'AND' | 'OR' | 'NOT';

export const unionOptions = ['AND', 'OR', 'NOT'] as UnionTypes[];

export const getUnionTheme = (term: UnionTypes) => {
  if (term === 'AND') {
    return {
      background: 'primary.500',
      colorScheme: 'primary',
      _hover: { bg: 'primary.600' },
    };
  }
  if (term === 'OR') {
    return {
      background: 'secondary.500',
      colorScheme: 'secondary',
      _hover: { bg: 'secondary.600' },
    };
  }
  if (term === 'NOT') {
    return {
      background: 'red.500',
      colorScheme: 'red',
      _hover: { bg: 'red.600' },
    };
  }
  return {};
};

export const convertObject2QueryString = (
  items: DragItem[],
  encode?: boolean,
) => {
  const reduceQueryString = (items: DragItem[]) =>
    items.reduce((r, item, i) => {
      const union = `${item.value.union ? ` ${item.value.union} ` : ''}`;
      if (item.children.length > 0) {
        r += `${union}(${reduceQueryString(item.children)})`;
      } else {
        let str = '';
        if (item.value.field) {
          str += `${item.value.field}:`;
        }
        // TO DO: if exact match don't encode.
        str += encode ? encodeString(item.value.term) : item.value.term;
        r += `${union}${str}`;
      }

      return r;
    }, '');

  return reduceQueryString(items);
};
