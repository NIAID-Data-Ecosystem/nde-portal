import { Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  SelectedFilterType,
  SelectedFilterTypeValue,
} from 'src/views/search-results-page/components/filters/types';
import { useQuery } from '@tanstack/react-query';
import {
  ONTOLOGY_BROWSER_OPTIONS,
  searchOntologyAPI,
  SearchParams,
} from '../helpers';

const extractSubstringFromQueryString = (term: string, fieldName: string) => {
  const regex = new RegExp(`${fieldName}:"([^"]+)"(?=\\s*(AND|OR|NOT|$))`);
  const match = term.match(regex);
  return match ? match[1] : null;
};

const extractValueFromSelectedFilters = (
  term: SelectedFilterTypeValue,
  fieldName: string,
) => {
  if (typeof term === 'object') {
    return '';
  }
  if (typeof term === 'string') {
    if (fieldName?.includes('displayName')) {
      if (term.includes(' | ')) {
        return term.split(' | ')[1];
      } else {
        return term;
      }
    }
  }
};

const findRelatedOntology = (
  {
    filters,
    querystring,
  }: { filters: SelectedFilterType; querystring: string },
  OntologyBrowserOptions: {
    name: string;
    value: string;
    relatedPortalSchemaProperties: string[];
  }[],
) => {
  const selectedFilterKeys = Object.keys(filters);

  // If there are no filters selected, return early
  if (selectedFilterKeys.length === 0) {
    return {
      hasOntology: false,
    };
  }

  // Loop through the OntologyBrowserOptions to find a match
  for (const ontology of OntologyBrowserOptions) {
    for (const property of ontology.relatedPortalSchemaProperties) {
      // Check if the filter has any selected values
      if (filters?.[property]?.length > 0) {
        const term = extractValueFromSelectedFilters(
          filters?.[property][0],
          property,
        );
        return {
          hasOntology: true,
          ontology,
          property,
          term,
        };
      }

      // Check if the querystring contains the property
      if (querystring && querystring.includes(property)) {
        return {
          hasOntology: true,
          ontology,
          property,
          term: extractSubstringFromQueryString(querystring, property),
        };
      }
    }
  }

  // If no match found, return false
  return {
    hasOntology: false,
  };
};

export const OntologyBrowserPopup = ({
  querystring,
  selectedFilters,
}: {
  querystring: string;
  selectedFilters: SelectedFilterType;
}) => {
  // Find the related ontology based on the selected filters
  const { hasOntology, ontology, term } = findRelatedOntology(
    { querystring, filters: selectedFilters },
    ONTOLOGY_BROWSER_OPTIONS,
  );

  // Fetch suggestions based on found value.
  const {
    error,
    isLoading,
    data: suggestions,
  } = useQuery({
    queryKey: ['ontology-browser-search', term, ontology?.value],
    queryFn: () =>
      searchOntologyAPI({
        q: term || '',
        ontology: (ontology?.value
          ? [ontology?.value]
          : []) as SearchParams['ontology'],
        queryFields: ['label', 'short_form', 'obo_id', 'iri'],
      }),
    refetchOnWindowFocus: false,
    enabled: hasOntology && !!term && !!ontology?.value,
  });

  if (!hasOntology) {
    return null;
  }

  return (
    <NextLink
      href={{
        pathname: `/ontology-browser`,
        query: {
          q: querystring,
          id: suggestions?.[0]?.short_form || '',
          onto: ontology?.value,
        },
      }}
    >
      <Button
        size='sm'
        variant='link'
        colorScheme='blue'
        py={1}
        px={2}
        color='link.color'
        _hover={{
          color: 'link.color',
          textDecoration: 'none',
          borderRadius: 'semi',
          bg: 'blue.50',
        }}
      >
        use ontology browser?
      </Button>
    </NextLink>
  );
};