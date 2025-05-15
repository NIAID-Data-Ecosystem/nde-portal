import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer } from 'src/components/page-container';
import { useMemo } from 'react';
import { FormattedResource } from 'src/utils/api/types';
import {
  SearchProvider,
  tabs,
} from 'src/views/draft-search/context/search-context';
import { SearchTabs } from 'src/views/draft-search/components/tabs';
import { useSearchQueryParams } from 'src/views/draft-search/hooks/useSearchQueryParams';
import { useSearchResultsData } from 'src/views/draft-search/hooks/useSearchResultsData';

//  This page renders the search results from the search bar.
const Search: NextPage<{
  results: FormattedResource[];
  total: number;
}> = ({ results, total }) => {
  const router = useRouter();

  const queryParams = useSearchQueryParams();

  const { data, isLoading, isRefetching, error } = useSearchResultsData({
    ...queryParams,
    size: 0,
    facets: ['@type'],
  });

  const initialTab = useMemo(() => {
    if (!router.isReady) return null;

    const defaultTab = tabs.find(t => t.isDefault)?.id || tabs[0].id;
    const tabParamId = router.query.tab as string;
    const tab = tabs.find(t => t.id === tabParamId);
    return tab?.id || defaultTab;
  }, [router.isReady, router.query.tab]);

  if (!router.isReady || initialTab === null) {
    return null;
  }

  return (
    <PageContainer
      title='Search'
      metaDescription='NDE Discovery Portal - Search results list based on query.'
      px={0}
      py={0}
      includeSearchBar
    >
      <SearchProvider initialTab={initialTab}>
        <>
          {/* Filters */}

          {/* Filter tags */}

          {/* Tabs */}
          <SearchTabs />
        </>
      </SearchProvider>
    </PageContainer>
  );
};

export default Search;
