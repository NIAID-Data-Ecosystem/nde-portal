import { useQuery } from '@tanstack/react-query';
import { DiseasePageProps } from 'src/views/diseases/types';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import {
  extractDiseaseTermsFromQuery,
  extractDiseaseTermsFromFilters,
  extractGeneralTermsFromQuery,
  shouldShowAllDiseases,
  fetchMatchingDiseasesByTerms,
} from '../utils/extract-disease-related-terms';

interface UseDiseaseDataOptions {
  searchQuery: string;
  selectedFilters: SelectedFilterType;
  enabled?: boolean;
}

export const useDiseaseData = ({
  searchQuery,
  selectedFilters,
  enabled = true,
}: UseDiseaseDataOptions) => {
  const shouldShowAll = shouldShowAllDiseases(searchQuery, selectedFilters);

  // Extract all relevant terms
  const queryTerms = extractDiseaseTermsFromQuery(searchQuery);
  const filterTerms = extractDiseaseTermsFromFilters(selectedFilters);
  const generalTerms = extractGeneralTermsFromQuery(searchQuery);

  // Combine all terms for searching
  const allSearchTerms = [
    ...queryTerms.healthConditionTerms,
    ...queryTerms.infectiousAgentTerms,
    ...filterTerms.healthConditionTerms,
    ...filterTerms.infectiousAgentTerms,
    ...generalTerms,
  ].filter(Boolean);

  const {
    data: matchingDiseases = [],
    isLoading,
    error,
  } = useQuery<DiseasePageProps[], Error>({
    queryKey: [
      'diseases',
      { shouldShowAll, searchTerms: allSearchTerms.sort() },
    ],
    queryFn: () => fetchMatchingDiseasesByTerms(allSearchTerms, shouldShowAll),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    diseases: matchingDiseases,
    isLoading,
    error,
    hasMatchingDiseases: matchingDiseases.length > 0,
  };
};
