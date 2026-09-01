import { Tabs, Tag, Text } from '@chakra-ui/react';
import React from 'react';

import { TAB_LABELS } from '../../config/tabs';
import { TabType } from '../../types';

interface TabWithCounts extends Omit<TabType, 'types'> {
  types: (TabType['types'][number] & {
    count: number;
  })[];
}

interface SearchTabsProps extends Omit<Tabs.RootProps, 'children'> {
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
        bg='bg.alt'
      >
        {tabs.map(tab => (
          <Tabs.Trigger
            key={tab.id}
            id={tab.id}
            value={tab.id}
            aria-label={tab.types.map(t => t.label).join(', ')}
            _selected={{
              color: `${colorPalette}.500`,
              bg: '#fff',
            }}
          >
            <TabLabels types={tab.types} colorPalette={colorPalette} />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.ContentGroup>{renderTabPanels()}</Tabs.ContentGroup>
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
    size: 'sm' as const,
    variant: 'subtle' as const,
  };
  const textStyles = {
    color: 'inherit',
    fontSize: 'sm',
    lineClamp: 1,
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
