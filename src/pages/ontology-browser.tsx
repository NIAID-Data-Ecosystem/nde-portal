import { useEffect, useState } from 'react';
import { Flex, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { OntologyBrowserSearch } from 'src/views/ontology-browser/components/search';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';
import { OntologyBrowser } from 'src/views/ontology-browser/components/ontology-browser';
import { ONTOLOGY_BROWSER_OPTIONS } from 'src/views/ontology-browser/utils/api-helpers';
import { OntologySearchList } from 'src/views/ontology-browser/components/ontology-search-list';
import { InfoLabel } from 'src/components/info-label';
import { Link } from 'src/components/link';

export interface SearchListItem
  extends Pick<
    OntologyLineageItemWithCounts,
    'ontologyName' | 'taxonId' | 'label' | 'counts'
  > {}
//  This page renders the search results from the search bar.
const OntologyBrowserPage: NextPage = () => {
  const [searchList, setSearchList] = useState<SearchListItem[] | []>([]);

  // Re-route to /404 when in production
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
      router.replace('/404');
    }
  }, [router]);

  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    return null; // Prevent rendering in production
  }

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
            spacing={4}
            p={4}
            alignItems='flex-start'
          >
            <VStack alignItems='flex-start' spacing={2}>
              <Heading as='h1' fontSize='4xl' textAlign='left'>
                Ontology Browser
              </Heading>
              <Heading
                as='h2'
                color='gray.800'
                fontSize='sm'
                fontWeight='medium'
                lineHeight='short'
                textAlign='left'
              >
                Find datasets, tools, and more by exploring related{' '}
                <InfoLabel
                  textProps={{
                    color: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    as: 'span',
                  }}
                  title='ontology terms'
                  tooltipText='An ontology is a way of organizing knowledge by defining a set of terms and the relationships between them and some of the simplest ontologies can be considered controlled vocabularies with hierarchically organized terms.'
                />
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
