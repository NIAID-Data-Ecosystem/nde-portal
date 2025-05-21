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

// Extends TabType to include dataset counts for each type
interface TabWithCounts extends Omit<TabType, 'types'> {
  types: (TabType['types'][number] & { count: number })[];
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
      isLazy
      lazyBehavior='keepMounted'
    >
      {/* Render each tab with its label(s) and count(s) */}
      <TabList bg='#fff' borderBottom='1px solid' borderColor='gray.200'>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            id={tab.id}
            aria-label={tab.types.map(t => t.label).join(', ')}
            sx={{
              _selected: {
                color: `${colorScheme}.500`,
                borderColor: 'currentColor',
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

// Formats a list of label/count pairs with proper conjunctions (e.g. ", and").
// Example output: "A (10), B (20) and C (30)"
const TabLabels = ({
  types,
  colorScheme,
}: {
  types: TabWithCounts['types'];
  colorScheme: string;
}) => {
  return (
    <Text color='inherit' fontSize='sm' noOfLines={1}>
      {types.map(({ label, count }, index) => {
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
      })}
    </Text>
  );
};
