import { FetchSearchResultsResponse } from 'src/utils/api/types';

// Helper functions for processing aggregate data for chart visualizations.
export const normalizeAggregateData = (
  apiResponse?: FetchSearchResultsResponse,
) => {
  const facets = apiResponse?.facets;
  return facets;
};
