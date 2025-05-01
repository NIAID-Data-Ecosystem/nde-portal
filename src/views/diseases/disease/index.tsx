import { Flex, Text, VStack } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { DiseasePageProps, TopicQueryProps } from '../types';
import { ConditionsOfAccess } from './components/conditions-of-access';
import { DataTypes } from './components/data-types';
import { ExternalLinksSection } from './components/external-links';
import { PropertyTreemapLists } from './components/property-treemap-lists';
import { Sources } from './components/sources';
import { IntroSection } from './layouts/intro';
import { SectionWrapper } from './layouts/section';
import { CardWrapper } from './layouts/card';

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
    <>
      {/* Disease page header */}
      <IntroSection
        title={data?.attributes.title}
        subtitle={data?.attributes.subtitle}
        description={data?.attributes.description}
        links={data?.attributes.contactLinks}
        params={query}
        isLoading={isLoading}
      />
      <SectionWrapper
        id='about-datasets'
        title={`${topic} Resources in the NIAID Data Ecosystem`}
        mt={10}
      >
        <Text mb={2}>
          This section provides a visual summary of the resources available
          within the NIAID Discovery Portal for {topic} research.{' '}
          <Link href={`/search?q=${data?.attributes.query.q}`}>
            {`View all search results related to ${topic}`}
          </Link>
          .
        </Text>
        {/* Overview Section */}
        <SectionWrapper
          as='h3'
          id='overview'
          title={`${totalCount.toLocaleString()} ${topic} Related Resources`}
        >
          <CardWrapper>
            {/* Chart: Property Treemap/Brushable List*/}
            {query && <PropertyTreemapLists query={query} topic={topic} />}
          </CardWrapper>

          <CardWrapper flexDirection='row' flexWrap='wrap' mt={6}>
            <VStack w='100%' spacing={4} flex={3}>
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
                minWidth={200}
                display={{ base: 'none', lg: 'flex' }}
              >
                <Sources id='desktop-version' query={query} topic={topic} />
              </Flex>
            )}
          </CardWrapper>
        </SectionWrapper>
      </SectionWrapper>
      {/* External links */}
      {data && (data?.attributes?.externalLinks?.data ?? []).length > 0 && (
        <SectionWrapper
          as='h3'
          id='external-links'
          title={`External Resources for ${topic}`}
        >
          <ExternalLinksSection externalLinks={data.attributes.externalLinks} />
        </SectionWrapper>
      )}
    </>
  );
};
