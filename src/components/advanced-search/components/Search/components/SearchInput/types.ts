import React from 'react';
import { ButtonProps, InputProps } from 'nde-design-system';
import { QueryValue } from 'src/components/advanced-search/types';
import { QueryStringError } from 'src/components/advanced-search/utils/validation-checks';

/**
 * The [SearchInput] component renders different inputs based on the selected field.
 *
 * @interface SearchInputProps
 *
 * @defaultInputValue {any} - default value of input field.
 * @colorScheme {InputProps['colorScheme']} - color scheme for input field.
 * @hideSuggestions {boolean} - hide suggestions list/disable api requests.
 * @size {InputProps['size']} - size of input field.
 * @errors {QueryStringError[]} - array of errors.
 * @setErrors {(errors: QueryStringError[]) => void} - function to set errors.
 * @onChange {(value: string) => void} - triggered when input value changes.
 * @onSubmit {(args: Partial<QueryValue>) => void} - triggered when input value is submitted.
 * @resetForm {boolean} - reset form.
 * @renderSubmitButton {(props: ButtonProps) => React.ReactElement} - function to render submit button.
 */

export interface SearchInputProps {
  defaultInputValue: string | number | { startDate?: string; endDate?: string };
  colorScheme?: InputProps['colorScheme'];
  size: 'sm' | 'md' | 'lg';
  hideSuggestions?: boolean;
  resetForm: boolean;
  errors: QueryStringError[];
  setErrors: (arg: QueryStringError[]) => void;
  onChange?: (args: string | Partial<QueryValue>) => void;
  onSubmit: (args: QueryValue) => void;
  setResetForm: (arg: boolean) => void;
  renderSubmitButton?: (props: ButtonProps) => React.ReactElement;
}

/**
 * The [SearchInput] component renders different inputs based on the selected field.
 * These props are passed down to each of the input components and can handle each type of input value.
 *
 * @interface AdvancedSearchInputProps
 *
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
  colorScheme?: SearchInputProps['colorScheme'];
  isDisabled?: boolean;
  size: SearchInputProps['size'];
  inputValue: SearchInputProps['defaultInputValue'];
  errors: SearchInputProps['errors'];
  setErrors: SearchInputProps['setErrors'];
  clearInputValue: () => void;
  handleClick: (args: Partial<QueryValue>) => void;
  handleChange: (args: {
    value: AdvancedSearchInputProps['inputValue'];
    term?: string;
    querystring?: string;
  }) => void;
  handleSubmit: (args: Partial<QueryValue>) => void;
  renderSubmitButton?: SearchInputProps['renderSubmitButton'];
}
