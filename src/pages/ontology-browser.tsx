import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { OntologyBrowserSearch } from 'src/views/ontology-browser/components/search';
import { OntologyBrowserTable } from 'src/views/ontology-browser/components/table';
import { OntologyList } from 'src/views/ontology-browser/components/list';

//  This page renders the search results from the search bar.
const OntologyBrowserOnePage: NextPage = () => {
  const [searchList, setSearchList] = useState<
    {
      ontology: string;
      id: string;
      label: string;
      facet: string;
      count?: number;
    }[]
  >([]);
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
          <OntologyBrowserTable
            searchList={searchList}
            setSearchList={setSearchList}
          />
        </VStack>
        {/* <-- Sidebar with selected terms --> */}
        <OntologyList searchList={searchList} setSearchList={setSearchList} />
      </PageContent>
    </PageContainer>
  );
};

export default OntologyBrowserOnePage;
