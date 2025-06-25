import { Flex, Text, VStack } from '@chakra-ui/react';
import { DiseasePageProps, TopicQueryProps } from '../types';
import { ConditionsOfAccess } from './components/conditions-of-access';
import { DataTypes } from './components/data-types';
import { ExternalLinksSection } from './components/external-links';
import { PropertyTreemapLists } from './components/property-treemap-lists';
import { Sources } from './components/sources';
import { IntroSection } from './layouts/intro';
import { SectionDescription, SectionWrapper } from './layouts/section';
import { CardWrapper } from './layouts/card';
import { PageContent } from 'src/components/page-container';
import DISEASE_PAGE_COPY from './disease-page.json';
import {
  fillTemplatePlaceholders,
  MarkdownContent,
} from './layouts/markdown-content';

export interface DiseaseContentProps {
  data?: DiseasePageProps;
  isLoading?: boolean;
  totalCount: number;
  query?: TopicQueryProps['query'];
  topic: TopicQueryProps['topic'];
}
export const DiseaseContent: React.FC<DiseaseContentProps> = ({
  data,
  query,
  isLoading,
  topic,
  totalCount,
}) => {
  return (
    <PageContent
      id='disease-page-content'
      bg='#fff'
      maxW={{ base: 'unset', lg: '1600px' }}
      justifyContent='center'
      margin='0 auto'
      p={4}
      mb={32}
      mt={16}
      flex={1}
    >
      <Flex flexDirection='column' flex={1} pb={32} width='100%' m='0 auto'>
        {/* Disease page header */}
        <IntroSection
          title={data?.title}
          subtitle={data?.subtitle}
          description={data?.description}
          links={data?.contacts}
          image={data?.image}
          isLoading={isLoading}
        />
        <SectionWrapper
          id='about-datasets'
          title={fillTemplatePlaceholders(
            DISEASE_PAGE_COPY['showcase']['title'],
            { topic },
          )}
          mt={10}
        >
          <MarkdownContent
            template={DISEASE_PAGE_COPY['showcase']['description']}
            replacements={{
              topic,
              query: `/search?q=${encodeURIComponent(data?.query.q ?? '')}`,
            }}
          />

          {/* Overview Section */}
          <SectionWrapper
            as='h3'
            id='overview'
            title={fillTemplatePlaceholders(
              DISEASE_PAGE_COPY['charts']['title'],
              {
                count: totalCount.toLocaleString(),
                topic,
              },
            )}
          >
            <CardWrapper>
              {/* Chart: Property Treemap/Brushable List*/}
              {query && <PropertyTreemapLists query={query} topic={topic} />}
            </CardWrapper>

            <CardWrapper
              flexDirection='row'
              flexWrap='wrap'
              mt={6}
              w='100%'
              spacing={{ base: 4, lg: 14, xl: 28 }}
              justifyContent='space-between'
            >
              <VStack
                flex={2}
                flexDirection='column'
                justifyContent='space-between'
                maxWidth={{ base: 'unset', lg: 700, xl: 1000 }}
                spacing={4}
                w='50%'
              >
                {/* Chart: Resource types */}
                {query && <DataTypes query={query} topic={topic} />}

                {/* Chart: Sources | Place under the sources charts on smaller screens */}
                {query && (
                  <Flex
                    w='100%'
                    flexDirection='column'
                    flex={1}
                    minWidth={200}
                    display={{ base: 'flex', lg: 'none' }}
                  >
                    <Sources id='mobile-version' query={query} topic={topic} />
                  </Flex>
                )}
                {/* Chart: Conditions of Access */}
                {query && <ConditionsOfAccess query={query} topic={topic} />}
              </VStack>

              {/* Chart: Sources | Place beside the other charts on larger screens */}
              {query && (
                <Flex
                  w='100%'
                  flexDirection='column'
                  flex={1}
                  minWidth={{ base: 250, lg: 300 }}
                  maxWidth={{ base: 'unset', lg: 400 }}
                  display={{ base: 'none', lg: 'flex' }}
                >
                  <Sources id='desktop-version' query={query} topic={topic} />
                </Flex>
              )}
            </CardWrapper>
          </SectionWrapper>
        </SectionWrapper>
        {/* External links */}
        {data && (data?.externalLinks ?? []).length > 0 && (
          <SectionWrapper
            as='h3'
            id='external-links'
            title={fillTemplatePlaceholders(
              DISEASE_PAGE_COPY['external']['title'],
              {
                topic,
              },
            )}
          >
            <ExternalLinksSection externalLinks={data.externalLinks} />
          </SectionWrapper>
        )}
      </Flex>
    </PageContent>
  );
};
