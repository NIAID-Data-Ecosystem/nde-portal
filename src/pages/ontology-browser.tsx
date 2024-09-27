import { VStack } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { OntologyBrowserSearch } from 'src/views/ontology-browser/components/search';
import { OntologyBrowserTable } from 'src/views/ontology-browser/components/table';

//  This page renders the search results from the search bar.
const OntologyBrowserOnePage: NextPage = () => {
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
        <VStack w='100%' spacing={4} p={4} maxWidth='1600px'>
          <OntologyBrowserSearch />
          <OntologyBrowserTable />
        </VStack>
      </PageContent>
    </PageContainer>
  );
};

export default OntologyBrowserOnePage;
