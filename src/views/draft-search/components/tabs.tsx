import { useRouter } from 'next/router';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { tabs, useSearchContext } from '../context/search-context';
import SearchResultsList from './list';

export const SearchTabs = () => {
  const router = useRouter();
  const { selectedIndex, setSelectedIndex } = useSearchContext();

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

  return (
    <Tabs index={selectedIndex} onChange={handleTabChange}>
      <TabList>
        {tabs.map(tab => (
          <Tab key={tab.id} id={tab.id}>
            {tab.label}
          </Tab>
        ))}
      </TabList>

      <TabPanels>
        {tabs.map(tab => (
          <TabPanel key={tab.id}>
            <SearchResultsList />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};
