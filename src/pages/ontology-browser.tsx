import { Flex, Heading, VStack } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useState } from 'react';
import { InfoLabel } from 'src/components/info-label';
import { Link } from 'src/components/link';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { OntologyBrowser } from 'src/views/ontology-browser/components/ontology-browser';
import { OntologySearchList } from 'src/views/ontology-browser/components/ontology-search-list';
import { OntologyBrowserSearch } from 'src/views/ontology-browser/components/search';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';
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
    <PageContainer meta={getPageSeoConfig('/ontology-browser')} px={0} py={0}>
      <PageContent
        alignItems='center'
        flexDirection='column'
        px={{ base: 2, sm: 4, xl: '5vw' }}
        w='100%'
        position='relative'
      >
        <Flex
          w='100%'
          flex={1}
          borderRadius='semi'
          maxWidth='2000px'
          flexDirection={{ base: 'column-reverse', lg: 'row' }}
        >
          <VStack
            w='100%'
            h='100%'
            flex={1}
            gap={4}
            p={4}
            alignItems='flex-start'
          >
            <VStack alignItems='flex-start' gap={2}>
              <Heading as='h1' fontSize='4xl' textAlign='left'>
                Ontology Browser
              </Heading>
              <Heading
                as='h2'
                color='gray.800'
                fontSize='sm'
                fontWeight='medium'
                lineHeight='moderate'
                textAlign='left'
              >
                Find datasets, tools, and more by exploring related{' '}
                <InfoLabel
                  as='span'
                  color='inherit'
                  fontSize='inherit'
                  fontWeight='inherit'
                  tooltipProps={{
                    content:
                      'An ontology is a way of organizing knowledge by defining a set of terms and the relationships between them and some of the simplest ontologies can be considered controlled vocabularies with hierarchically organized terms.',
                  }}
                >
                  ontology terms
                </InfoLabel>
                <br />
                See what&apos;s available for connected, nearby, or nested
                terms.{' '}
                <Link href='/knowledge-center/ontology-browser/'>
                  Learn more about this tool.
                </Link>
              </Heading>
            </VStack>
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
