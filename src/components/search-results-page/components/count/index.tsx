import React, { useCallback, useEffect, useState } from 'react';
import { Box, SimpleGrid, Spinner, Text, TextProps } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { formatNumber } from 'src/utils/helpers';
import { queryFilterObject2String, updateRoute } from 'src/components/filters';
import { SelectedFilterType } from 'src/components/filters/types';
import {
  APIResourceType,
  DisplayResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { useQuerySearchResults } from '../../hooks/useSearchResults';

// [COMPONENT INFO]: Displays total results count

interface ResultsCountProps extends TextProps {
  // Total number of results
  total: number;
  // Query string for the search
  querystring: string;
  // Currently selected filters
  selectedFilters: SelectedFilterType;
}

const ResultsCount: React.FC<ResultsCountProps> = ({
  selectedFilters,
  querystring,
}) => {
  const router = useRouter();

  // Hook to fetch search results
  const { data, isLoading, isFetching } = useQuerySearchResults(
    {
      q: querystring,
      extra_filter: queryFilterObject2String(selectedFilters) || '',
      facets: '@type',
      size: 0,
    },
    { refetchOnMount: false, refetchOnWindowFocus: false },
  );

  // State for resource types with their counts
  const [types, setTypes] = useState<
    {
      count: number;
      term: string;
      name: DisplayResourceType;
    }[]
  >([]);

  // State for total of all results
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (data?.total !== undefined) {
      setTotal(data.total);
    }
  }, [data?.total, router]);

  // Effect to update resource types based on fetched data
  useEffect(() => {
    const types =
      data?.facets?.['@type']?.terms.map(type => ({
        count: type.count,
        term: type.term,
        name: formatResourceTypeForDisplay(type.term as APIResourceType),
      })) || [];

    setTypes(prev => {
      if (prev.length === 0) {
        return types;
      } else {
        return prev.map(prevType => {
          // Only update the counts for existing types
          const newType = types.find(type => type.term === prevType.term);
          return {
            ...prevType,
            count: newType?.count || 0,
          };
        });
      }
    });
  }, [data]);

  const handleFilterClick = useCallback(
    (type: string) => {
      // updated filters array with selected type
      const filters = [...(selectedFilters?.['@type'] || [])];
      if (!filters.includes(type)) {
        filters.push(type);

        let updatedFilterString = queryFilterObject2String({
          ...selectedFilters,
          ...{ ['@type']: filters },
        });

        updateRoute(
          {
            from: 1,
            filters: updatedFilterString,
          },
          router,
        );
      }
    },
    [selectedFilters, router],
  );

  const isLoadingTotals = isLoading || isFetching || !router.isReady;
  return (
    <SimpleGrid spacing={2} minChildWidth='200px' maxW='1200px'>
      {/* Display total results count if available */}
      {
        <Box
          px={4}
          py={2}
          borderRadius='md'
          minWidth='200px'
          border='1px solid'
          borderColor='page.alt'
        >
          <Text color='gray.800' fontSize='xs' lineHeight='short'>
            Results
          </Text>
          {isLoadingTotals ? (
            <Spinner color='niaid.placeholder' size='sm' />
          ) : (
            <Text color='tertiary.800' fontSize='md' fontWeight='extrabold'>
              {formatNumber(total)}
            </Text>
          )}
        </Box>
      }
      {/* Display count for each resource type */}
      {(types.length > 0 ? types : Array(3).fill({})).map((type, idx) => (
        <Box
          key={idx}
          px={4}
          py={2}
          flex={1}
          bg='page.alt'
          borderRadius='md'
          minWidth='200px'
          cursor='pointer'
          _hover={{ '>.count': { textDecoration: 'underline' } }}
          onClick={() => type?.term && handleFilterClick(type.term)}
        >
          <Text
            color='gray.800'
            fontSize='xs'
            lineHeight='short'
            textDecoration='none'
          >
            {type?.name || '-'}
          </Text>

          {isLoadingTotals ? (
            <Spinner color='niaid.placeholder' size='sm' />
          ) : (
            <Text
              className='count'
              color='tertiary.800'
              fontSize='md'
              fontWeight='extrabold'
            >
              {formatNumber(type?.count || 0)}
            </Text>
          )}
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ResultsCount;
