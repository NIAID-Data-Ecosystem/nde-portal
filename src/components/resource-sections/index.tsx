import React from 'react';
import { useRouter } from 'next/router';
import { FormattedResource } from 'src/utils/api/types';
import {
  Box,
  Divider,
  Flex,
  ListItem,
  Skeleton,
  Stack,
  Tag,
  UnorderedList,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
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
import { CitedByTable } from './components/cited-by-table';
import { DisplayHTMLContent } from '../html-content';
import SoftwareInformation from './components/software-information';
import { External } from './components/sidebar/components/external';
import { Funding } from './components/funding';
import { JsonViewer } from '../json-viewer';
import ResourceIsPartOf from './components/is-part-of';
import BasedOnTable from './components/based-on';
import { CompletenessBadgeCircle } from 'src/components/completeness-badge/Circular';
import { HeadingWithTooltip } from './components/sidebar/components/external/components/heading-with-tooltip';
import { ResourceCatalogCollection } from './components/collection-information';
import { DownloadMetadata } from '../download-metadata';
import { Keywords } from './components/keywords';

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
    'topicCategory',
    'variableMeasured',
  ],
  softwareInformation: [
    'applicationCategory',
    'discussionUrl',
    'input',
    'output',
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
            {/* for mobile viewing */}
            {section.hash === 'overview' && data && (
              <Stack
                display={{ base: 'flex', lg: 'none' }}
                flexWrap='wrap'
                flexDirection='column'
                spacing={4}
                px={{ base: 0, md: 4 }}
                py={4}
              >
                {data && data['_meta'] && (
                  <Flex
                    flex={1}
                    justifyContent='center'
                    alignItems='center'
                    flexDirection='column'
                    border='1px'
                    borderColor='gray.100'
                    borderRadius='semi'
                    p={4}
                  >
                    <CompletenessBadgeCircle stats={data['_meta']} size='md' />
                    <HeadingWithTooltip
                      label='Metadata Completeness'
                      pt={2}
                      whiteSpace='nowrap'
                    />
                  </Flex>
                )}
                {/* External links to access data, documents or dataset at the source. */}
                <Flex
                  flex={1}
                  border='1px'
                  borderColor='gray.100'
                  borderRadius='semi'
                  flexDirection='column'
                >
                  <External
                    data={data}
                    isLoading={isLoading}
                    hasDivider={false}
                  />
                </Flex>
              </Stack>
            )}
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
                <ResourceCatalogCollection
                  isLoading={isLoading}
                  collectionSize={data?.collectionSize}
                />
              </>
            )}

            {/* Show keywords */}
            {section.hash === 'keywords' && (
              <Skeleton isLoaded={!isLoading}>
                {data?.keywords && <Keywords keywords={data.keywords} />}
              </Skeleton>
            )}
            {section.hash === 'softwareInformation' && (
              <SoftwareInformation
                keys={sectionMetadata[section.hash]}
                isLoading={isLoading}
                {...data}
              />
            )}
            {section.hash === 'isBasedOn' && data?.isBasedOn && (
              <BasedOnTable
                id='software-information-is-based-on'
                title='Imports'
                caption='Imports used by this dataset/tool.'
                isLoading={isLoading}
                items={data?.isBasedOn}
              />
            )}

            {section.hash === 'isBasedOn' && data?.isBasisFor && (
              <Box mt={4}>
                <BasedOnTable
                  id='software-information-dependency-for'
                  title='Dependency for'
                  caption='Datasets or tools that this dataset/tool is a dependency for.'
                  isLoading={isLoading}
                  items={data.isBasisFor}
                  columns={[
                    { key: 'name', title: 'Name', props: { maxW: '50%' } },
                    {
                      key: 'type',
                      title: 'Type',
                      props: { w: '200px' },
                    },
                  ]}
                />
              </Box>
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

            {section.hash === 'funding' && (
              <Funding isLoading={isLoading} data={data?.funding || []} />
            )}
            {/* Show citedBy */}
            {section.hash === 'citedBy' && (
              <CitedByTable isLoading={isLoading} data={data?.citedBy || []} />
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
                    exportFileName={`nde-${data['_id']}`}
                    params={{ q: `_id:"${data['_id']}"` }}
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
