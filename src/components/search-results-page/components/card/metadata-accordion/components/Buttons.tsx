import React from 'react';
import { Box, Flex, Icon } from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa6';
import {
  queryFilterObject2String,
  queryFilterString2Object,
  updateRoute,
} from 'src/components/filters';
import { SelectedFilterTypeValue } from 'src/components/filters/types';
import { useRouter } from 'next/router';

// FilterByButton is used to filter the current results by a specific property and value
export const FilterByButton = ({
  property,
  value,
  children,
}: {
  property: string;
  value: SelectedFilterTypeValue;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { filters } = router.query;
  const selectedFilters = queryFilterString2Object(filters) || [];
  return (
    <Flex
      alignItems='center'
      _hover={{
        cursor: 'pointer',
        textDecoration: 'underline',
        svg: { opacity: 1 },
      }}
      onClick={() => {
        if (value) {
          if (selectedFilters[property]) {
            if (!selectedFilters[property].includes(value)) {
              selectedFilters[property].push(value);
            }
          } else {
            selectedFilters[property] = [value];
          }
        }
        updateRoute(
          {
            from: 1,
            filters: queryFilterObject2String(selectedFilters),
          },
          router,
        );
      }}
    >
      {children}
      <Icon as={FaFilter} boxSize={3} mx={1} color='gray.600' opacity={0} />
    </Flex>
  );
};

// SearchByButton is used to search the results by a specific property and value
export const SearchByButton = ({
  property,
  value,
  children,
}: {
  property: string;
  value: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();

  return (
    <Box
      display='inline-flex'
      alignItems='center'
      _hover={{
        cursor: 'pointer',
        textDecoration: 'underline',
      }}
      onClick={() => {
        router.push({
          pathname: `/search`,
          query: {
            q: `${property}:"${value.trim().toLowerCase()}"`,
          },
        });
      }}
    >
      {children}
    </Box>
  );
};
