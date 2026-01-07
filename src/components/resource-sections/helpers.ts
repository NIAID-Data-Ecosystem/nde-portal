import { FormattedResource } from 'src/utils/api/types';

export interface Route {
  title: string;
  hash: string;
  properties: (keyof FormattedResource)[];
  ui?: {
    showInNavigation: boolean;
    showEmptyState: boolean;
    isCollapsible: boolean;
  };
}

// Helper function determines whether to show section in nav based on availability of metadata.
// Get a nested value using a dot-separated path (e.g. "sample.collectionSize")
export const getValueByPath = (obj: unknown, path: string): unknown => {
  if (obj == null || !path) return undefined;

  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;

    // If current value is an array, try to pluck the property from each element
    if (Array.isArray(acc)) {
      const mapped = acc
        .map(item => {
          if (item && typeof item === 'object' && key in (item as any)) {
            return (item as any)[key];
          }
          return undefined;
        })
        .filter(v => v !== undefined);

      if (mapped.length === 0) return undefined;
      if (mapped.length === 1) return mapped[0]; // unwrap single
      return mapped;
    }

    // Normal object case
    if (typeof acc === 'object' && key in (acc as any)) {
      return (acc as any)[key];
    }

    return undefined;
  }, obj);
};
// Check if value exists and is non-empty
export const hasNonEmptyValue = (value: unknown): boolean => {
  if (value == null) return false; // null or undefined

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
};

// Helper function determines whether to show section in nav based on availability of metadata.
export const showSection = (section: Route, data?: FormattedResource) => {
  if (
    !section ||
    !section.properties ||
    section.ui?.showInNavigation === false
  ) {
    return false;
  }

  // Check which metadata properties actually have values.
  const isEmpty =
    data &&
    section.properties.filter(prop => {
      const value = getValueByPath(data, String(prop));
      return hasNonEmptyValue(value);
    }).length === 0;

  // Show section if at least one property has a non-empty value or if configured to show empty state (`showEmptyState`).
  return !isEmpty || (isEmpty && section.ui?.showEmptyState);
};
