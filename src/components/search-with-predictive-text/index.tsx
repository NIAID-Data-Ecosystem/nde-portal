import React, { ReactElement } from 'react';
import { InputProps } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { usePredictiveSearch } from './hooks/usePredictiveSearch';
import { PredictiveSearch } from './components/PredictiveSearch';

interface SearchWithPredictiveTextProps {
  ariaLabel: string; // input label for accessibility
  placeholder: string; // input placeholder text
  field?: string; //default field to search through,
  term?: string; //default term to search with,
  size?: InputProps['size'];
  isLoading?: boolean;
  colorScheme?: InputProps['colorScheme'];
  handleSubmit: (
    inputValue: string,
    field: string,
    data?: FormattedResource,
  ) => void; // triggered when suggestion item from list is clicked / press enters.
  renderSubmitButton?: (props: any) => ReactElement; // an optional custom button rendered as the "submit" button.
}

// General search bar with predictive text. Groups results by type of resource.
export const SearchWithPredictiveText: React.FC<
  SearchWithPredictiveTextProps
> = ({ field: defaultField = '', term: defaultTerm = '', ...props }) => {
  // Search term entered in search bar
  const usePredictiveSearchProps = usePredictiveSearch(
    defaultTerm,
    defaultField,
  );

  return (
    <PredictiveSearch
      {...props}
      {...usePredictiveSearchProps}
      isLoading={props.isLoading || usePredictiveSearchProps.isLoading}
    />
  );
};

export * from './hooks/usePredictiveSearch';
