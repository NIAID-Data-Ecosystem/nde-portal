import { useQuery } from '@tanstack/react-query';
import { DiseasePageProps } from 'src/views/diseases/types';
import { fetchAllDiseasePages } from 'src/views/diseases/helpers';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import { getMatchingDiseases } from '../utils/extract-disease-related-terms';

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
  const {
    data: allDiseases,
    isLoading,
    error,
  } = useQuery<DiseasePageProps[], Error>({
    queryKey: ['diseases'],
    queryFn: fetchAllDiseasePages,
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter diseases based on search parameters
  const matchingDiseases = allDiseases
    ? getMatchingDiseases(allDiseases, searchQuery, selectedFilters)
    : [];

  return {
    diseases: matchingDiseases,
    isLoading,
    error,
    hasMatchingDiseases: matchingDiseases.length > 0,
  };
};
