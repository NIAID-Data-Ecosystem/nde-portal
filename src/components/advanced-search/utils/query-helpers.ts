import { uniqueId } from 'lodash';
import {
  collapseTree,
  FlattenedItem,
  TreeItem,
} from '../components/SortableWithCombine';
import SchemaDefinitions from 'configs/schema-definitions.json';
import { encodeString } from 'src/utils/querystring-helpers';
import { QueryValue, UnionTypes } from '../types';

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
 * [getMetadataNameByDotfield]: Given a metadata property retrieves the associated display name.
 * Searches for name in standard config, followed by transformed API config, followed by basic formatting.
 */

export const getMetadataNameByDotfield = (dotfield: string) => {
  const { name } = Object.values(SchemaDefinitions).find(
    item => item.dotfield === dotfield,
  ) || { name: '' };

  return name;
};

export const wildcardQueryString = ({
  value,
  field,
  wildcard,
}: {
  value: string;
  field?: string;
  wildcard?: 'start' | 'end';
}) => {
  if (!value) {
    return '';
  }

  const searchTerms = value.trim().split(' ');

  // Wildcard with multiple words is pretty tricky and doesn't work well at the moment
  // To get somewhat accurate results we need to wildcard each word individually
  // i.e. (*perennial*+*allergic*+*rhinitis*) instead of (*perennial allergic rhinitis*)
  const querystring = `${searchTerms
    .map(str => {
      let wildcarded_str = '';
      if (wildcard === 'start') {
        wildcarded_str = `*${str}`;
      } else if (wildcard === 'end') {
        wildcarded_str = `${str}*`;
      } else {
        wildcarded_str = `*${str}*`;
      }
      return str ? `${wildcarded_str.replaceAll(',', '')}` : '';
    })
    .join(' ')}`;

  return encodeString(querystring);
};

/**
 * [convertObject2QueryString]: Converts a nested query object (tree)
 * to a string for querying the API.
 * @params items: TreeItem[]
 * @returns string
 */
export const convertObject2QueryString = (items: TreeItem[]) => {
  const reduceQueryString = (items: TreeItem[]) =>
    items.reduce((r, item, index) => {
      const union = `${
        index !== 0 && item.value.union ? ` ${item.value.union} ` : ''
      }`;
      if (item.children.length > 0) {
        r += `${union}(${reduceQueryString(item.children)})`;
      } else {
        let str = '';
        const { field, term, querystring } = item.value;
        if (field) {
          str += `${field}:`;
        }
        let formattedTerm = querystring ? querystring.trim() : term.trim();

        const containsUnion = unionOptions.some(union =>
          formattedTerm.includes(union),
        );
        // 1. if the term is wrapped in quotes, do nothing.
        if (
          formattedTerm.startsWith('"') &&
          formattedTerm.endsWith('"') &&
          !containsUnion
        ) {
          str += formattedTerm;
        } else {
          str += formattedTerm;
        }

        // wrap querystring in parenthesis if a field is selected so that the term is applied to the field.
        r += `${union}${str}`;
      }

      return r;
    }, '');

  return reduceQueryString(items);
};

type ParseInterface = Array<ParseInterface | Partial<QueryValue>>;
/**
 * [convertObject2QueryString]: Converts a nested query object (tree)
 * to a string for querying the API.
 * @params string - a string with optional nested parentheses.
 * @returns array - an array of arrays.
 */
export const convertQueryString2Object = (str: string) => {
  const newString = `(${str
    .replaceAll(' AND ', `) AND (`)
    .replaceAll(' OR ', `) OR (`)
    .replaceAll(' NOT ', `) NOT (`)})`;

  // Transform a string with nested parentheses into an array of arrays.
  const parseString = (string: string): ParseInterface => {
    var array = [];
    var current = '';
    var depth = 0;
    for (var i = 0; i < string.length; i++) {
      if (string[i] === '(') {
        depth++;
        if (depth === 1) {
          if (current !== '') {
            array.push(handleValue(current));
          }
          current = '';
        } else {
          current += '(';
        }
      } else if (string[i] === ')') {
        depth--;
        if (depth === 0) {
          if (current !== '') {
            array.push(parseString(current));
          }
          current = '';
        } else {
          current += ')';
        }
      } else {
        current += string[i];
      }
    }
    if (current !== '') {
      array.push(handleValue(current));
    }
    return array;
  };

  // Build a nested tree from an array of arrays used for the query builder.
  const getNestedItems = (
    tree: ParseInterface,
    parentId: FlattenedItem['parentId'] = null,
    depth = 0,
  ) => {
    const stack: FlattenedItem[] = [];
    let union = '' as QueryValue['union'];
    let field = '';
    let index = 0;
    tree.map((node, i) => {
      if (!Array.isArray(node) && node.field) {
        field = node.field;
      } else if (!Array.isArray(node) && node.union) {
        union = node.union;
      } else if (Array.isArray(node)) {
        let term = '';
        let querystring = '';
        let node_field;

        if (!Array.isArray(node[0])) {
          term = node[0]?.term || '';
          querystring = node[0].querystring || node[0]?.term || '';
          node_field = node[0].field;
        }

        const id = uniqueId(term);
        const newDepth = depth + 1;

        stack.push({
          id,
          depth,
          parentId,
          index,
          value: {
            term: term.trim(),
            querystring: querystring.trim(),
            union: union,
            field: (node_field || field).trim() as QueryValue['field'],
          },
          children: Array.isArray(node)
            ? getNestedItems(node, id, newDepth)
            : [],
        });
        index++;
      }
    });
    return stack;
  };
  const flattenedTree = parseString(newString);

  const tree = collapseTree(getNestedItems(flattenedTree));
  return tree;
};

const handleValue = (value: string): Partial<QueryValue> => {
  const str = value.trim();
  const fieldColonIndex = str.indexOf(':');
  if (fieldColonIndex > -1 && str[fieldColonIndex - 1] !== '\\') {
    const field = str.substring(0, fieldColonIndex) as QueryValue['field'];

    // Check if the string that is separated by a colon is an actual field in the API.
    if (isValidField(field)) {
      const term = str.substring(fieldColonIndex + 1);
      return { field, term: term };
    } else {
      // if exact string no need to escape.
      if (
        (str.charAt(0) === "'" && str.charAt(str.length - 1) === "'") ||
        (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"')
      ) {
        return { term: str, querystring: str };
      } else {
        return { term: str, querystring: encodeString(str) };
      }
    }
  } else if (str === 'OR' || str === 'AND' || str === 'NOT') {
    return { union: str };
  } else {
    return { term: str };
  }
};

/**
 * Checks if a field is a valid field in the API.
 * @param field {string} property to match against the schema.
 * @returns boolean - whether the field is valid or not.
 */
const isValidField = (field: string) => {
  const fieldInSchemaIndex = Object.keys(SchemaDefinitions).findIndex(
    schemaField => schemaField === field,
  );

  return (
    fieldInSchemaIndex > -1 || field === '_exists_' || field === '-_exists_'
  );
};
