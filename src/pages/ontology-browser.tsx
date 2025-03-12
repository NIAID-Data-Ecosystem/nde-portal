import { useState } from 'react';
import { Flex, VStack } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { OntologyBrowserSearch } from 'src/views/ontology-browser/components/search';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';
import { OntologySearchList } from 'src/views/ontology-browser/components/ontology-search-list';
import { OntologyBrowser } from 'src/views/ontology-browser/components/ontology-browser';
import { ONTOLOGY_BROWSER_OPTIONS } from 'src/views/ontology-browser/utils/api-helpers';

export interface SearchListItem
  extends Pick<
    OntologyLineageItemWithCounts,
    'ontologyName' | 'taxonId' | 'label' | 'counts'
  > {}
//  This page renders the search results from the search bar.
const OntologyBrowserPage: NextPage = () => {
  const [searchList, setSearchList] = useState<SearchListItem[] | []>([]);

  return (
    <PageContainer
      title='Search'
      metaDescription='NDE Discovery Portal - Search results list based on query.'
      px={0}
      py={0}
      includeSearchBar
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
            <OntologyBrowserSearch
              ontologyMenuOptions={ONTOLOGY_BROWSER_OPTIONS}
            />
            <OntologyBrowser
              searchList={searchList}
              setSearchList={setSearchList}
            />
          </VStack>
          {/* <-- Sidebar with selected terms --> */}
          <OntologySearchList
            searchList={searchList}
            setSearchList={setSearchList}
          />
        </Flex>
      </PageContent>
    </PageContainer>
  );
};

export default OntologyBrowserPage;
