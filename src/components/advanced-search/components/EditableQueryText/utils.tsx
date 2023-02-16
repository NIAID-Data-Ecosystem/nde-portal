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

export const getErrorMessage = (error: { status: string }) => {
  if (error) {
    const errorStatus = error.status;

    if (+errorStatus === 400) {
      return {
        id: 'bad-request',
        type: 'error' as ErrorType,
        title: 'Bad Request',
        message: `Check that your query is formatted properly. For more information, see the documentation.`,
      };
    }

    if (+errorStatus === 404) {
      return {
        id: 'not-found',
        type: 'error' as ErrorType,
        title: 'Not Found',
        message:
          'Check that your query is formatted properly. For more information, see the documentation.',
      };
    }
    if (+errorStatus === 500) {
      return {
        id: 'internal-server-error',
        type: 'error' as ErrorType,
        title: 'Internal Server Error',
        message:
          'We are experiencing issues with our servers. Please try again later.',
      };
    }

    if (+errorStatus === 503) {
      return {
        id: 'service-unavailable',
        type: 'error' as ErrorType,
        title: 'Service Unavailable',
        message:
          'We are experiencing issues with your request. If you have many wildcards in your query, try removing them. If you are still experiencing issues, please try again later.',
      };
    }
    if (+errorStatus === 504) {
      return {
        id: 'gateway-timeout',
        type: 'error' as ErrorType,
        title: 'Gateway Timeout',
        message:
          'We are experiencing issues with your request. If you have many wildcards in your query, try removing them. If you are still experiencing issues, please try again later.',
      };
    }
  }
};
