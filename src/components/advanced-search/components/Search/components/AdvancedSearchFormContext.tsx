import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  usePredictiveSearch,
  usePredictiveSearchResponse,
} from 'src/components/search-with-predictive-text';
import { unionOptions } from 'src/components/advanced-search/utils';
import { UnionTypes } from '../../SortableWithCombine/types';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import { SearchTypesConfigProps } from '../search-types-config';
import { QueryValue } from 'src/components/advanced-search/types';

/**
 * @interface SearchTypesConfigProps:
 *
 * @searchOptions List of search types options to display.
 * @label String used for display for the search type.
 * @description Description of the search type.
 * @isDisabledFor Array of fields to disable this search type for.
 * @omitForFieldType Array of field types to omit this search type for.
 * @isDefault Boolean to indicate if this search type should be the default for the field type.
 * @transformValue Function to transform the value(field, querystring, term, union) using the search type.
 */
export interface AdvancedSearchContextProps {
  searchTypeOptions: SearchTypesConfigProps[];
  selectedSearchType: SearchTypesConfigProps;
  setSelectedSearchType: (
    arg: AdvancedSearchContextProps['selectedSearchType'],
  ) => void;
  queryValue: QueryValue;
  updateQueryValue: (
    arg: Partial<AdvancedSearchContextProps['queryValue']>,
  ) => void;
  onReset: () => void;
}

const AdvancedSearchContext = React.createContext<
  AdvancedSearchContextProps | undefined
>(undefined);
AdvancedSearchContext.displayName = 'AdvancedSearchContext';

export const AdvancedSearchFormContext = ({
  searchTypeOptions,
  children,
}: {
  searchTypeOptions: SearchTypesConfigProps[];
  children: ReactNode;
}) => {
  // const predictiveSearchProps = usePredictiveSearch(term, field, false);
  // console.log('predictiveSearchProps', predictiveSearchProps);
  // const { searchField } = predictiveSearchProps;

  // const [searchOptionsList, setSearchOptionsList] =
  //   useState(defaultSearchOptions);

  // const [searchOption, setSearchOption] = useState<
  //   AdvancedSearchContextProps['searchOption']
  // >(() => getSearchOption(searchOptionsList));

  // const [unionType, setUnionType] = useState<
  //   (typeof unionOptions)[number] | ''
  // >('');

  // const fieldDetails = MetadataFieldsConfig.find(
  //   f => f.property === searchField,
  // );

  // // Update options based on field.
  // useEffect(() => {
  //   setSearchOptionsList(() => {
  //     if (fieldDetails?.format === 'enum' || fieldDetails?.type === 'date') {
  //       return defaultSearchOptions.map(item => {
  //         return { ...item, options: undefined };
  //       });
  //     }
  //     return defaultSearchOptions;
  //   });
  // }, [defaultSearchOptions, searchField, fieldDetails]);

  const [queryValue, setQueryValue] = useState<QueryValue>({
    term: '',
    field: '',
    querystring: '',
    union: '',
  });

  const updateQueryValue = React.useCallback(
    (update: Partial<AdvancedSearchContextProps['queryValue']>) => {
      setQueryValue({ ...queryValue, ...update });
    },
    [queryValue],
  );

  const selectedFieldDetails = !queryValue.field
    ? {
        type: '',
        format: '',
      }
    : MetadataFieldsConfig.find(f => f.property === queryValue.field);

  // Get default search type for the field type.
  const getSearchOption: any = useCallback(
    (searchTypeOptions: SearchTypesConfigProps[]) => {
      const defaultSearchOption = searchTypeOptions.filter(searchType => {
        if (searchType.isDefault) {
          if (searchType?.options?.length) {
            return getSearchOption(searchType.options);
          }
          // if set as default in config, check that the field type doesn't clash.
          else if (
            (searchType.shouldOmit &&
              searchType.shouldOmit(queryValue.field)) ||
            (searchType.shouldDisable &&
              searchType.shouldDisable(queryValue.field))
          ) {
            return;
          } else {
            return searchType;
          }
        }
      });

      return defaultSearchOption[0] || searchTypeOptions[0];
    },
    [queryValue.field],
  );

  const [selectedSearchType, setSelectedSearchType] =
    useState<SearchTypesConfigProps>(getSearchOption(searchTypeOptions));

  // Update toggled search type option when field changes.
  useEffect(() => {
    setSelectedSearchType(prev => {
      if (
        (prev.shouldOmit && prev.shouldOmit(queryValue.field)) ||
        (prev.shouldDisable && prev.shouldDisable(queryValue.field))
      ) {
        return getSearchOption(searchTypeOptions);
      }
      return prev;
    });
  }, [getSearchOption, queryValue.field, searchTypeOptions]);

  const onReset = () => {
    setQueryValue({
      term: '',
      field: '',
      querystring: '',
      union: '',
    });
    setSelectedSearchType(getSearchOption(searchTypeOptions));
  };

  return (
    <AdvancedSearchContext.Provider
      value={{
        queryValue,
        updateQueryValue,
        selectedFieldDetails,
        selectedSearchType,
        setSelectedSearchType,
        searchTypeOptions,
        onReset,
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
