import type {NextPage} from 'next';
import {useRouter} from 'next/router';
import {
  PageContainer,
  PageContent,
  SearchBar,
} from 'src/components/page-container';
import {Box} from 'nde-design-system';
import {useHasMounted} from 'src/hooks/useHasMounted';
import SearchResultsPage from 'src/components/search-results-page';

//  This page renders the search results from the search bar.

const Search: NextPage = () => {
  const hasMounted = useHasMounted();
  const router = useRouter();

  if (!hasMounted || !router.isReady) {
    return null;
  }

  return (
    <PageContainer
      hasNavigation
      title='Search results'
      metaDescription='Search results page.'
      px={0}
      py={0}
    >
      <Box w='100%'>
        <SearchBar
          value={router.query.q || ''}
          ariaLabel='Search for datasets or tools'
        />
        <SearchResultsPage />
      </Box>
    </PageContainer>
  );
};

export default Search;
