import React, { useEffect, useState } from 'react';
import {
  usePredictiveSearch,
  usePredictiveSearchResponse,
} from 'src/components/search-with-predictive-text';
import { unionOptions } from 'src/components/advanced-search/utils';
import { UnionTypes } from '../../SortableWithCombine/types';
import MetadataFieldsConfig from 'configs/resource-fields.json';

export interface SearchOption {
  name: string;
  value: string;
  description: string;
  type?: string;
  example?: string;
  transformValue?: (value: string, field?: string) => string;
  options?: SearchOption[];
}

export interface AdvancedSearchContextProps
  extends usePredictiveSearchResponse {
  searchOptionsList: SearchOption[];
  setSearchOptionsList: (arg: SearchOption[]) => void;
  searchOption: SearchOption;
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
  searchOptions: SearchOption[];
}

export const AdvancedSearchFormContext: React.FC<AdvancedSearchFormProps> = ({
  term,
  field,
  searchOptions: defaultSearchOptions,
  children,
}) => {
  const getSearchOption = (searchOptions: SearchOption[]) =>
    searchOptions.reduce((r, v) => {
      if (v.options && v.options.length) {
        let defaultSubItem = v.options.filter(item => item.value === 'default');
        if (defaultSubItem.length) {
          r = defaultSubItem[0];
        }
      } else if (v.value === 'default') {
        r = v;
      }
      return r;
    }, {} as SearchOption);

  const predictiveSearchProps = usePredictiveSearch(term, field, false);
  const { searchField } = predictiveSearchProps;

  const [searchOptionsList, setSearchOptionsList] =
    useState(defaultSearchOptions);

  const [searchOption, setSearchOption] = useState<
    AdvancedSearchContextProps['searchOption']
  >(() => getSearchOption(searchOptionsList));

  const [unionType, setUnionType] = useState<typeof unionOptions[number] | ''>(
    '',
  );

  const fieldDetails = MetadataFieldsConfig.find(
    f => f.property === searchField,
  );

  // Update options based on field.
  useEffect(() => {
    setSearchOptionsList(() => {
      if (fieldDetails?.format === 'enum' || fieldDetails?.type === 'date') {
        return defaultSearchOptions.map(item => {
          return { ...item, options: undefined };
        });
      }
      return defaultSearchOptions;
    });
  }, [defaultSearchOptions, searchField, fieldDetails]);

  // Update default search options when options list changes
  useEffect(() => {
    setSearchOption(getSearchOption(searchOptionsList));
  }, [searchOptionsList]);

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
