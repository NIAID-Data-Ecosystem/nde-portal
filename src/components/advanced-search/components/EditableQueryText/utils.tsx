import { convertQueryString2Object } from '../../utils';
import { flattenTree, TreeItem } from '../SortableWithCombine';

export const formatQueryString = (str: string): string => {
  // Condense too much spacing between words and trim all extra spaces.
  return str.replace(/\s\s+/g, ' ').trim();
};

export type ErrorType = 'info' | 'error' | 'warning';

export interface QueryStringError {
  type: ErrorType;
  title?: string;
  message: string;
}

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

  // 1. Check for balanced parentheses.
  const isBalanced = checkBalancedPunctuation(str);
  if (!isBalanced) {
    errors.push({
      type: 'error' as ErrorType,
      title: 'Unbalanced punctuation',
      message:
        'Check for missing parentheses, brackets, quotations or curly braces.',
    });
  }

  // 2. Check for missing union between grouped elements.
  const isMissingUnion = checkMissingUnion(str);
  if (isMissingUnion) {
    errors.push({
      type: 'error' as ErrorType,
      title: 'Missing union',
      message:
        'Check for missing unions (AND, OR, NOT) or that all unions are of type (AND, OR, NOT) between grouped elements.',
    });
  }

  // 3. Check for unnecessary unions at the start of end of query string.
  const startsOrEndsWithUnion =
    str.split(' ')[0].match(/AND|OR|NOT/) ||
    str.split(' ')[str.split(' ').length - 1].match(/AND|OR|NOT/);
  if (startsOrEndsWithUnion) {
    errors.push({
      type: 'error' as ErrorType,
      title: 'Unnecessary unions',
      message:
        'Check for unions (AND, OR, NOT) at the beginning or end of the query.',
    });
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

const checkBalancedPunctuation = (str: string): boolean => {
  var stack = [];
  for (var i = 0; i < str.length; i++) {
    if (str[i] == '(' || str[i] == '{' || str[i] == '[') stack.push(str[i]);
    else if (str[i] == ')') {
      if (stack.pop() != '(') {
        return false;
      }
    } else if (str[i] == '}') {
      if (stack.pop() != '{') {
        return false;
      }
    } else if (str[i] == ']') {
      if (stack.pop() != '[') {
        return false;
      }
    } else if (str[i] === `"`) {
      if (stack.length > 0 && stack[stack.length - 1] === '"') {
        stack.pop();
      } else {
        stack.push('"');
      }
    }
  }

  return !stack.length;
};

const checkMissingUnion = (str: string): boolean => {
  let isMissingUnion = false;
  if (str.replace(/\s/g, '').includes(')(')) {
    return true;
  }
  var regex = /"([^"]*)"|(\S+)/g;
  var queryWords = (str.match(regex) || []).map(m => m.replace(regex, '$1$2'));
  queryWords.forEach((item, i) => {
    if (item.startsWith('(') && i > 0 && queryWords[i - 1]) {
      const prevWord = queryWords[i - 1];
      if (prevWord !== 'AND' && prevWord !== 'OR' && prevWord !== 'NOT') {
        isMissingUnion = true;
      }
    }
    if (
      item.endsWith(')') &&
      i !== queryWords.length - 1 &&
      queryWords[i + 1]
    ) {
      const nextWord = queryWords[i + 1];
      if (nextWord !== 'AND' && nextWord !== 'OR' && nextWord !== 'NOT') {
        isMissingUnion = true;
      }
    }
  });

  return isMissingUnion;
};

const checkQuery = (tree: TreeItem[]): QueryStringError[] => {
  const flattened = flattenTree(tree);
  const errors = [];

  if (flattened.findIndex(item => item.index !== 0 && !item.value.union) > -1) {
    errors.push({
      type: 'error' as ErrorType,
      title: 'Query Object error',
      message:
        'Check for that union between grouped elements are of type AND, OR, or NOT.',
    });
  }
  return errors;
};

export const getErrorMessage = (error: Error) => {
  if (error) {
    const errorStatus = error.status;

    if (+errorStatus === 400) {
      return {
        type: 'error' as ErrorType,
        title: 'Bad Request',
        message: `Check that your query is formatted properly. For more information, see the documentation.`,
      };
    }

    if (+errorStatus === 404) {
      return {
        type: 'error' as ErrorType,
        title: 'Not Found',
        message:
          'Check that your query is formatted properly. For more information, see the documentation.',
      };
    }
    if (+errorStatus === 500) {
      return {
        type: 'error' as ErrorType,
        title: 'Internal Server Error',
        message:
          'We are experiencing issues with our servers. Please try again later.',
      };
    }

    if (+errorStatus === 503) {
      return {
        type: 'error' as ErrorType,
        title: 'Service Unavailable',
        message:
          'We are experiencing issues with your request. If you have many wildcards in your query, try removing them. If you are still experiencing issues, please try again later.',
      };
    }
    if (+errorStatus === 504) {
      return {
        type: 'error' as ErrorType,
        title: 'Gateway Timeout',
        message:
          'We are experiencing issues with your request. If you have many wildcards in your query, try removing them. If you are still experiencing issues, please try again later.',
      };
    }
  }
};

export const removeDuplicateErrors = (
  errors: QueryStringError[],
): QueryStringError[] => {
  return errors.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        t => t.title === value.title && t.message === value.message,
      ),
  );
};
