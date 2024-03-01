import React from 'react';
import {
  Flex,
  Heading,
  Tabs,
  TabList,
  Tab,
  Tag,
  TabPanels,
  TabProps,
} from '@chakra-ui/react';
import { Repository } from 'src/hooks/api/useRepoData';

interface RepositoryTabsProps {
  children: React.ReactNode;
  tabs: {
    type: Repository['type'];
    label: string;
    count: number;
  }[];
  onChange: (index: number) => void;
}
export const RepositoryTabs: React.FC<RepositoryTabsProps> = ({
  children,
  tabs,
  onChange,
  ...props
}) => {
  return (
    <Flex flexDirection='column'>
      <Tabs
        w='100%'
        colorScheme='primary'
        size='sm'
        onChange={onChange}
        {...props}
      >
        <TabList
          flexWrap={['wrap', 'nowrap']}
          justifyContent={['center', 'flex-start']}
        >
          {tabs.map((tab, _) => (
            <Tab
              key={tab.type}
              w={['100%', 'unset']}
              color='gray.800'
              _selected={{
                borderBottom: '2px solid',
                borderBottomColor: 'primary.400',
                color: 'text.heading',
                ['.tag']: {
                  bg: 'primary.100',
                },
              }}
              _focus={{ outline: 'none' }}
            >
              <Heading as='h3' size='sm' fontWeight='medium' color='inherit'>
                {tab.label}
              </Heading>
              <Tag
                className='tag'
                borderRadius='full'
                ml={2}
                px={4}
                my={[4, 0]}
                size='sm'
                colorScheme='gray'
                variant='subtle'
                fontWeight='semibold'
              >
                {tab.count}
              </Tag>
            </Tab>
          ))}
        </TabList>
        <TabPanels>{children}</TabPanels>
      </Tabs>
    </Flex>
  );
};
