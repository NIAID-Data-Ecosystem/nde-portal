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
    resourceCatalogCount?: number;
    diseaseCount?: number;
  })[];
}

interface SearchTabsProps extends Omit<TabsProps, 'children'> {
  colorScheme?: string;
  tabs: TabWithCounts[];
  renderTabPanels: () => React.ReactNode[];
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

  if (datasetType && resourceCatalogType) {
    const datasetCount = datasetType.count || 0;
    const resourceCatalogCount = resourceCatalogType.resourceCatalogCount || 0;
    const diseaseCount = resourceCatalogType.diseaseCount || 0;
    const otherResourcesCount = resourceCatalogCount + diseaseCount;

    return (
      <Text as='h2' color='inherit' fontSize='sm' noOfLines={1}>
        Datasets
        <Tag
          borderRadius='full'
          colorScheme={colorScheme}
          ml={1.5}
          my={1}
          size='sm'
          variant='subtle'
        >
          {datasetCount.toLocaleString()}
        </Tag>
        {' and Other Resources '}
        <Tag
          borderRadius='full'
          colorScheme={colorScheme}
          ml={1.5}
          my={1}
          size='sm'
          variant='subtle'
        >
          {otherResourcesCount.toLocaleString()}
        </Tag>
      </Text>
    );
  }

  // Single-type tabs, e.g. Computational Tools
  const type = types[0];
  return (
    <Text as='h2' color='inherit' fontSize='sm' noOfLines={1}>
      {type.label}
      <Tag
        borderRadius='full'
        colorScheme={colorScheme}
        ml={1.5}
        my={1}
        size='sm'
        variant='subtle'
      >
        {type.count.toLocaleString()}
      </Tag>
    </Text>
  );
};
