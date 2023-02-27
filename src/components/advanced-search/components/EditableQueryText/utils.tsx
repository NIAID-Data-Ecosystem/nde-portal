import { convertQueryString2Object } from '../../utils/query-helpers';
import {
  checkBalancedPunctuation,
  checkMissingUnion,
  ErrorType,
  QueryStringError,
  startsOrEndsWithUnion,
} from '../../utils/validation-checks';
import { flattenTree, TreeItem } from '../SortableWithCombine';

export const formatQueryString = (str: string): string => {
  // Condense too much spacing between words and trim all extra spaces.
  return str.replace(/\s\s+/g, ' ').trim();
};

export const validateQueryString = (
  querystring: string,
): {
  isValid: boolean;
  errors: QueryStringError[];
  data: TreeItem[] | null;
  querystring: string;
} => {
  // Format query string.
  const str = formatQueryString(querystring);
  const errors = [];

  // 1. Check for balanced parentheses, quotes, etc.
  const isBalanced = checkBalancedPunctuation(str);
  if (!isBalanced.isValid) {
    isBalanced.error && errors.push(isBalanced.error);
  }

  // 2. Check for missing union between grouped elements.
  const isMissingUnion = checkMissingUnion(str);
  if (!isMissingUnion.isValid) {
    isMissingUnion.error && errors.push(isMissingUnion.error);
  }

  // 3. Check for unnecessary unions at the start of end of query string.
  const unnecessaryUnion = startsOrEndsWithUnion(str);
  if (!unnecessaryUnion.isValid) {
    unnecessaryUnion.error && errors.push(unnecessaryUnion.error);
  }

  // 4. Check for errors in running of query.
  const queryObject = convertQueryString2Object(str);
  const queryErrors = checkQuery(queryObject);
  if (queryErrors.length) {
    errors.push(...queryErrors);
  }
  return {
    isValid: errors.length === 0,
    errors,
    querystring: str,
    data: errors.length ? null : queryObject,
  };
};

const checkQuery = (tree: TreeItem[]): QueryStringError[] => {
  const flattened = flattenTree(tree);
  const errors = [];

  if (flattened.findIndex(item => item.index !== 0 && !item.value.union) > -1) {
    errors.push({
      id: 'checkQuery',
      type: 'error' as ErrorType,
      title: 'Query Object error',
      message:
        'Check for that union between grouped elements are of type AND, OR, or NOT.',
    });
  }
  return errors;
};

/**
 * [removeUnnecessaryParentheses]:
 * Removes unnecessary wrapping parentheses from a query string.
 *  */
export const removeUnnecessaryParentheses = (str: string): string => {
  // From: https://stackoverflow.com/questions/57410831/how-to-remove-unnecessary-parenthesis
  function tokenize(str: string) {
    return str.match(/[()]|[^()]+/g);
  }

  function parse(toks: any, depth = 0): any {
    let ast = [];

    while (toks.length) {
      let t = toks.shift();

      switch (t) {
        case '(':
          ast.push(parse(toks, depth + 1));
          break;
        case ')':
          if (!depth) throw new SyntaxError('mismatched )');
          return ast;
        default:
          ast.push(t);
      }
    }

    if (depth) {
      throw new SyntaxError('premature EOF');
    }
    return ast;
  }

  function generate(el: string[] | string) {
    if (!Array.isArray(el)) return el;

    while (el.length === 1 && Array.isArray(el[0])) el = el[0];
    // @ts-ignore
    return '(' + el.map(generate).join('') + ')';
  }

  const parsed_string = generate(parse(tokenize(`(${str})`)));

  // remove the first and last parentheses that we added ^
  return parsed_string.substring(1, parsed_string.length - 1);
};
