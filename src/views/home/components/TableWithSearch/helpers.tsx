import { TableData } from '.';

export const formatTypeName = (type: TableData['type'][number]) => {
  return type;
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
  formatName?: (value: any) => string;
}) => {
  return data.reduce((acc, item) => {
    const value = item[property];
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          const existingEntry = acc.find(a => {
            return a.value.toLowerCase() === v.toLowerCase();
          });
          if (!existingEntry) {
            // Add new entry for this unique value
            acc.push({
              name: formatName ? formatName(v) : v,
              property,
              value: v,
              count: 1,
            });
          } else {
            // Increment count for existing entry
            existingEntry!.count++;
          }
        });
      } else {
        // Check if this value is already accounted for
        const existingEntry = acc.find(
          a => a.value.toLowerCase() === value.toLowerCase(),
        );
        if (!existingEntry) {
          // Add new entry for this unique value
          acc.push({
            name: formatName ? formatName(value) : value,
            property,

            value: value,
            count: 1,
          });
        } else {
          // Increment count for existing entry
          existingEntry!.count++;
        }
      }
    }
    return acc;
  }, [] as { name: string; property: string; value: string; count: number }[]);
};
