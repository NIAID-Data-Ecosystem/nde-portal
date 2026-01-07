import { useQuery } from '@tanstack/react-query';
import type { DocumentationProps } from '../types';
import { fetchDocumentation } from '../services/api';

interface UseDocumentationOptions {
  slug: string | string[];
  initialData?: DocumentationProps;
}

// Fetch documentation for a specific page
export const useDocumentation = ({
  slug,
  initialData,
}: UseDocumentationOptions) => {
  return useQuery<DocumentationProps[] | null, Error, DocumentationProps>({
    queryKey: ['doc', { slug }],
    queryFn: () => fetchDocumentation(slug),
    placeholderData: initialData ? [initialData] : undefined,
    select: data => {
      if (!data || !data[0]) {
        return initialData as DocumentationProps;
      }
      return data[0];
    },
    refetchOnWindowFocus: false,
  });
};
