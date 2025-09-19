import { CheckboxRootProps } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { useMemo } from 'react';
import { CheckboxList } from 'src/components/checkbox-list';

import { TableData } from '..';
import { getFilterData } from '../helpers';
import { formatDomainName, formatTypeName } from '../helpers';

interface TableFiltersProps {
  colorPalette?: CheckboxRootProps['colorPalette'];
  data: TableData[];
  filters: { name: string; value: string; property: string }[];
  setFilters: React.Dispatch<
    React.SetStateAction<{ name: string; value: string; property: string }[]>
  >;
}

export const Filters = ({
  colorPalette = 'gray',
  data,
  filters,
  setFilters,
}: TableFiltersProps) => {
  // Data types: ResourceCatalog, Repository
  const types = useMemo(
    () =>
      getFilterData({
        data,
        property: 'type',
        formatName: type => formatTypeName(type),
      }),
    [data],
  );

  // Data domains: data['domain'] field: iid, generalist, other CollectionType
  const domains = useMemo(
    () =>
      getFilterData({
        data,
        property: 'domain',
        formatName: (str: TableData['domain']) =>
          str ? formatDomainName(str) : '',
      }),
    [data],
  );

  // Conditions of access: Open, Restricted, Closed, Embargoed
  const conditionsOfAccess = useMemo(
    () =>
      getFilterData({
        data,
        property: 'conditionsOfAccess',
        formatName: (str: TableData['conditionsOfAccess']) =>
          str ? str?.charAt(0).toUpperCase() + str?.slice(1) : '',
      }),
    [data],
  );

  // Helper function to update filters for a specific property
  const handleFilterChange = (
    property: string,
    newFilters: { name: string; value: string; property: string }[],
  ) => {
    setFilters(prevFilters => {
      // Remove filters for the specific property
      const otherFilters = prevFilters.filter(
        filter => filter.property !== property,
      );
      // Combine other filters with the new ones
      const updatedFilters = [...otherFilters, ...newFilters];
      return updatedFilters;
    });
  };

  return (
    <>
      {/* <!-- Types checkboxes --> */}
      {types.length > 0 && (
        <CheckboxList
          label='Type'
          description={SCHEMA_DEFINITIONS['type'].abstract['Dataset']}
          options={types.sort((a, b) => a.name.localeCompare(b.name))}
          selectedOptions={
            filters.filter(item => item.property === 'type') || []
          }
          handleChange={newFilters => handleFilterChange('type', newFilters)}
          showSelectAll
          colorPalette={colorPalette}
          buttonProps={{ colorPalette }}
        />
      )}

      {/* <!-- Domains checkboxes --> */}
      {domains.length > 0 && (
        <CheckboxList
          label='Research Domain'
          description={SCHEMA_DEFINITIONS['domain'].abstract['Dataset']}
          options={domains.sort((a, b) => a.name.localeCompare(b.name))}
          selectedOptions={
            filters.filter(item => item.property === 'domain') || []
          }
          handleChange={newFilters => handleFilterChange('domain', newFilters)}
          showSelectAll
          colorPalette={colorPalette}
          buttonProps={{ colorPalette }}
        />
      )}

      {/* <!-- Conditions of Access types checkboxes --> */}
      {conditionsOfAccess.length > 0 && (
        <CheckboxList
          label='Access'
          description={
            SCHEMA_DEFINITIONS['conditionsOfAccess'].abstract['Dataset']
              .charAt(0)
              .toUpperCase() +
            SCHEMA_DEFINITIONS['conditionsOfAccess'].abstract['Dataset'].slice(
              1,
            ) +
            '.'
          }
          options={conditionsOfAccess.sort((a, b) =>
            a.name.localeCompare(b.name),
          )}
          selectedOptions={
            filters.filter(item => item.property === 'conditionsOfAccess') || []
          }
          handleChange={newFilters =>
            handleFilterChange('conditionsOfAccess', newFilters)
          }
          showSelectAll
          colorPalette={colorPalette}
          buttonProps={{ colorPalette }}
        />
      )}
    </>
  );
};
