import { Tabs, Tag, Text } from '@chakra-ui/react';
import React from 'react';

import { isOtherResourceType, TAB_LABELS } from '../../config/tabs';
import { TabType } from '../../types';

interface TabWithCounts extends Omit<TabType, 'types'> {
  types: (TabType['types'][number] & {
    count: number;
  })[];
}

interface SearchTabsProps extends Omit<Tabs.RootProps, 'children'> {
  tabs: TabWithCounts[];
  renderTabPanels: () => React.ReactNode;
}

export const SearchTabs = ({
  colorPalette = 'secondary',
  tabs,
  renderTabPanels,
  ...props
}: SearchTabsProps) => (
  <Tabs.Root
    colorPalette={colorPalette}
    lazyMount
    borderTop='1px solid'
    borderTopColor='gray.100'
    size='md'
    {...props}
  >
    <Tabs.List>
      {tabs.map(tab => (
        <Tabs.Trigger
          key={tab.id}
          id={tab.id}
          value={tab.id}
          color='text.body'
          _selected={{ color: 'colorPalette.solid', bg: 'white' }}
        >
          <TabLabel types={tab.types} />
        </Tabs.Trigger>
      ))}
    </Tabs.List>
    <Tabs.ContentGroup>{renderTabPanels()}</Tabs.ContentGroup>
  </Tabs.Root>
);

// Each tab is labelled with one or more resource types and their result counts.
const TabLabel = ({ types }: { types: TabWithCounts['types'] }) => {
  const dataset = types.find(type => type.type === 'Dataset');
  const otherResources = types.filter(type => isOtherResourceType(type.type));

  // The default tab folds Resource Catalogs and Disease Overviews into a single
  // "Other Resources" count alongside Datasets; every other tab has one type.
  const segments =
    dataset && otherResources.length === 2
      ? [
          { label: `${TAB_LABELS.DATASET}s`, count: dataset.count },
          {
            label: `and ${TAB_LABELS.OTHER_RESOURCES}`,
            count: otherResources.reduce(
              (total, type) => total + type.count,
              0,
            ),
          },
        ]
      : [{ label: types[0].label, count: types[0].count }];

  return (
    // `color: inherit` lets the trigger's selected color win over the Text
    // recipe's `text.body`; `lineClamp` keeps long labels on the trigger's
    // single fixed-height row.
    <Text as='span' color='inherit' lineClamp={1} textAlign='left'>
      {segments.map(({ label, count }) => (
        <React.Fragment key={label}>
          {label}
          <Tag.Root mx={1} size='sm' variant='surface' rounded='full'>
            <Tag.Label>{count.toLocaleString()}</Tag.Label>
          </Tag.Root>
        </React.Fragment>
      ))}
    </Text>
  );
};
