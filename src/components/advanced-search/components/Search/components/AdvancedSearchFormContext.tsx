import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import { SearchTypesConfigProps } from '../search-types-config';
import { QueryValue } from 'src/components/advanced-search/types';
import { filterSearchTypes } from './SearchOptions/utils';

/**
 * @interface AdvancedSearchContextProps:
 *
 * @queryValue QueryValue object containing the current query value (field, term, querystring, union).
 * @searchTypeOptions List of search types options to display.
 * @selectedFieldDetails Details of the selected field from the API including type, format and count of records.
 * @selectedSearchType The currently selected search type such as (contains, exact, etc).
 * @setSelectedSearchType Function to set the selected search type.
 * @updateQueryValue Function to update the query value.
 * @onReset Function to reset the queryValue and search type.
 */

export interface AdvancedSearchContextProps {
  queryValue: QueryValue;
  searchTypeOptions: SearchTypesConfigProps[];
  selectedFieldDetails?: (typeof MetadataFieldsConfig)[number];
  selectedSearchType: SearchTypesConfigProps;
  setSelectedSearchType: (
    arg: AdvancedSearchContextProps['selectedSearchType'],
  ) => void;
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
  const [queryValue, setQueryValue] = useState<QueryValue>({
    term: '',
    field: '',
    querystring: '',
    union: '',
  });

  const fields = [
    {
      name: 'All Fields',
      property: '',
      count: 0,
      value: '',
      type: '',
      format: '',
    },
    ...MetadataFieldsConfig,
  ];
  const selectedFieldDetails = fields.find(
    f => f.property === queryValue.field,
  );

  // Get default search type for the field type.
  const getSearchOption: any = useCallback(
    (searchTypeOptions: SearchTypesConfigProps[]) => {
      const filteredSearchTypes = filterSearchTypes(
        searchTypeOptions,
        queryValue.field,
      );

      let defaultSearchOption = filteredSearchTypes[0];
      filteredSearchTypes.forEach(searchType => {
        if (searchType.isDefault) {
          // if there are suboptions look for the default.
          if (searchType?.options?.length) {
            const defaultSubOption = searchType.options.find(
              option => option.isDefault,
            );
            if (defaultSubOption) {
              defaultSearchOption = defaultSubOption;
            }
          } else {
            defaultSearchOption = searchType;
          }
        }
      });
      return defaultSearchOption;
    },
    [queryValue.field],
  );

  const [selectedSearchType, setSelectedSearchType] =
    useState<SearchTypesConfigProps>(getSearchOption(searchTypeOptions));

  const updateQueryValue = React.useCallback(
    (update: Partial<AdvancedSearchContextProps['queryValue']>) => {
      setQueryValue(prev => {
        // Transform the querystring according to the selected search type (ex: enquote exact search terms)
        if (
          !prev.querystring &&
          !update.querystring &&
          selectedSearchType?.transformValue
        ) {
          return selectedSearchType.transformValue({ ...prev, ...update });
        }
        return { ...prev, ...update };
      });
    },
    [selectedSearchType],
  );

  // Update toggled search type option when field changes.
  useEffect(() => {
    setSelectedSearchType(prev => {
      if (
        (prev.shouldOmit && prev.shouldOmit(queryValue.field)) ||
        (prev.shouldDisable && prev.shouldDisable(queryValue.field))
      ) {
        return getSearchOption(searchTypeOptions);
      } else {
        return prev;
      }
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
