import { TableData } from '..';
import { useMemo } from 'react';
import { getFilterData } from '../helpers';
import { CheckboxList } from 'src/components/checkbox-list';
import { formatDomainName, formatTypeName } from '../helpers';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';

interface TableFiltersProps {
  data: TableData[];
  filters: { name: string; value: string; property: string }[];
  updateFilter: (filters: {
    name: string;
    value: string;
    property: string;
  }) => void;
}

export const Filters = ({ data, filters, updateFilter }: TableFiltersProps) => {
  // Data types: ResourceCatalog, Repository
  const types = useMemo(
    () =>
      getFilterData({
        data,
        property: 'type',
        formatName: (str: TableData['type']) =>
          str ? formatTypeName(str) : '',
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
          handleChange={props => updateFilter({ ...props, property: 'type' })}
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
          handleChange={props => updateFilter({ ...props, property: 'domain' })}
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
          handleChange={props =>
            updateFilter({ ...props, property: 'conditionsOfAccess' })
          }
        />
      )}
    </>
  );
};
