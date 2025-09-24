import { useQuery } from '@tanstack/react-query';
import { DiseasePageProps } from 'src/views/diseases/types';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import { fetchAllDiseasePages } from 'src/views/diseases/helpers';

interface UseDiseaseDataOptions {
  searchQuery: string;
  selectedFilters: SelectedFilterType;
  enabled?: boolean;
}

const extractSearchTerms = (
  query: string,
  filters: SelectedFilterType,
): string[] => {
  const terms: string[] = [];

  // Extract terms from the search query
  if (query && query.trim() !== '__all__') {
    // Clean the query by removing field-specific syntax and operators
    const cleanQuery = query
      .replace(/\w+\.\w+:\s*["']([^"']+)["']/gi, '$1') // Extract values from field:value syntax
      .replace(/\b(AND|OR|NOT)\b/gi, '') // Remove boolean operators
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/["']/g, '') // Remove quotes
      .trim();

    // Split into individual terms and filter out short terms
    if (cleanQuery) {
      terms.push(...cleanQuery.split(/\s+/).filter(term => term.length > 2));
    }
  }

  // Extract terms from health condition and infectious agent filters
  const relevantFilters = [
    'healthCondition.name.raw',
    'infectiousAgent.displayName.raw',
  ];

  relevantFilters.forEach(filterKey => {
    const filterValues = filters[filterKey] || [];
    filterValues.forEach(value => {
      if (typeof value === 'string') {
        // Split filter values by common delimiters and add valid terms
        terms.push(...value.split(/[|,;\s]+/).filter(term => term.length > 2));
      }
    });
  });

  // Remove duplicates
  return [...new Set(terms)];
};

const fetchMatchingDiseases = async (
  searchTerms: string[],
  showAll: boolean,
): Promise<DiseasePageProps[]> => {
  const strapiUrl =
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    'https://data.niaid.nih.gov/strapi';
  const status =
    process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'published' : 'draft';

  try {
    // If showing all diseases or no specific search terms, fetch all records
    if (showAll || searchTerms.length === 0) {
      return await fetchAllDiseasePages();
    }

    // Build Strapi query parameters based on number of search terms
    const queryParams =
      searchTerms.length === 1
        ? // Single term: simple containsi filter
          `filters[query][$containsi]=${encodeURIComponent(searchTerms[0])}`
        : // Multiple terms: OR query across all terms
          searchTerms
            .map(
              (term, index) =>
                `filters[$or][${index}][query][$containsi]=${encodeURIComponent(
                  term,
                )}`,
            )
            .join('&');

    const url = `${strapiUrl}/api/diseases?${queryParams}&status=${status}&populate=*&sort=title:asc`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Strapi request failed: ${response.status}`);
    }

    const apiResponse = await response.json();
    return apiResponse.data || [];
  } catch (error) {
    console.error('Error fetching diseases:', error);
    return []; // Return empty array on error to prevent UI crashes
  }
};

export const useDiseaseData = ({
  searchQuery,
  selectedFilters,
  enabled = true,
}: UseDiseaseDataOptions) => {
  // If no search query exists and no health condition and infectious agent filters are selected, all diseases will be shown.
  const shouldShowAll =
    (!searchQuery || searchQuery.trim() === '__all__') &&
    !['healthCondition.name.raw', 'infectiousAgent.displayName.raw'].some(
      key => (selectedFilters[key] || []).length > 0,
    );

  // Extract all relevant search terms from query and filters
  const searchTerms = extractSearchTerms(searchQuery, selectedFilters);

  // Fetch disease data with caching
  const {
    data: diseases = [],
    isLoading,
    error,
  } = useQuery<DiseasePageProps[], Error>({
    // Query key includes both showAll flag and sorted search terms for caching
    queryKey: ['diseases', { shouldShowAll, searchTerms: searchTerms.sort() }],
    queryFn: () => fetchMatchingDiseases(searchTerms, shouldShowAll),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    diseases,
    isLoading,
    error,
    hasMatchingDiseases: diseases.length > 0,
  };
};
