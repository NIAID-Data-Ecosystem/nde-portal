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
import { TAB_LABELS } from '../../config/tabs';

interface TabWithCounts extends Omit<TabType, 'types'> {
  types: (TabType['types'][number] & {
    count: number;
  })[];
}

interface SearchTabsProps extends Omit<TabsProps, 'children'> {
  colorPalette?: string;
  tabs: TabWithCounts[];
  renderTabPanels: () => React.ReactNode;
}

export const SearchTabs = ({
  colorPalette = 'secondary',
  index,
  onChange,
  renderTabPanels,
  tabs,
}: SearchTabsProps) => {
  return (
    <Tabs.Root
      value={index}
      onValueChange={onChange}
      colorPalette={colorPalette}
      bg='#fff'
      lazyMount
    >
      {/* Render each tab with its label(s) and count(s) */}
      <Tabs.List
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
            css={{
              '& _selected': {
                color: `${colorPalette}.500`,
                bg: '#fff',
              },
            }}
          >
            <TabLabels types={tab.types} colorPalette={colorPalette} />
          </Tab>
        ))}
      </Tabs.List>
      <TabPanels>{renderTabPanels()}</TabPanels>
    </Tabs.Root>
  );
};

const TabLabels = ({
  types,
  colorPalette,
}: {
  types: TabWithCounts['types'];
  colorPalette: string;
}) => {
  const datasetType = types.find(type => type.type === 'Dataset');
  const resourceCatalogType = types.find(
    type => type.type === 'ResourceCatalog',
  );
  const diseaseType = types.find(type => type.type === 'Disease');

  const tagStyles = {
    borderRadius: 'full',
    colorPalette,
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

  if (datasetType && resourceCatalogType && diseaseType) {
    const datasetCount = datasetType.count || 0;
    const resourceCatalogCount = resourceCatalogType.count || 0;
    const diseaseCount = diseaseType.count || 0;
    const otherResourcesCount = resourceCatalogCount + diseaseCount;

    return (
      <Text as='h2' {...textStyles}>
        {`${TAB_LABELS.DATASET}s`}
        <Tag.Root {...tagStyles}>{datasetCount.toLocaleString()}</Tag.Root>
        {` and ${TAB_LABELS.OTHER_RESOURCES} `}
        <Tag.Root {...tagStyles}>
          {otherResourcesCount.toLocaleString()}
        </Tag.Root>
      </Text>
    );
  }

  // Single-type tabs
  const type = types[0];
  return (
    <Text as='h2' {...textStyles}>
      {type.label}
      <Tag.Root {...tagStyles}>{type.count.toLocaleString()}</Tag.Root>
    </Text>
  );
};
