import { useState } from 'react';
import { Flex, VStack } from '@chakra-ui/react';
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
      facet: string[];
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
        alignItems='center'
        flexDirection='column'
        px={{ base: 2, sm: 4, xl: '5vw' }}
        w='100%'
        position='relative'
      >
        <Flex
          w='100%'
          maxWidth='2000px'
          flexDirection={{ base: 'column-reverse', lg: 'row' }}
        >
          <VStack w='100%' flex={1} spacing={4} p={4}>
            <OntologyBrowserSearch />
            <OntologyBrowserTable
              searchList={searchList}
              setSearchList={setSearchList}
            />
          </VStack>
          {/* <-- Sidebar with selected terms --> */}
          <OntologyList searchList={searchList} setSearchList={setSearchList} />
        </Flex>
      </PageContent>
    </PageContainer>
  );
};

export default OntologyBrowserOnePage;
