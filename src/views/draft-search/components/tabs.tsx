import { useRouter } from 'next/router';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Badge,
} from '@chakra-ui/react';
import { tabs, useSearchContext } from '../context/search-context';
import SearchResultsList from './list';
import { useSearchQueryParams } from '../hooks/useSearchQueryParams';
import { useSearchResultsData } from '../hooks/useSearchResultsData';
import ResultsCount from 'src/views/search-results-page/components/count';

export const SearchTabs = ({
  colorScheme = 'secondary',
}: {
  colorScheme?: string;
}) => {
  const router = useRouter();

  //  Get the selected index from the context
  //  This is the index of the tab that is currently selected
  const { selectedIndex, setSelectedIndex } = useSearchContext();

  //  Update the url params based on the selected tab
  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    const selectedTab = tabs[index];
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: selectedTab.id },
      },
      undefined,
      { shallow: true },
    );
  };

  // Fetch the data so we can display the counts beside the tabs.
  const queryParams = useSearchQueryParams();

  const { data, isLoading, isPlaceholderData } = useSearchResultsData({
    ...queryParams,
    size: 0,
    facets: ['@type'],
  });

  const tabsWithCounts = tabs.map(tab => {
    // sum the counts for all the types in the tab
    const count = (data?.facets?.['@type']?.terms || []).reduce(
      (acc, facet) => {
        if (tab['@type'].includes(facet.term)) {
          return acc + facet.count;
        }
        return acc;
      },
      0,
    );
    return {
      ...tab,
      count,
    };
  });

  return (
    <>
      <ResultsCount
        total={data?.total || 0}
        isLoading={isLoading || isPlaceholderData}
      />
      {/* TO DO: Add total count for all types */}
      <Tabs
        index={selectedIndex}
        onChange={handleTabChange}
        colorScheme={colorScheme}
      >
        <TabList>
          {tabsWithCounts.map(tab => (
            <Tab key={tab.id} id={tab.id} fontWeight='medium'>
              {tab.label}
              <Tag
                colorScheme={colorScheme}
                ml={1.5}
                size='md'
                borderRadius='full'
                variant='subtle'
              >
                {tab.count.toLocaleString()}
              </Tag>
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {tabsWithCounts.map(tab => (
            <TabPanel key={tab.id}>
              <SearchResultsList />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </>
  );
};
