import { Tabs, TabsRootProps, Tag, Text } from '@chakra-ui/react';
import React from 'react';

import { TAB_LABELS } from '../../config/tabs';
import { TabType } from '../../types';

interface TabWithCounts extends Omit<TabType, 'types'> {
  types: (TabType['types'][number] & {
    count: number;
  })[];
}

interface SearchTabsProps extends Omit<TabsRootProps, 'children'> {
  colorPalette?: string;
  tabs: TabWithCounts[];
  renderTabPanels: () => React.ReactNode;
}

export const SearchTabs = ({
  colorPalette = 'secondary',
  value,
  onValueChange,
  renderTabPanels,
  tabs,
}: SearchTabsProps) => {
  return (
    <Tabs.Root
      value={value}
      onValueChange={onValueChange}
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
        {tabs.map((tab, index) => (
          <Tabs.Trigger
            key={tab.id}
            id={tab.id}
            aria-label={tab.types.map(t => t.label).join(', ')}
            value={`${index}`}
            _selected={{
              color: `${colorPalette}.500`,
              bg: '#fff',
            }}
          >
            <TabLabel types={tab.types} colorPalette={colorPalette} />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {renderTabPanels()}
    </Tabs.Root>
  );
};

const TabLabel = ({
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
        <Tag.Root {...tagStyles}>
          <Tag.Label>{datasetCount.toLocaleString()}</Tag.Label>
        </Tag.Root>
        {` and ${TAB_LABELS.OTHER_RESOURCES} `}
        <Tag.Root {...tagStyles}>
          <Tag.Label>{otherResourcesCount.toLocaleString()}</Tag.Label>
        </Tag.Root>
      </Text>
    );
  }

  // Single-type tabs
  const type = types[0];
  return (
    <Text as='h2' {...textStyles}>
      {type.label}
      <Tag.Root {...tagStyles}>
        <Tag.Label>{type.count.toLocaleString()}</Tag.Label>
      </Tag.Root>
    </Text>
  );
};
