import React from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Tag,
  Text,
  TabsProps,
} from '@chakra-ui/react';
import { TabType } from '../../types';

interface TabWithCounts extends Omit<TabType, 'types'> {
  types: (TabType['types'][number] & {
    count: number;
    counts?: {
      datasets: number;
      diseases: number;
      resourceCatalogs: number;
      computationalTools: number;
    };
  })[];
}

interface SearchTabsProps extends Omit<TabsProps, 'children'> {
  colorScheme?: string;
  tabs: TabWithCounts[];
  renderTabPanels: () => React.ReactNode;
}

export const SearchTabs = ({
  colorScheme = 'secondary',
  index,
  onChange,
  renderTabPanels,
  tabs,
}: SearchTabsProps) => {
  return (
    <Tabs
      index={index}
      onChange={onChange}
      colorScheme={colorScheme}
      bg='#fff'
      isLazy
      lazyBehavior='keepMounted'
    >
      {/* Render each tab with its label(s) and count(s) */}
      <TabList
        borderTop='1px solid'
        borderTopColor='gray.100'
        borderBottom='hidden'
        bg='page.alt'
      >
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            id={tab.id}
            aria-label={tab.types.map(t => t.label).join(', ')}
            sx={{
              _selected: {
                color: `${colorScheme}.500`,
                bg: '#fff',
              },
            }}
          >
            <TabLabels types={tab.types} colorScheme={colorScheme} />
          </Tab>
        ))}
      </TabList>
      <TabPanels>{renderTabPanels()}</TabPanels>
    </Tabs>
  );
};

const TabLabels = ({
  types,
  colorScheme,
}: {
  types: TabWithCounts['types'];
  colorScheme: string;
}) => {
  const datasetType = types.find(type => type.type === 'Dataset');
  const resourceCatalogType = types.find(
    type => type.type === 'ResourceCatalog',
  );

  const tagStyles = {
    borderRadius: 'full',
    colorScheme,
    ml: 1.5,
    my: 1,
    size: 'sm',
    variant: 'subtle',
  };
  const textStyles = {
    color: 'inherit',
    fontSize: 'sm',
    noOfLines: 1,
  };
  if (datasetType && resourceCatalogType) {
    const datasetCount = datasetType.counts?.datasets || 0;
    const resourceCatalogCount =
      resourceCatalogType.counts?.resourceCatalogs || 0;
    const diseaseCount = resourceCatalogType.counts?.diseases || 0;
    const otherResourcesCount = resourceCatalogCount + diseaseCount;

    return (
      <Text as='h2' {...textStyles}>
        Datasets
        <Tag {...tagStyles}>{datasetCount.toLocaleString()}</Tag>
        {' and Other Resources '}
        <Tag {...tagStyles}>{otherResourcesCount.toLocaleString()}</Tag>
      </Text>
    );
  }

  // Single-type tabs, e.g. Computational Tools
  const type = types[0];
  return (
    <Text as='h2' {...textStyles}>
      {type.label}
      <Tag {...tagStyles}>{type.count.toLocaleString()}</Tag>
    </Text>
  );
};
