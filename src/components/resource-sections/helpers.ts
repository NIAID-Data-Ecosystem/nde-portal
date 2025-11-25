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
// Safely get a nested value using a dot-separated path (e.g. "sample.collectionSize")
const getValueByPath = (obj: unknown, path: string): unknown => {
  if (!obj || !path) return undefined;

  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as any)[key];
    }
    return undefined;
  }, obj);
};

// Check if value exists and is non-empty
const hasNonEmptyValue = (value: unknown): boolean => {
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
