import {
  DiseasePageProps,
  DiseaseCollectionApiResponse,
} from 'src/views/diseases/types';
import {
  SelectedFilterType,
  SelectedFilterTypeValue,
} from 'src/views/search/components/filters/types';

// Get Strapi base URL with error handling
const getStrapiBaseUrl = (): string => {
  const url =
    process.env.NEXT_PUBLIC_STRAPI_API_URL ||
    'https://data.niaid.nih.gov/strapi';
  return url;
};

// Determine the correct status based on environment
const getContentStatus = (): string => {
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  return isProd ? 'published' : 'draft';
};

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
      healthConditionTerms.push(term);

      // Add individual words for better matching
      const words = term.split(/\s+/).filter(word => word.length > 2);
      healthConditionTerms.push(...words);
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
      infectiousAgentTerms.push(term);

      // Add individual words for better matching
      const words = term.split(/\s+/).filter(word => word.length > 2);
      infectiousAgentTerms.push(...words);
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
        const terms: string[] = [];

        // Split by common separators and extract meaningful terms
        const splitTerms = v
          .split(/[|,;]/)
          .map(term => term.trim())
          .filter(term => term.length > 0);

        splitTerms.forEach(term => {
          terms.push(term);
          // Add individual words for better matching
          const words = term.split(/\s+/).filter(word => word.length > 2);
          terms.push(...words);
        });

        return terms;
      }
      if (typeof v === 'object' && v !== null) {
        // flatten nested string arrays
        return Object.values(v)
          .flat()
          .flatMap(s => {
            if (typeof s === 'string') {
              const terms: string[] = [];
              const splitTerms = s
                .split(/[|,;]/)
                .map(term => term.trim())
                .filter(term => term.length > 0);

              splitTerms.forEach(term => {
                terms.push(term);
                const words = term.split(/\s+/).filter(word => word.length > 2);
                terms.push(...words);
              });

              return terms;
            }
            return [];
          });
      }
      return [];
    });
  };

  return {
    healthConditionTerms: normalize(filters['healthCondition.name.raw']),
    infectiousAgentTerms: normalize(filters['infectiousAgent.displayName.raw']),
  };
};

export const extractGeneralTermsFromQuery = (query: string): string[] => {
  // If query is __all__ or empty, return empty array
  if (!query || query.trim() === '__all__') {
    return [];
  }

  // Remove specific field queries (healthCondition.name, infectiousAgent.name, etc.)
  let cleanQuery = query
    .replace(/healthCondition\.name:\s*["']([^"']+)["']/gi, '')
    .replace(/infectiousAgent\.name:\s*["']([^"']+)["']/gi, '')
    .replace(/\w+\.\w+:\s*["']([^"']+)["']/gi, '') // Remove other field-specific queries
    .replace(/AND|OR|NOT/gi, '') // Remove boolean operators
    .replace(/[()]/g, '') // Remove parentheses
    .trim();

  if (!cleanQuery) {
    return [];
  }

  // Split by spaces and filter out empty strings
  return cleanQuery.split(/\s+/).filter(term => term.length > 2); // Only include terms longer than 2 characters
};

export const shouldShowAllDiseases = (
  searchQuery: string,
  selectedFilters: SelectedFilterType,
): boolean => {
  const isQueryAll = !searchQuery || searchQuery.trim() === '__all__';
  const hasHealthConditionFilters =
    (selectedFilters['healthCondition.name.raw'] || []).length > 0;
  const hasInfectiousAgentFilters =
    (selectedFilters['infectiousAgent.displayName.raw'] || []).length > 0;

  // Show all diseases if query is __all__ and no relevant filters are applied
  return isQueryAll && !hasHealthConditionFilters && !hasInfectiousAgentFilters;
};

// Build Strapi query using $or operator for multiple terms
const buildStrapiOrQuery = (terms: string[]): string => {
  if (terms.length === 0) return '';

  if (terms.length === 1) {
    return `filters[query][$containsi]=${encodeURIComponent(terms[0])}`;
  }

  // Use $or operator for multiple terms
  const orConditions = terms
    .map(
      (term, index) =>
        `filters[$or][${index}][query][$containsi]=${encodeURIComponent(term)}`,
    )
    .join('&');

  return orConditions;
};

export const fetchDiseasesByTerms = async (
  terms: string[],
): Promise<DiseasePageProps[]> => {
  try {
    if (terms.length === 0) return [];

    const baseUrl = getStrapiBaseUrl();
    const status = getContentStatus();

    // Remove duplicates and filter out very short terms
    const uniqueTerms = Array.from(
      new Set(terms.filter(term => term.length > 2)),
    );

    if (uniqueTerms.length === 0) return [];

    const queryString = buildStrapiOrQuery(uniqueTerms);
    const url = `${baseUrl}/api/diseases?${queryString}&status=${status}&populate=*&sort=title:asc`;

    console.log('Strapi query URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch diseases by terms: ${response.status}`);
    }

    const apiResponse: DiseaseCollectionApiResponse<DiseasePageProps[]> =
      await response.json();

    return apiResponse.data || [];
  } catch (error) {
    console.error(`Error fetching diseases by terms:`, error);
    return [];
  }
};

export const fetchMatchingDiseasesByTerms = async (
  searchTerms: string[],
  shouldShowAll: boolean,
): Promise<DiseasePageProps[]> => {
  try {
    if (shouldShowAll) {
      // Import the function from helpers to avoid duplication
      const { fetchAllDiseasePages } = await import(
        'src/views/diseases/helpers'
      );
      return await fetchAllDiseasePages();
    }

    if (searchTerms.length === 0) {
      return [];
    }

    const results = await fetchDiseasesByTerms(searchTerms);

    return results;
  } catch (error) {
    console.error('Error fetching matching diseases by terms:', error);
    return [];
  }
};
