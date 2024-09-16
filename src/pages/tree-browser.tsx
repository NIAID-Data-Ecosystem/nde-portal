import { VStack } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { TreeBrowserSearch } from 'src/views/tree-browser/components/search';
import { TreeBrowserTable } from 'src/views/tree-browser/components/table';

//  This page renders the search results from the search bar.
const TreeBrowserOnePage: NextPage = () => {
  return (
    <PageContainer
      title='Search'
      metaDescription='NDE Discovery Portal - Search results list based on query.'
      px={0}
      py={0}
    >
      <PageContent
        w='100%'
        flexDirection='column'
        alignItems='center'
        px={{ base: 2, sm: 4, xl: '5vw' }}
      >
        <VStack w='100%' spacing={4} p={4}>
          <TreeBrowserSearch />
          <TreeBrowserTable />
        </VStack>
      </PageContent>
    </PageContainer>
  );
};

export default TreeBrowserOnePage;
