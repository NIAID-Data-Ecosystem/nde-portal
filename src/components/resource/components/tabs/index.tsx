import React, {useEffect, useRef, useState} from 'react';

import {
  Box,
  Button,
  Text,
  Skeleton,
  Tabs,
  TabList,
  Tab as ChakraTab,
  TabPanels,
  TabPanel,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {StyledSectionHeading} from '../../styles';
import {StyledTab} from './styles';

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
  }, [contentHeight]);

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
  citation?: FormattedResource['citation'];
  citedBy?: FormattedResource['appearsIn'];
}
const ResourceTabs: React.FC<ResourceTabs> = ({
  isLoading,
  description,
  // citation,
  // citedBy,
}) => {
  let citation = [{name: 'citation'}];
  let citedBy = [{name: 'citedBy'}];
  if (isLoading) {
    return <Skeleton height='100px' />;
  }
  return (
    <Tabs size='md' variant='enclosed' w='100%' p={4} isLazy>
      <TabList bg={'page.alt'}>
        {description && <Tab>Description</Tab>}
        {citation && citation.length > 0 && <Tab>Citation</Tab>}
        {citedBy && citedBy.length > 0 && <Tab>Cited By</Tab>}
      </TabList>
      <TabPanels>
        {description && (
          <TabPanel w='100%'>
            <ContentDrawer>
              <Box
                w='100%'
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              ></Box>
            </ContentDrawer>
          </TabPanel>
        )}
        {citation && (
          <TabPanel w='100%'>
            <ContentDrawer>
              [To Do]:
              {citation.map((c, i) => {
                return <Text key={i}>{c.name || 'name'}</Text>;
              })}
            </ContentDrawer>
          </TabPanel>
        )}
        {citedBy && (
          <TabPanel w='100%'>
            <ContentDrawer>
              [To Do]:
              {citedBy.map((c, i) => {
                return <Text key={i}>{c.name || 'name'}</Text>;
              })}
            </ContentDrawer>
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
};

export default ResourceTabs;

const Tab: React.FC<{children: string}> = ({children}) => {
  return (
    <StyledTab>
      <StyledSectionHeading color={'inherit'}>{children}</StyledSectionHeading>
    </StyledTab>
  );
};
