import type {NextPage} from 'next';
import React from 'react';
import {useQuery} from 'react-query';
import {Flex, UnorderedList} from 'nde-design-system';
import {PageContainer, PageContent} from 'src/components/page-container';
import {Main, Sidebar} from 'src/components/sources';
import {fetchMetadata} from 'src/utils/api';

const Sources: NextPage = () => {
  // Fetch metadata stats from API.
  const {data: sourceData, isLoading} = useQuery(
    ['metadata'],
    fetchMetadata, // Don't refresh everytime window is touched.
    {refetchOnWindowFocus: false},
  );

  return (
    <PageContainer
      id='sources-page'
      hasNavigation
      title='Sources'
      metaDescription='Sources page displays content related to the NIAID data Ecosystem API data sources.'
      px={0}
      py={0}
    >
      <Flex>
        {sourceData && (
          <>
            <Flex
              flexDirection='column'
              bg='page.alt'
              d={['none', 'none', 'flex']}
              w='50%'
              as='nav'
              aria-label='Navigation for data sources.'
              maxW='450px'
            >
              <UnorderedList
                display='flex'
                flexDirection='column'
                py={4}
                position='sticky'
                top={0}
                ml={0}
              >
                <Sidebar data={sourceData} />
              </UnorderedList>
            </Flex>
          </>
        )}
        {sourceData && (
          <PageContent w='100%' flexDirection='column' bg='#fff'>
            <Main sourceData={sourceData} />
          </PageContent>
        )}
      </Flex>
    </PageContainer>
  );
};

export default Sources;
