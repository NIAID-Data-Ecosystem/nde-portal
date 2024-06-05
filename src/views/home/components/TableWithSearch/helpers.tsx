import { TableData } from '.';

export const formatTypeName = (type: TableData['type']) => {
  if (type === 'ResourceCatalog') {
    return 'Resource Catalog';
  } else {
    return 'Dataset Repository';
  }
};

export const formatDomainName = (domain: TableData['domain']) => {
  if (!domain) {
    return '';
  }
  const type_lower = domain.toLowerCase();
  if (type_lower === 'iid') {
    return 'IID';
  } else if (type_lower === 'generalist') {
    return 'Generalist';
  } else {
    return type_lower.charAt(0).toUpperCase() + type_lower.slice(1);
  }
};

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
      const existingEntry = acc.find(
        a => a.value.toLowerCase() === value.toLowerCase(),
      );
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
