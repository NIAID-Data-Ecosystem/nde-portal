import { TableData } from '..';
import { getDataTypeName, getRepositoryTypeName } from '../helpers';

export const getFilterData = <T extends keyof TableData>({
  data,
  property,
  formatName,
}: {
  data: TableData[];
  property: T;
  formatName: (value: TableData[T]) => string;
}) => {
  return data.reduce((acc, item) => {
    const value = item[property];
    if (value) {
      // Check if this value is already accounted for
      const existingEntry = acc.find(a => a.value === value);
      if (!existingEntry) {
        // Add new entry for this unique value
        acc.push({
          name: formatName(value),
          value: value,
          count: 1,
        });
      } else {
        // Increment count for existing entry
        existingEntry!.count++;
      }
    }
    return acc;
  }, [] as { name: string; value: string; count: number }[]);
};

// Function to get data types with counts
export const getDataTypes = ({ data }: { data: TableData[] }) => {
  const filters = getFilterData({
    data,
    property: 'dataType',
    formatName: (str: TableData['dataType']) =>
      str ? getDataTypeName(str) : '',
  });
  return [{ name: 'All', value: 'all', count: data.length }, ...filters];
};

// Function to get collection types with counts
export const getCollectionTypes = ({ data }: { data: TableData[] }) => {
  return getFilterData({
    data,
    property: 'type',
    formatName: (str: TableData['type']) => {
      if (str === 'iid' || str === 'generalist') {
        return getRepositoryTypeName(str);
      }
      return str ? str : '';
    },
  }).sort((a, b) => a.name.localeCompare(b.name));
};

// Function to get collection types with counts
export const getConditionsOfAccess = ({ data }: { data: TableData[] }) => {
  return getFilterData({
    data,
    property: 'conditionsOfAccess',
    formatName: (str: TableData['conditionsOfAccess']) =>
      str ? str?.charAt(0).toUpperCase() + str?.slice(1) : '',
  });
};
