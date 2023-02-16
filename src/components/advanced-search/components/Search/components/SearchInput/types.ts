import React from 'react';
import { ButtonProps, InputProps } from 'nde-design-system';
import { QueryValue } from 'src/components/advanced-search/types';
import { QueryStringError } from 'src/components/advanced-search/utils/validation-checks';

/**
 * The [SearchInput] component renders different inputs based on the selected field.
 * These props are passed down to the input components and handle each type of input value.
 *
 * @interface AdvancedSearchInputProps
 * @isDisabled {boolean} - disable input field.
 * @colorScheme {InputProps['colorScheme']} - color scheme for input field.
 * @size {InputProps['size']} - size of input field.
 * @inputValue {any} - value of input field.
 * @errors {QueryStringError[]} - array of errors.
 * @setErrors {(errors: QueryStringError[]) => void} - function to set errors.
 * @handleClick {(args: Partial<QueryValue>) => void} - triggered when suggestion item from list is clicked.
 * @handleChange {(value: string) => void} - triggered when input value changes.
 * @handleSubmit {(args: Partial<QueryValue>) => void} - triggered when input value is submitted.
 * @renderSubmitButton {(props: ButtonProps) => React.ReactElement} - function to render submit button.
 */

export interface AdvancedSearchInputProps {
  isDisabled?: boolean;
  colorScheme?: InputProps['colorScheme'];
  size: InputProps['size'];
  inputValue: string | number | { startDate: string; endDate: string };
  errors: QueryStringError[];
  setErrors: (errors: QueryStringError[]) => void;
  handleClick: (args: Partial<QueryValue>) => void;
  handleChange: (value: AdvancedSearchInputProps['inputValue']) => void;
  handleSubmit: (args: Partial<QueryValue>) => void;
  renderSubmitButton?: (props: ButtonProps) => React.ReactElement;
}
