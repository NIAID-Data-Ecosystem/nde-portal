import {
  Flex,
  List,
  Skeleton,
  Stack,
  StackSeparator,
  Text,
  VStack,
} from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React from 'react';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { Link } from 'src/components/link';
import { CompletenessBadgeCircle } from 'src/components/metadata-completeness-badge/Circular';
import { SearchableItems } from 'src/components/searchable-items';
import { FormattedResource } from 'src/utils/api/types';
import { SHOULD_HIDE_SAMPLES } from 'src/utils/feature-flags';

import { DownloadMetadata } from '../download-metadata';
import { JsonViewer } from '../json-viewer';
import { getMetadataDescription } from '../metadata';
import {
  ResourceAuthors,
  ResourceBanner,
  ResourceCitations,
  ResourceHeader,
  ResourceOverview,
  ResourceProvenance,
  Section,
} from './components';
import { AboutResource } from './components/about';
import { BasedOnActionProcess, BasedOnTable } from './components/based-on';
import { CitedByTable } from './components/cited-by-table';
import { DescriptionSection } from './components/description';
import { ExampleOfWorkDisplay } from './components/example-of-work';
import FilesTable from './components/files-table';
import { Funding } from './components/funding';
import { OverviewSectionWrapper } from './components/overview-section-wrapper';
import { RelatedResources } from './components/related-resources';
import { SamplesDisplay } from './components/samples';
import {
  ExternalAccess,
  UsageInfo,
} from './components/sidebar/components/external';
import { Summary } from './components/summary';
import { Route } from './helpers';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

// use config file to show content in sections.
const Sections = ({
  loading,
  data,
  sections,
}: {
  loading: boolean;
  data?: FormattedResource;
  sections: Route[];
}) => {
  const type = data?.['@type'] || 'Dataset';
  const isBasedOn = data?.isBasedOn?.filter(item => item['@type'] !== 'Action');
  const isDataCollectionType = type === 'DataCollection';
  const isBasedOnActionProcess = data?.isBasedOn?.filter(
    item => item['@type'] === 'Action',
  );
  return (
    <>
      <ResourceHeader
        loading={loading}
        name={data?.name}
        alternateName={data?.alternateName}
        id={data?.id}
        doi={data?.doi}
        nctid={data?.nctid}
        type={data?.['@type']}
        creativeWorkStatus={data?.creativeWorkStatus}
      />
      {/* Banner showing data type and publish date. For computational tools, operating system info is displayed when available. */}
      {data?.author && <ResourceAuthors authors={data.author} />}
      <ResourceBanner data={data} />
      {/*<--- AI Generated short description -->*/}
      {process.env.NEXT_PUBLIC_APP_ENV !== 'production' &&
        data?.disambiguatingDescription && (
          <Flex mx={6} my={2}>
            <Summary
              description={data.disambiguatingDescription}
              tagLabel='AI Generated'
            />
          </Flex>
        )}

      {/* isBasedOn action property used for DataCollection contains an explanation of how the DataCollection was created */}
      {isDataCollectionType && (
        <Stack flexDirection='column' w='100%' px={4} my={4}>
          {/* Show description */}
          <Stack flexDirection='column' w='100%' gap={0.5} px={[0, 0, 4]}>
            <Text fontWeight='semibold' lineHeight='moderate' fontSize='sm'>
              Description
            </Text>
            <DescriptionSection
              description={data?.description}
              loading={loading}
            />
          </Stack>
          {isBasedOnActionProcess &&
            isBasedOnActionProcess.map((action, index) => (
              <BasedOnActionProcess key={index} {...action} />
            ))}
        </Stack>
      )}

      {sections.map(section => {
        const getSectionName = () => {
          if (section.hash === 'samples') {
            if (data?.sample?.['@type'] === 'Sample') {
              return 'Population Sample';
            } else if (data?.sample?.['@type'] === 'SampleCollection') {
              return 'Experimental Samples';
            }
          }
          return section.title;
        };

        return (
          <Section
            id={section.hash}
            key={section.hash}
            name={getSectionName()}
            loading={loading}
            isCollapsible={section?.ui?.isCollapsible}
          >
            {/* for mobile viewing */}
            {section.hash === 'overview' && data && (
              <Flex
                display={{ base: 'flex', lg: 'none' }}
                flex={1}
                width='100%'
                border='1px'
                borderColor='gray.100'
                borderRadius='semi'
                flexDirection='column'
                minWidth='250px'
              >
                <Stack
                  flexWrap='wrap'
                  direction={{ base: 'column', md: 'row' }}
                >
                  {/* Badge indicating completeness of metadata */}
                  <StackSeparator borderColor='gray.100' />
                  {data && data['_meta'] && (
                    <Flex
                      px={4}
                      py={4}
                      alignItems='center'
                      justifyContent='center'
                      minWidth='250px'
                      flex={1}
                    >
                      <CompletenessBadgeCircle
                        type={data['@type']}
                        stats={data['_meta']}
                        size='lg'
                      />
                    </Flex>
                  )}
                  <StackSeparator borderColor='gray.100' />
                  {/* External links to access data, documents or dataset at the source. */}
                  <StackSeparator borderColor='gray.100' />
                  <ExternalAccess
                    data={data}
                    loading={loading}
                    hasDivider={false}
                    minWidth={{ base: 'unset', sm: '350px' }}
                  />
                </Stack>
                <UsageInfo data={data} loading={loading} />
              </Flex>
            )}

            {section.hash === 'overview' && (
              <>
                {/* If type is DataCollection, show AboutResource above the main overview */}
                {/* If type is not DataCollection, show AboutResource below the main overview */}
                <VStack
                  flexDirection={
                    isDataCollectionType ? 'column' : 'column-reverse'
                  }
                  gap={4}
                >
                  <AboutResource
                    about={data?.about}
                    collectionSize={data?.collectionSize}
                    exampleOfWork={data?.exampleOfWork}
                    genre={data?.genre}
                    loading={loading}
                  />
                  <ResourceOverview loading={loading} {...data} />
                </VStack>

                {/* Resource citation(s) */}
                {data?.citation && (
                  <OverviewSectionWrapper
                    loading={loading}
                    label={`Citation${
                      data?.citation.length > 1
                        ? `s (${data?.citation.length})`
                        : ''
                    }`}
                    tooltipLabel={getMetadataDescription(
                      'citation',
                      data?.['@type'],
                    )}
                    my={4}
                  >
                    <ResourceCitations citations={data?.citation} />
                  </OverviewSectionWrapper>
                )}
              </>
            )}
            {/* Show keywords */}
            {section.hash === 'keywords' && (
              <Skeleton loading={!!loading}>
                {data?.keywords && data?.keywords?.length > 0 && (
                  <SearchableItems
                    generateButtonLabel={(
                      limit,
                      length,
                      itemLabel = 'keywords',
                    ) =>
                      limit === length
                        ? `Show fewer ${itemLabel}`
                        : `Show all ${itemLabel} (${length - limit} more)`
                    }
                    itemLimit={20}
                    items={data?.keywords.map(kw => ({
                      name: kw,
                      value: kw,
                      field: 'keywords',
                    }))}
                  />
                )}
              </Skeleton>
            )}
            {/* Show application category */}
            {section.hash === 'applicationCategory' && (
              <Skeleton loading={!!loading}>
                {data?.applicationCategory &&
                  data?.applicationCategory?.length > 0 && (
                    <SearchableItems
                      generateButtonLabel={(
                        limit,
                        length,
                        itemLabel = 'application categories',
                      ) =>
                        limit === length
                          ? `Show fewer ${itemLabel}`
                          : `Show all ${itemLabel} (${length - limit} more)`
                      }
                      itemLimit={10}
                      items={data?.applicationCategory.map(ac => ({
                        name: ac,
                        value: ac,
                        field: 'applicationCategory',
                      }))}
                    />
                  )}
              </Skeleton>
            )}
            {/* Show programming language */}
            {section.hash === 'programmingLanguage' && (
              <Skeleton loading={!!loading}>
                {data?.programmingLanguage &&
                  data?.programmingLanguage?.length > 0 && (
                    <SearchableItems
                      generateButtonLabel={(
                        limit,
                        length,
                        itemLabel = 'languages',
                      ) =>
                        limit === length
                          ? `Show fewer ${itemLabel}`
                          : `Show all ${itemLabel} (${length - limit} more)`
                      }
                      items={data?.programmingLanguage.map(pl => ({
                        name: pl,
                        value: pl,
                        field: 'programmingLanguage',
                      }))}
                      itemLimit={10}
                    />
                  )}
              </Skeleton>
            )}
            {/* Show description */}
            {!isDataCollectionType && section.hash === 'description' && (
              <DescriptionSection
                description={data?.description}
                abstract={data?.abstract}
                loading={loading}
              />
            )}

            {/* Show smaples */}
            {section.hash === 'samples' && !SHOULD_HIDE_SAMPLES('samples') && (
              <SamplesDisplay
                sample={data?.sample}
                resourceIdentifier={data?.identifier ?? undefined}
              />
            )}
            {/* Show provenance */}
            {section.hash === 'provenance' && (
              <ResourceProvenance loading={loading} {...data} />
            )}
            {/* Show downloads */}
            {section.hash === 'downloads' && (
              <>
                {/* Downloads for computational tools is a list of links. */}
                {data?.downloadUrl && (
                  <List.Root as='ul'>
                    {data.downloadUrl.map(({ name }) => {
                      return (
                        <List.Item key={name}>
                          <Link href={name} isExternal>
                            {name}
                          </Link>
                        </List.Item>
                      );
                    })}
                  </List.Root>
                )}
                {/* Downloads for datasets is a table with multiple properties. */}
                {data?.distribution && (
                  <FilesTable
                    loading={loading}
                    distribution={data.distribution}
                  />
                )}
              </>
            )}
            {/* Show funding */}
            {section.hash === 'funding' && (
              <Funding loading={loading} data={data?.funding || []} />
            )}
            {/* Show Based On information */}
            {section.hash === 'isBasedOn' && isBasedOn && (
              <BasedOnTable
                id='software-information-is-based-on'
                title={schema['isBasedOn']['description']?.[type]}
                caption='Table showing resources that this resource is based on.'
                loading={loading}
                items={isBasedOn}
              />
            )}
            {/* Show citedBy */}
            {section.hash === 'citedBy' && (
              <CitedByTable
                loading={loading}
                data={data?.citedBy || []}
                title={schema['citedBy']['description']?.[type]}
              />
            )}
            {/* Show related resources */}
            {section.hash === 'relatedResources' && (
              <RelatedResources
                data={
                  data && {
                    '@type': data?.['@type'],
                    hasPart: data?.hasPart,
                    isBasisFor: data?.isBasisFor,
                    isPartOf: data?.isPartOf,
                    isRelatedTo: data?.isRelatedTo,
                  }
                }
              />
            )}

            {/* Display what the work on the source site looks like, ex: schema, properties */}
            {section.hash === 'exampleOfWork' && data?.exampleOfWork && (
              <ExampleOfWorkDisplay {...data.exampleOfWork} />
            )}

            {/* Show raw metadata */}
            {section.hash === 'metadata' && data?.rawData && (
              <>
                <Flex w='100%' justifyContent='flex-end' pb={2}>
                  <DownloadMetadata
                    buttonProps={{
                      colorPalette: 'primary',
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
