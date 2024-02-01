/**
 * @interface QueryStringError
 *
 * @id {string} - the id of the error
 * @type {ErrorType} - the type of error
 * @title {string} - the title of the error
 * @message {string} - the message of the error
 */
export type ErrorType = 'info' | 'error' | 'warning';

export interface QueryStringError {
  id: string;
  type: ErrorType;
  title?: string;
  message: string;
}
