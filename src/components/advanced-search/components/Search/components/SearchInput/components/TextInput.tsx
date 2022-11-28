import React, { useState } from 'react';
import { Box, ButtonProps, InputProps } from 'nde-design-system';
import { PredictiveSearch } from 'src/components/search-with-predictive-text/components/PredictiveSearch';
import { UnionTypes } from 'src/components/advanced-search/components/SortableWithCombine';
import { AdvancedSearchContextProps } from '../../AdvancedSearchFormContext';
import { FormattedResource } from 'src/utils/api/types';

interface TextInputProps extends AdvancedSearchContextProps {
  isDisabled?: boolean;
  colorScheme?: InputProps['colorScheme'];
  size: InputProps['size'];
  onClick?: (
    inputValue: string,
    field: string,
    data?: FormattedResource,
  ) => void; // triggered when suggestion item from list is clicked.
  onChange: (value: string) => void;
  handleSubmit: (args: {
    term: string;
    field: string;
    union?: UnionTypes;
    querystring?: string;
  }) => void;
  renderSubmitButton?: (props: ButtonProps) => React.ReactElement;
}

export const TextInput: React.FC<TextInputProps> = ({
  colorScheme = 'primary',
  size,
  handleSubmit,
  onChange,
  searchOptionsList,
  setSearchOptionsList,
  ...props
}) => {
  // input value (not affected by search type (exact, etc))
  const [inputValue, setInputValue] = useState('');

  return (
    <Box width='100%'>
      {/* Input field with suggestions matching the search term. */}
      <PredictiveSearch
        ariaLabel='Search for datasets or tools'
        placeholder='Search for datasets or tools'
        size={size}
        inputValue={inputValue}
        onChange={value => {
          onChange(value);
          setInputValue(value);
        }}
        // isDisabled={!searchTerm | !searchOption}
        handleSubmit={(term, field) => {
          handleSubmit({ term, field, querystring: term });
        }}
        {...props}
      />
    </Box>
  );
};
