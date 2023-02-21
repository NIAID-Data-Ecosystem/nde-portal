export type ErrorType = 'info' | 'error' | 'warning';

/**
 * @interface QueryStringError
 *
 * @id {string} - the id of the error
 * @type {ErrorType} - the type of error
 * @title {string} - the title of the error
 * @message {string} - the message of the error
 */
export interface QueryStringError {
  id: string;
  type: ErrorType;
  title?: string;
  message: string;
}

/**
 * type ValidationConfig
 * @isValid {boolean} - whether the query string is valid or not
 * @errors {QueryStringError} - the error information to display
 */
type ValidationConfig = {
  isValid: boolean;
  error?: QueryStringError;
};

/* Configuration for the validation text */
export const VALIDATION_TEXT_CONFIG: QueryStringError[] = [
  {
    id: 'checkBalancedPunctuation',
    type: 'error' as ErrorType,
    title: 'Unbalanced punctuation',
    message:
      'Check for missing parentheses, brackets, quotations or curly braces.',
  },
  {
    id: 'checkMissingUnion',
    type: 'error' as ErrorType,
    title: 'Missing union',
    message:
      'Check for missing unions (AND, OR, NOT) or that all unions are of type (AND, OR, NOT) between grouped elements.',
  },
  {
    id: 'unnecessaryUnions',
    type: 'error' as ErrorType,
    title: 'Unnecessary unions',
    message:
      'Check for unions (AND, OR, NOT) at the beginning or end of the query.',
  },
];

/**
 * [checkBalancedPunctuation]:
 * This function checks if the given string has balanced parentheses, quotes, curly braces, and square brackets.
 */
export const checkBalancedPunctuation = (str: string): ValidationConfig => {
  var stack = [];

  const error = VALIDATION_TEXT_CONFIG.find(
    err => err.id === 'checkBalancedPunctuation',
  );

  for (var i = 0; i < str.length; i++) {
    if (str[i] == '(' || str[i] == '{' || str[i] == '[') stack.push(str[i]);
    else if (str[i] == ')') {
      if (stack.pop() != '(') {
        return { isValid: false, error };
      }
    } else if (str[i] == '}') {
      if (stack.pop() != '{') {
        return { isValid: false, error };
      }
    } else if (str[i] == ']') {
      if (stack.pop() != '[') {
        return { isValid: false, error };
      }
    } else if (str[i] === `"`) {
      if (stack.length > 0 && stack[stack.length - 1] === '"') {
        stack.pop();
      } else {
        stack.push('"');
      }
    }
  }
  return {
    isValid: !stack.length,
    error: !stack.length ? undefined : error,
  };
};

/**
 * [checkMissingUnion]:
 * This function checks if the given string has missing union operators between grouped items.
 */
export const checkMissingUnion = (str: string): ValidationConfig => {
  const error = VALIDATION_TEXT_CONFIG.find(
    err => err.id === 'checkMissingUnion',
  );

  let isMissingUnion = false;
  // if a closed parenthesis is immediately followed by an open parenthesis, then there is no union operator between them
  if (str.replace(/\s/g, '').includes(')(')) {
    return { isValid: false, error };
  }
  var regex = /"([^"]*)"|(\S+)/g;
  var queryWords = (str.match(regex) || []).map(m => m.replace(regex, '$1$2'));
  queryWords.forEach((item, i) => {
    if (item.startsWith('(') && i > 0 && queryWords[i - 1]) {
      const prevWord = queryWords[i - 1];
      // if previous word ends in a colon or is a union operator, then there is no error. Not the most robust check, but it works for now.
      if (
        prevWord.charAt(prevWord.length - 1) !== ':' &&
        prevWord !== 'AND' &&
        prevWord !== 'OR' &&
        prevWord !== 'NOT'
      ) {
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

  return {
    isValid: !isMissingUnion,
    error: isMissingUnion ? error : undefined,
  };
};

/**
 * [startsOrEndsWithUnion]:
 * This function checks if the given string starts or ends with a union operator unnecessarily.
 */
export const startsOrEndsWithUnion = (str: string): ValidationConfig => {
  if (
    str.split(' ')[0].match(/AND|OR|NOT/) ||
    str.split(' ')[str.split(' ').length - 1].match(/AND|OR|NOT/)
  ) {
    const error = VALIDATION_TEXT_CONFIG.find(
      err => err.id === 'checkMissingUnion',
    );
    return { isValid: false, error };
  }
  return { isValid: true };
};

/**
 * [removeDuplicateErrors]:
 * Helper function removes duplicate errors from the array of errors.
 * @param errors {QueryStringError[]} - the array of errors
 * @returns {QueryStringError[]} - the array of errors with duplicates removed
 */
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
