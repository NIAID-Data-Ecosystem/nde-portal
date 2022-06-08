import React from 'react';
import { FormattedResource } from 'src/utils/api/types';
import { Box, Flex, Skeleton, Tag, Text } from 'nde-design-system';
import {
  ResourceDates,
  ResourceHeader,
  ResourceOverview,
  ResourceLinks,
  ResourceProvenance,
  Section,
} from './components';

import { Route } from './helpers';
import FilesTable from './components/files-table';
import FundingTable from './components/funding-table';
import CitedByTable from './components/cited-by-table';

// Metadata displayed in each section
export const section_metadata: { [key: string]: (keyof FormattedResource)[] } =
  {
    overview: [
      'citation',
      'doi',
      'healthCondition',
      'infectiousAgent',
      'infectiousDisease',
      'language',
      'license',
      'measurementTechnique',
      'nctid',
      'numberOfDownloads',
      'numberOfViews',
      'spatialCoverage',
      'species',
      'temporalCoverage',
      'topic',
      'variableMeasured',
    ],
    keywords: ['keywords'],
    description: ['description'],
    provenance: ['includedInDataCatalog', 'url'],
    downloads: ['distribution'],
    funding: ['funding'],
    citedBy: ['citedBy'],
    metadata: ['rawData'],
  };

// use config file to show content in sections.
const Sections = ({
  isLoading,
  data,
  sections,
}: {
  isLoading: boolean;
  data?: FormattedResource;
  sections: Route[];
}) => {
  return (
    <>
      <Section id={'header'} p={0}>
        <ResourceHeader
          isLoading={isLoading}
          conditionsOfAccess={data?.conditionsOfAccess}
          author={data?.author}
          citation={data?.citation}
          name={data?.name}
        />
        {/* Banner showing data type and publish date. */}
        <ResourceDates data={data} />
      </Section>

      {sections.map(section => {
        return (
          <Section
            id={section.hash}
            key={section.hash}
            name={section.title}
            isLoading={isLoading}
            isCollapsible={section.isCollapsible}
          >
            {section.hash === 'overview' && (
              <ResourceOverview isLoading={isLoading} {...data} />
            )}
            {section.hash === 'overview' && (
              <Box display={{ base: 'block', lg: 'none' }}>
                <ResourceLinks
                  isLoading={isLoading}
                  includedInDataCatalog={data?.includedInDataCatalog}
                  url={data?.url}
                  mainEntityOfPage={data?.mainEntityOfPage}
                  codeRepository={data?.codeRepository}
                />
              </Box>
            )}
            {/* Show keywords */}
            {section.hash === 'keywords' && (
              <Skeleton isLoaded={!isLoading}>
                <Flex flexWrap='wrap'>
                  {data?.keywords &&
                    data.keywords.map(keyword => {
                      return (
                        <Tag key={keyword} m={2} colorScheme='primary'>
                          {keyword}
                        </Tag>
                      );
                    })}
                </Flex>
              </Skeleton>
            )}
            {/* Show description */}
            {section.hash === 'description' && data?.description && (
              <Box
                overflow='auto'
                w='100%'
                fontSize='sm'
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                  __html: data.description,
                }}
              ></Box>
            )}
            {/* Show provenance */}
            {section.hash === 'provenance' && (
              <ResourceProvenance isLoading={isLoading} {...data} />
            )}
            {/* Show downloads */}
            {section.hash === 'downloads' && (
              <FilesTable isLoading={isLoading} {...data} />
            )}

            {/* Show funding */}
            {section.hash === 'funding' && (
              <FundingTable isLoading={isLoading} {...data} />
            )}

            {/* Show citedBy */}
            {section.hash === 'citedBy' && (
              <CitedByTable isLoading={isLoading} {...data} />
            )}

            {/* Show raw metadata */}
            {section.hash === 'metadata' && data?.rawData && (
              <Box maxHeight={500} overflow='auto' w='100%' tabIndex={0}>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    padding: '2rem',
                  }}
                >
                  <Text fontSize={'10px'}>
                    {JSON.stringify(data.rawData, null, 2)}
                  </Text>
                </pre>
              </Box>
            )}
          </Section>
        );
      })}
    </>
  );
};

export default Sections;