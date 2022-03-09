import React, {useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Text,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {StyledTab} from './styles';
import {TabProps as ChakraTabProps} from '@chakra-ui/tabs';

const ContentDrawer: React.FC<{height?: number}> = ({
  children,
  height = 500,
}) => {
  const contentEl = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    setContentHeight(contentEl.current?.clientHeight || 0);
  }, [contentEl]);

  useEffect(() => {
    setShowMore(contentHeight < height);
  }, [height, contentHeight]);

  return (
    <Box py={4}>
      <Box maxHeight={showMore ? 'unset' : height} overflowY='hidden'>
        <Box ref={contentEl}>{children}</Box>
      </Box>
      {/* Only show button if panel height exceeds drawer max height */}
      {contentHeight > height && (
        <Button variant='link' my={4} onClick={() => setShowMore(!showMore)}>
          Show {showMore ? 'less' : 'more'}
        </Button>
      )}
    </Box>
  );
};

interface ResourceTabs {
  isLoading: boolean;
  description?: FormattedResource['description'];
  metadata?: FormattedResource['rawData'];
}
const ResourceTabs: React.FC<ResourceTabs> = ({
  isLoading,
  description,
  metadata,
}) => {
  if (isLoading) {
    return <Skeleton height='100px' />;
  }
  return (
    <Tabs size='md' variant='unstyled' w='100%' p={4} isLazy>
      <TabList boxShadow={'base'} borderRadius={'md'}>
        {description && <Tab>Description</Tab>}
        {metadata && <Tab>Metadata</Tab>}
      </TabList>
      <TabPanels>
        {description && (
          <TabPanel w='100%'>
            <Box
              height={500}
              overflow={'auto'}
              w='100%'
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            ></Box>
          </TabPanel>
        )}
        {metadata && (
          <TabPanel w='100%'>
            <Box height={500} overflow={'auto'}>
              <Text fontSize={'10px'}>
                <pre>{JSON.stringify(metadata, null, 2)}</pre>
              </Text>
            </Box>
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
};

export default ResourceTabs;

interface TabProps extends ChakraTabProps {}
const Tab: React.FC<TabProps> = ({children, ...props}) => {
  return (
    <StyledTab _selected={{color: 'white', bg: 'blue.500'}} {...props}>
      <Text color={'inherit'}>{children}</Text>
    </StyledTab>
  );
};
