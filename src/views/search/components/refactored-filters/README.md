# Refactored Filters

This is a simplified, fully independent version of the filters system that
removes complexity while maintaining the same functionality.

## Key Simplifications

### 1. No More `createQueries` Function

**Before (original):**

```typescript
{
  _id: 'healthCondition.name.raw',
  name: 'Health Condition',
  property: 'healthCondition.name.raw',
  createQueries: (id, params, options) => [
    createCommonQuery({ id, queryKey: options?.queryKey || [], params, ...options }),
    createNotExistsQuery({ id, queryKey: options?.queryKey || [], params, ...options }),
  ],
}
```

**After (refactored):**

```typescript
{
  id: 'healthCondition.name.raw',
  name: 'Health Condition',
  property: 'healthCondition.name.raw',
  queryType: 'facet',  // Query building is handled internally
}
```

### 2. Query Types

Instead of passing query-building functions, you simply specify a `queryType`:

- **`facet`** - Regular facet query with exists/not-exists options (most
  filters)
- **`source`** - Special query that includes source metadata
  (includedInDataCatalog)
- **`histogram`** - Date histogram query

### 3. Simplified `useFilterQueries` Hook

The hook now:

- Internally handles all query building based on `queryType`
- Uses React Query's built-in caching and deduplication
- Returns a simpler result structure

**Usage:**

```typescript
const { results, isLoading, isUpdating, error } = useFilterQueries({
  configs: FILTER_CONFIGS,
  params: { q: searchQuery, extra_filter: filterString },
});

// Access results for a specific filter
const healthConditionTerms = results['healthCondition.name.raw']?.terms || [];
```

### 4. Utility Functions

- `filtersToQueryString()` - Convert filter object to API query string
- `queryStringToFilters()` - Parse query string back to filter object
- `getFilterById()` - Get a specific filter config

## File Structure

```
refactored-filters/
├── index.ts              # Main exports
├── types.ts              # Type definitions
├── config.ts             # Filter configurations
├── Filters.tsx           # Main Filters component
├── README.md             # This file
├── components/
│   ├── checkbox.tsx      # Filter checkbox component
│   ├── container.tsx     # Drawer/accordion container
│   ├── filters-chart-toggle.tsx  # Visualization toggle button
│   ├── list.tsx          # Virtualized filter list
│   ├── section.tsx       # Accordion section wrapper
│   └── date-filter/
│       ├── index.tsx     # Main date filter component
│       ├── helpers.ts    # Date utility functions
│       ├── hooks/
│       │   ├── useDateFilterData.ts    # Date data processing
│       │   └── useDateRangeContext.tsx # Date range state context
│       └── components/
│           ├── date-brush.tsx      # @visx brush component
│           ├── date-controls.tsx   # Date range controls
│           ├── date-picker.tsx     # Calendar picker
│           ├── histogram.tsx       # Date histogram chart
│           └── histogram-section.tsx # Histogram wrapper
├── hooks/
│   └── useFilterQueries.ts   # Main data fetching hook
└── utils/
    ├── query-string.ts   # Query string conversion utilities
```

## Migration Guide

To use the refactored filters in a new component:

```typescript
import {
  Filters,
  FILTER_CONFIGS,
  useFilterQueries,
  filtersToQueryString,
  queryStringToFilters,
} from 'src/views/search/components/refactored-filters';
```

The original filters remain in `src/views/search/components/filters/` for
backward compatibility.

## Independence

This folder is **completely independent** from the original `filters/` folder.
All UI components (checkbox, list, section, container, date-filter, etc.) are
included locally. The only external dependencies are:

- Shared UI components from `src/components/` (e.g., SearchInput, Tooltip,
  ScrollContainer)
- Shared visualization components from `src/components/brush/` (BrushHandle
  hook)
- Utility functions from `src/utils/`
- Context providers from the parent search view
