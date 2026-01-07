import { useQuery } from '@tanstack/react-query';
import type { DocumentationProps, SearchResult } from '../types';
import { searchDocumentation } from '../services/api';
import { searchInMDX } from '../utils/markdown';

// Search documentation
export const useDocumentationSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['docs-search', { term: searchTerm }],
    queryFn: () => searchDocumentation(searchTerm),
    select: (data: DocumentationProps[]): SearchResult[] => {
      if (searchTerm.length === 0) {
        return [];
      }

      return data.map((datum: DocumentationProps) => {
        const slug = Array.isArray(datum.slug) ? datum.slug[0] : datum.slug;

        if (datum.description) {
          const { heading, snippet } = searchInMDX(
            datum.description,
            searchTerm,
          );
          return {
            id: datum.id,
            name: datum.name,
            slug: heading ? `${slug}#${heading}` : slug,
            description: snippet || '',
          };
        }

        return {
          id: datum.id,
          name: datum.name,
          slug,
          description: '',
        };
      });
    },
    refetchOnWindowFocus: false,
    enabled: searchTerm.length > 0,
  });
};
