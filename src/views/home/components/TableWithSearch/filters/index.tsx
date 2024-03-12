import { Stack } from '@chakra-ui/react';
import { RadioFilter } from './radio-filter';
import { TableData } from '..';
import { useMemo } from 'react';
import {
  getCollectionTypes,
  getConditionsOfAccess,
  getDataTypes,
} from './helpers';
import { CheckboxList } from './checkbox-list';

interface TableFiltersProps {
  data: TableData[];
  filters: {} | Record<keyof TableData, string[]>;
  updateFilter: (filter: { [key: string]: string[] }) => void;
}
export const Filters = ({ data, filters, updateFilter }: TableFiltersProps) => {
  // Data types: ResourceCatalog, Repository
  const dataTypes = useMemo(() => getDataTypes({ data }), [data]);

  // Collection corresponds to data['type] field: iid, generalist, other CollectionType
  const collections = useMemo(() => getCollectionTypes({ data }), [data]);

  // Conditions of access: Open, Restricted, Closed, Embargoed
  const conditionsOfAccess = useMemo(
    () => getConditionsOfAccess({ data }),
    [data],
  );

  return (
    <Stack
      direction='row'
      spacing={{ base: 1, lg: 4 }}
      flex={1}
      alignItems='center'
      flexWrap='wrap'
      minW={{ base: 'unset', sm: '420px' }}
    >
      {/* <!-- Data type radio  --> */}
      {dataTypes.length > 0 && (
        <RadioFilter
          defaultValue={dataTypes[0].value}
          options={dataTypes}
          handleChange={value => {
            updateFilter({ dataType: value === 'all' ? [] : [value] });
          }}
        />
      )}

      {/* <!-- Collection types checkboxes --> */}
      {collections.length > 0 && (
        <CheckboxList
          label='Collection Type'
          property='type'
          options={collections}
          selectedOptions={filters?.['type' as keyof typeof filters] || []}
          handleChange={updateFilter}
        />
      )}

      {/* <!-- Conditions of Access types checkboxes --> */}
      {conditionsOfAccess.length > 0 && (
        <CheckboxList
          label='Conditions of Access'
          property='conditionsOfAccess'
          options={conditionsOfAccess}
          selectedOptions={
            filters?.['conditionsOfAccess' as keyof typeof filters] || []
          }
          handleChange={updateFilter}
        />
      )}
    </Stack>
  );
};
