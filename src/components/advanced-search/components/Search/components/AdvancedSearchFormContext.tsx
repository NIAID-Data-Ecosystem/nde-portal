import React from 'react';
import {
  usePredictiveSearch,
  usePredictiveSearchResponse,
} from 'src/components/search-with-predictive-text';

const AdvancedSearchContext = React.createContext<
  usePredictiveSearchResponse | undefined
>(undefined);
AdvancedSearchContext.displayName = 'AdvancedSearchContext';

interface AdvancedSearchFormProps {
  term?: string;
  field?: string;
}

export const AdvancedSearchFormContext: React.FC<AdvancedSearchFormProps> = ({
  term,
  field,
  children,
}) => {
  return (
    <AdvancedSearchContext.Provider value={usePredictiveSearch(term, field)}>
      {children}
    </AdvancedSearchContext.Provider>
  );
};

export const useAdvancedSearchContext = () => {
  const context = React.useContext(AdvancedSearchContext);
  if (context === undefined) {
    throw new Error(
      'useAdvancedSearch must be wrapped with <AdvancedSearchFormContext/>',
    );
  }
  return context;
};
