import React from 'react';
import { useRouter } from 'next/router';
import { FormattedResource } from 'src/utils/api/types';
import {
  Box,
  Divider,
  Flex,
  Link,
  ListItem,
  Skeleton,
  Tag,
  UnorderedList,
} from 'nde-design-system';
import {
  ResourceDates,
  ResourceHeader,
  ResourceOverview,
  ResourceProvenance,
  Section,
  ResourceCitations,
  ResourceAuthors,
} from './components';
import { Route } from './helpers';
import FilesTable from './components/files-table';
import CitedByTable from './components/cited-by-table';
import { DisplayHTMLContent } from '../html-content';
import { DownloadMetadata } from '../download-metadata';
import SoftwareInformation from './components/software-information';
import { External } from './components/sidebar/components/external';
import { Funding } from './components/funding';
import { JsonViewer } from '../json-viewer';
import ResourceIsPartOf from './components/is-part-of';

// Metadata displayed in each section
export const sectionMetadata: { [key: string]: (keyof FormattedResource)[] } = {
  overview: [
    'doi',
    'healthCondition',
    'infectiousAgent',
    'inLanguage',
    'license',
    'measurementTechnique',
    'nctid',
    'programmingLanguage',
    'softwareVersion',
    'spatialCoverage',
    'species',
    'temporalCoverage',
    'variableMeasured',
  ],
  softwareInformation: [
    'applicationCategory',
    'discussionUrl',
    'input',
    'output',
    'isBasedOn',
    'isBasisFor',
    'processorRequirements',
    'programmingLanguage',
    'softwareAddOn',
    'softwareHelp',
    'softwareRequirements',
    'softwareVersion',
  ],
  keywords: ['keywords'],
  description: ['description'],
  provenance: ['includedInDataCatalog', 'url', 'sdPublisher', 'curatedBy'],
  downloads: ['distribution', 'downloadUrl'],
  funding: ['funding'],
  isBasedOn: ['isBasedOn'],
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
  const router = useRouter();
  return (
    <>
      <ResourceHeader
        isLoading={isLoading}
        name={data?.name}
        alternateName={data?.alternateName}
        doi={data?.doi}
        nctid={data?.nctid}
      />
      {data?.author && <ResourceAuthors authors={data.author} />}
      {/* Banner showing data type and publish date. */}
      <ResourceDates data={data} />
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
              <>
                <ResourceOverview isLoading={isLoading} {...data} />
                <ResourceIsPartOf
                  isLoading={isLoading}
                  studies={data?.isPartOf}
                />
                <ResourceCitations
                  isLoading={isLoading}
                  type={data?.['@type']}
                  citations={data?.citation}
                />
              </>
            )}
            {/* for mobile viewing */}
            {section.hash === 'overview' && (
              <Box display={{ base: 'block', lg: 'none' }}>
                <External data={data} isLoading={isLoading} />
              </Box>
            )}
            {/* Show keywords */}
            {section.hash === 'keywords' && (
              <Skeleton isLoaded={!isLoading}>
                <Flex flexWrap='wrap'>
                  {data?.keywords &&
                    data.keywords.map((keyword, i) => {
                      return (
                        <Tag
                          key={`${keyword}-${i}`}
                          as='a'
                          m={2}
                          colorScheme='primary'
                          cursor='pointer'
                          onClick={e => {
                            e.preventDefault();
                            router.push({
                              pathname: `/search`,
                              query: { q: keyword.trim() },
                            });
                          }}
                        >
                          {keyword}
                        </Tag>
                      );
                    })}
                </Flex>
              </Skeleton>
            )}
            {section.hash === 'softwareInformation' && (
              <SoftwareInformation
                keys={sectionMetadata[section.hash]}
                isLoading={isLoading}
                {...data}
              />
            )}
            {/* Show description */}
            {section.hash === 'description' &&
              (data?.description || data?.abstract) && (
                <>
                  {/* Abstract text */}
                  {data.abstract && (
                    <>
                      <DisplayHTMLContent
                        content={`**Abstract:** ${data.abstract}` || ''}
                        overflow='auto'
                      />
                      <Divider my={2} />
                    </>
                  )}

                  {/* Description text */}
                  {data.description && (
                    <DisplayHTMLContent
                      content={`${data.description}` || ''}
                      overflow='auto'
                    />
                  )}
                </>
              )}
            {/* Show provenance */}
            {section.hash === 'provenance' && (
              <ResourceProvenance isLoading={isLoading} {...data} />
            )}

            {/* Show downloads */}
            {section.hash === 'downloads' && (
              <>
                {/* Downloads for computational tools is a list of links. */}
                {data?.downloadUrl && (
                  <UnorderedList>
                    {data.downloadUrl.map(({ name }) => {
                      return (
                        <ListItem key={name}>
                          <Link href={name} isExternal>
                            {name}
                          </Link>
                        </ListItem>
                      );
                    })}
                  </UnorderedList>
                )}
                {/* Downloads for datasets is a table with multiple properties. */}
                {data?.distribution && (
                  <FilesTable
                    isLoading={isLoading}
                    distribution={data.distribution}
                  />
                )}
              </>
            )}
            {/* Show funding */}
            {/* {section.hash === 'funding' && (
              <FundingTable isLoading={isLoading} {...data} />
            )} */}
            {section.hash === 'funding' && (
              <Funding isLoading={isLoading} data={data?.funding || []} />
            )}
            {/* Show citedBy */}
            {section.hash === 'citedBy' && (
              <CitedByTable isLoading={isLoading} {...data} />
            )}
            {/* Show raw metadata */}
            {section.hash === 'metadata' && data?.rawData && (
              <>
                <Flex w='100%' justifyContent='flex-end' pb={2}>
                  <DownloadMetadata
                    buttonProps={{
                      colorScheme: 'primary',
                      variant: 'outline',
                      size: 'sm',
                      mb: 1,
                    }}
                    exportFileName={`nde-${data.rawData['_id']}`}
                    params={{ q: `_id:"${data.rawData['_id']}"` }}
                  >
                    Download Metadata
                  </DownloadMetadata>
                </Flex>
                <JsonViewer data={data.rawData} />
              </>
            )}
          </Section>
        );
      })}
    </>
  );
};

export default Sections;
