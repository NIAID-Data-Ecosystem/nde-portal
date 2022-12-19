import React, { useState } from 'react';
import {
  usePredictiveSearch,
  usePredictiveSearchResponse,
} from 'src/components/search-with-predictive-text';
import { unionOptions } from 'src/components/advanced-search/utils';
import { UnionTypes } from '../../SortableWithCombine/types';

export interface Option {
  name?: string;
  value?: string;
  description?: string;
  example?: string;
  options?: Option[];
  type?: string;
  transformValue?: (value: string, field?: string) => string;
}

export interface AdvancedSearchContextProps
  extends usePredictiveSearchResponse {
  searchOptionsList: Option[];
  setSearchOptionsList: (arg: Option[]) => void;
  searchOption: Option;
  setSearchOption: (arg: AdvancedSearchContextProps['searchOption']) => void;
  unionType: '' | UnionTypes;
  setUnionType: React.Dispatch<React.SetStateAction<'' | UnionTypes>>;
}

const AdvancedSearchContext = React.createContext<
  AdvancedSearchContextProps | undefined
>(undefined);
AdvancedSearchContext.displayName = 'AdvancedSearchContext';

interface AdvancedSearchFormProps {
  term?: string;
  field?: string;
  searchOptions: Option[];
}

export const AdvancedSearchFormContext: React.FC<AdvancedSearchFormProps> = ({
  term,
  field,
  searchOptions: defaultSearchOptions,
  children,
}) => {
  const predictiveSearchProps = usePredictiveSearch(term, field, false);
  const [searchOptionsList, setSearchOptionsList] =
    useState(defaultSearchOptions);

  const [unionType, setUnionType] = useState<typeof unionOptions[number] | ''>(
    '',
  );

  const defaultItem = defaultSearchOptions.reduce((r, v) => {
    if (v.options) {
      let defaultSubItem = v.options.filter(item => item.value === 'default');
      if (defaultSubItem.length) {
        r = defaultSubItem[0];
      }
    } else if (v.value === 'default') {
      r = v;
    }
    return r;
  }, {});

  const [searchOption, setSearchOption] =
    useState<AdvancedSearchContextProps['searchOption']>(defaultItem);

  return (
    <AdvancedSearchContext.Provider
      value={{
        ...predictiveSearchProps,
        searchOptionsList,
        setSearchOptionsList,
        searchOption,
        setSearchOption,
        unionType,
        setUnionType,
      }}
    >
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
