import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Text,
} from '@chakra-ui/react';
import ResultsCount from './results-count';
import SearchResultsList from '../list';
import { useSearchContext } from '../../context/search-context';
import { useSearchQueryParams } from '../../hooks/useSearchQueryParams';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { TabType } from '../../types';

interface SearchTabsProps {
  colorScheme?: string;
  facets: string[];
  tabs: TabType[];
}

export const SearchTabs = ({
  colorScheme = 'secondary',
  facets,
  tabs,
}: SearchTabsProps) => {
  const router = useRouter();

  // Selected tab index is stored in context to sync with other components.
  const { selectedIndex, setSelectedIndex } = useSearchContext();

  // Update URL query param when a new tab is selected.
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

  // Get the current search parameters from the URL and fetch facet data.
  const queryParams = useSearchQueryParams();
  const { response } = useSearchResultsData({
    ...queryParams,
    size: 0,
    facets,
  });
  const { data, isLoading, isPlaceholderData } = response;

  // Enhance each tab with facet counts for the types it represents.
  const tabsWithCounts = useMemo(
    () =>
      tabs.map(tab => {
        const tabTypesWithCount = tab.types.map(
          ({ label, type }) => {
            const terms = data?.facets?.['@type']?.terms ?? [];
            const facet = terms.find(t => t.term === type);
            return {
              label,
              type,
              count: facet?.count || 0,
            };
          },
          [data?.facets],
        );

        return {
          ...tab,
          types: tabTypesWithCount,
        };
      }),
    [data?.facets, tabs],
  );

  return (
    <Box w='100%'>
      {/* Display the total count above the tabs */}

      <ResultsCount
        total={data?.total || 0}
        isLoading={isLoading || isPlaceholderData}
      />
      <Tabs
        index={selectedIndex}
        onChange={handleTabChange}
        colorScheme={colorScheme}
      >
        {/* Render each tab with its label(s) and count(s) */}
        <TabList bg='#fff' borderBottom='1px solid' borderColor='gray.200'>
          {tabsWithCounts.map(tab => (
            <Tab
              key={tab.id}
              id={tab.id}
              aria-label={tab.types.map(t => t.label).join(', ')}
            >
              <Text fontWeight='medium' noOfLines={1} color='inherit'>
                {formatLabelsWithCounts(tab.types, colorScheme)}
              </Text>
            </Tab>
          ))}
        </TabList>

        {/* Each panel renders the result list for the selected tab */}
        <TabPanels>
          {tabsWithCounts.map(tab => (
            <TabPanel key={tab.id}>
              <SearchResultsList />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Formats a list of label/count pairs with proper conjunctions (e.g. ", and").
// Example output: "A (10), B (20) and C (30)"
const formatLabelsWithCounts = (
  types: { label: string; count: number }[],
  colorScheme: string,
) => {
  return types.map(({ label, count }, index) => {
    const isLast = index === types.length - 1;
    const isSecondLast = index === types.length - 2;

    return (
      <React.Fragment key={label}>
        {label}
        <Tag
          borderRadius='full'
          colorScheme={colorScheme}
          ml={1.5}
          my={1}
          size='sm'
          variant='subtle'
        >
          {count.toLocaleString()}
        </Tag>

        {/* Add comma or "and" where appropriate */}
        {types.length > 2 && !isLast && ', '}
        {isSecondLast && types.length > 1 && ' and '}
      </React.Fragment>
    );
  });
};
