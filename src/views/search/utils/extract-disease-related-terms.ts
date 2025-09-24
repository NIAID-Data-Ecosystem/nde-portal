import {
  DiseasePageProps,
  DiseaseCollectionApiResponse,
} from 'src/views/diseases/types';
import {
  SelectedFilterType,
  SelectedFilterTypeValue,
} from 'src/views/search/components/filters/types';

const CONFIG = {
  strapiUrl:
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    'https://data.niaid.nih.gov/strapi',
  getStatus: () =>
    process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'published' : 'draft',
  minTermLength: 2,
};

// Generic field extraction function
const extractFieldTerms = (query: string, fieldName: string): string[] => {
  const pattern = new RegExp(`${fieldName}\\s*:\\s*["']([^"']+)["']`, 'gi');
  const matches = query.match(pattern) || [];

  return matches.flatMap(match => {
    const term = match.replace(pattern, '$1');
    return [
      term,
      ...term.split(/\s+/).filter(word => word.length > CONFIG.minTermLength),
    ];
  });
};

export const extractDiseaseTermsFromQuery = (query: string) => ({
  healthConditionTerms: extractFieldTerms(query, 'healthCondition\\.name'),
  infectiousAgentTerms: extractFieldTerms(query, 'infectiousAgent\\.name'),
});

// Generic filter normalization function
const normalizeFilterValues = (
  values: SelectedFilterTypeValue[] = [],
): string[] => {
  return values.flatMap(value => {
    if (typeof value === 'string') {
      const splitTerms = value
        .split(/[|,;]/)
        .map(term => term.trim())
        .filter(Boolean);
      return splitTerms.flatMap(term => [
        term,
        ...term.split(/\s+/).filter(word => word.length > CONFIG.minTermLength),
      ]);
    }

    if (typeof value === 'object' && value !== null) {
      return Object.values(value)
        .flat()
        .flatMap(s => {
          if (typeof s !== 'string') return [];
          const splitTerms = s
            .split(/[|,;]/)
            .map(term => term.trim())
            .filter(Boolean);
          return splitTerms.flatMap(term => [
            term,
            ...term
              .split(/\s+/)
              .filter(word => word.length > CONFIG.minTermLength),
          ]);
        });
    }

    return [];
  });
};

export const extractDiseaseTermsFromFilters = (
  filters: SelectedFilterType,
) => ({
  healthConditionTerms: normalizeFilterValues(
    filters['healthCondition.name.raw'],
  ),
  infectiousAgentTerms: normalizeFilterValues(
    filters['infectiousAgent.displayName.raw'],
  ),
});

export const extractGeneralTermsFromQuery = (query: string): string[] => {
  if (!query || query.trim() === '__all__') return [];

  const cleanQuery = query
    .replace(/\w+\.\w+:\s*["']([^"']+)["']/gi, '') // Remove field-specific queries
    .replace(/\b(AND|OR|NOT)\b/gi, '') // Remove boolean operators
    .replace(/[()]/g, '') // Remove parentheses
    .replace(/["']/g, '') // Remove quotes
    .trim();

  return cleanQuery
    ? cleanQuery.split(/\s+/).filter(term => term.length > CONFIG.minTermLength)
    : [];
};

export const shouldShowAllDiseases = (
  searchQuery: string,
  selectedFilters: SelectedFilterType,
): boolean => {
  const isQueryAll = !searchQuery || searchQuery.trim() === '__all__';
  const hasRelevantFilters = [
    'healthCondition.name.raw',
    'infectiousAgent.displayName.raw',
  ].some(key => (selectedFilters[key] || []).length > 0);

  return isQueryAll && !hasRelevantFilters;
};

// Normalize search terms
const normalizeSearchTerms = (terms: string[]): string[] => {
  const normalizedTerms = new Set<string>();

  terms.forEach(term => {
    if (!term || term.length <= 1) return;

    // Add original term
    normalizedTerms.add(term);
  });

  return Array.from(normalizedTerms);
};

// Build Strapi query
const buildStrapiQuery = (terms: string[]): string => {
  if (terms.length === 0) return '';

  if (terms.length === 1) {
    return `filters[query][$containsi]=${encodeURIComponent(terms[0])}`;
  }

  return terms
    .map(
      (term, index) =>
        `filters[$or][${index}][query][$containsi]=${encodeURIComponent(term)}`,
    )
    .join('&');
};

// Generic fetch function
const fetchFromStrapi = async (
  queryString: string,
): Promise<DiseasePageProps[]> => {
  try {
    const url = `${
      CONFIG.strapiUrl
    }/api/diseases?${queryString}&status=${CONFIG.getStatus()}&populate=*&sort=title:asc`;
    console.log('Strapi query URL:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Strapi request failed: ${response.status}`);
    }

    const apiResponse: DiseaseCollectionApiResponse<DiseasePageProps[]> =
      await response.json();
    return apiResponse.data || [];
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    return [];
  }
};

export const fetchDiseasesByTerms = async (
  terms: string[],
): Promise<DiseasePageProps[]> => {
  if (terms.length === 0) return [];

  const normalizedTerms = normalizeSearchTerms(terms);
  if (normalizedTerms.length === 0) return [];

  const queryString = buildStrapiQuery(normalizedTerms);
  return fetchFromStrapi(queryString);
};

export const fetchMatchingDiseasesByTerms = async (
  searchTerms: string[],
  shouldShowAll: boolean,
): Promise<DiseasePageProps[]> => {
  try {
    if (shouldShowAll) {
      const { fetchAllDiseasePages } = await import(
        'src/views/diseases/helpers'
      );
      return await fetchAllDiseasePages();
    }

    return searchTerms.length === 0
      ? []
      : await fetchDiseasesByTerms(searchTerms);
  } catch (error) {
    console.error('Error fetching matching diseases by terms:', error);
    return [];
  }
};
