import { DiseasePageProps } from 'src/views/diseases/types';
import {
  SelectedFilterType,
  SelectedFilterTypeValue,
} from 'src/views/search/components/filters/types';

export const extractDiseaseTermsFromQuery = (
  query: string,
): {
  healthConditionTerms: string[];
  infectiousAgentTerms: string[];
} => {
  const healthConditionTerms: string[] = [];
  const infectiousAgentTerms: string[] = [];

  // Match healthCondition.name:"term" or healthCondition.name:'term'
  const healthConditionMatches = query.match(
    /healthCondition\.name:\s*["']([^"']+)["']/gi,
  );
  if (healthConditionMatches) {
    healthConditionMatches.forEach(match => {
      const term = match.replace(
        /healthCondition\.name:\s*["']([^"']+)["']/i,
        '$1',
      );
      healthConditionTerms.push(term.toLowerCase());
    });
  }

  // Match infectiousAgent.name:"term" or infectiousAgent.name:'term'
  const infectiousAgentMatches = query.match(
    /infectiousAgent\.name:\s*["']([^"']+)["']/gi,
  );
  if (infectiousAgentMatches) {
    infectiousAgentMatches.forEach(match => {
      const term = match.replace(
        /infectiousAgent\.name:\s*["']([^"']+)["']/i,
        '$1',
      );
      infectiousAgentTerms.push(term.toLowerCase());
    });
  }

  return { healthConditionTerms, infectiousAgentTerms };
};

export const extractDiseaseTermsFromFilters = (
  filters: SelectedFilterType,
): {
  healthConditionTerms: string[];
  infectiousAgentTerms: string[];
} => {
  const normalize = (values: SelectedFilterTypeValue[] = []): string[] => {
    return values.flatMap(v => {
      if (typeof v === 'string') {
        return v.toLowerCase();
      }
      if (typeof v === 'object' && v !== null) {
        // flatten nested string arrays
        return Object.values(v)
          .flat()
          .map(s => s.toLowerCase());
      }
      return [];
    });
  };

  return {
    healthConditionTerms: normalize(filters['healthCondition.name.raw']),
    infectiousAgentTerms: normalize(filters['infectiousAgent.displayName.raw']),
  };
};

export const doesDiseaseMatchTerms = (
  disease: DiseasePageProps,
  healthConditionTerms: string[],
  infectiousAgentTerms: string[],
): boolean => {
  if (!disease.query?.q) {
    return false;
  }

  const diseaseQuery = disease.query.q.toLowerCase();

  // Check if any health condition terms are found in the disease query
  const hasHealthConditionMatch =
    healthConditionTerms.length === 0 ||
    healthConditionTerms.some(term => diseaseQuery.includes(term));

  // Check if any infectious agent terms are found in the disease query
  const hasInfectiousAgentMatch =
    infectiousAgentTerms.length === 0 ||
    infectiousAgentTerms.some(term => diseaseQuery.includes(term));

  // Return true if there are matching terms and at least one category matches
  const hasAnyTerms =
    healthConditionTerms.length > 0 || infectiousAgentTerms.length > 0;

  return hasAnyTerms && (hasHealthConditionMatch || hasInfectiousAgentMatch);
};

export const getMatchingDiseases = (
  diseases: DiseasePageProps[],
  searchQuery: string,
  selectedFilters: SelectedFilterType,
): DiseasePageProps[] => {
  // Extract terms from both query and filters
  const queryTerms = extractDiseaseTermsFromQuery(searchQuery);
  const filterTerms = extractDiseaseTermsFromFilters(selectedFilters);

  // Combine terms from both sources
  const allHealthConditionTerms = [
    ...queryTerms.healthConditionTerms,
    ...filterTerms.healthConditionTerms,
  ];

  const allInfectiousAgentTerms = [
    ...queryTerms.infectiousAgentTerms,
    ...filterTerms.infectiousAgentTerms,
  ];

  // If no disease-related terms are found, return empty array
  if (
    allHealthConditionTerms.length === 0 &&
    allInfectiousAgentTerms.length === 0
  ) {
    return [];
  }

  // Filter diseases based on matching terms
  return diseases.filter(disease =>
    doesDiseaseMatchTerms(
      disease,
      allHealthConditionTerms,
      allInfectiousAgentTerms,
    ),
  );
};
