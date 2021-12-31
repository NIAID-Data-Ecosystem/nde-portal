import {Flex} from '@chakra-ui/react';
import React from 'react';

interface SearchResultsListProps {
  isLoading: boolean;
  error: Error | null;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({
  children,
  error,
  isLoading,
}) => {
  if (isLoading) return <Flex>Loading...</Flex>;

  if (error) return <Flex>An error has occurred: {error.message}</Flex>;

  return (
    <Flex>
      {children}
      {/* Pagination */}
    </Flex>
  );
};

export default SearchResultsList;
