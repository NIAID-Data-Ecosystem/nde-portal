import { Box, Text } from '@chakra-ui/react';
import { useSearchContext } from '../context/search-context';

const SearchResultsList = () => {
  const { selectedTab } = useSearchContext();

  return (
    <Box mt={4}>
      <Text fontWeight='bold'>Results for: {selectedTab['id']}</Text>
    </Box>
  );
};

export default SearchResultsList;
