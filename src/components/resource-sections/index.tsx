import React from 'react';
import { FormattedResource } from 'src/utils/api/types';
import {
  Divider,
  Flex,
  ListItem,
  Skeleton,
  Stack,
  StackDivider,
  UnorderedList,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import {
  ResourceHeader,
  ResourceBanner,
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
import {
  ExternalAccess,
  UsageInfo,
} from './components/sidebar/components/external';
import { Funding } from './components/funding';
import { JsonViewer } from '../json-viewer';
import { BasedOnTable, BasedOnActionProcess } from './components/based-on';
import { CompletenessBadgeCircle } from 'src/components/metadata-completeness-badge/Circular';
import { DownloadMetadata } from '../download-metadata';
import { SearchableItems } from 'src/components/searchable-items';
import { Summary } from './components/summary';
import { OverviewSectionWrapper } from './components/overview-section-wrapper';
import { getMetadataDescription } from '../metadata';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { RelatedResources } from './components/related-resources';
import { SamplesDisplay } from './components/samples';
import { CreditText } from './components/sidebar/components/external/components/credit-text';
import {
  SHOW_CREDIT_TEXT_SECTION,
  SHOULD_HIDE_SAMPLES,
} from 'src/utils/feature-flags';
import { ExampleOfWorkDisplay } from './components/example-of-work';
import { AboutResource } from './components/about';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

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
  const type = data?.['@type'] || 'Dataset';
  const isBasedOn = data?.isBasedOn?.filter(item => item['@type'] !== 'Action');

  const isBasedOnActionProcess =
    (type === 'DataCollection' &&
      data?.isBasedOn?.filter(item => item['@type'] === 'Action')) ||
    null;

  return (
    <>
      <ResourceHeader
        isLoading={isLoading}
        name={data?.name}
        alternateName={data?.alternateName}
        id={data?.id}
        doi={data?.doi}
        nctid={data?.nctid}
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
            {/* Badge indicating completeness of metadata */}
            {/* {data && data['_meta'] && (
          <Flex
            px={4}
            py={4}
            justifyContent='center'
            minWidth='250px'
            display={{ base: 'none', lg: 'flex' }}
          >
            <CompletenessBadgeCircle
              type={data['@type']}
              stats={data['_meta']}
              size='lg'
            />
          </Flex>
        )} */}
          </Flex>
        )}

      {sections.map(section => {
        const sectionName =
          section.hash === 'basedOnAction' && isBasedOnActionProcess
            ? isBasedOnActionProcess[0]?.name || section.title
            : section.title;

        return (
          <Section
            id={section.hash}
            key={section.hash}
            name={sectionName}
            isLoading={isLoading}
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
                  divider={<StackDivider borderColor='gray.100' />}
                >
                  {/* Badge indicating completeness of metadata */}
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
                  {/* External links to access data, documents or dataset at the source. */}
                  <ExternalAccess
                    data={data}
                    isLoading={isLoading}
                    hasDivider={false}
                    minWidth={{ base: 'unset', sm: '350px' }}
                  />
                </Stack>
                <UsageInfo data={data} isLoading={isLoading} />
              </Flex>
            )}
            {section.hash === 'overview' && (
              <>
                {/* If type is DataCollection, show AboutResource above the main overview */}
                {type === 'DataCollection' && (
                  <AboutResource
                    about={data?.about}
                    collectionSize={data?.collectionSize}
                    exampleOfWork={data?.exampleOfWork}
                    genre={data?.genre}
                    isLoading={isLoading}
                  />
                )}

                <ResourceOverview isLoading={isLoading} {...data} />
                {/* Overview secondary section */}
                {/* If type is not DataCollection, show AboutResource below the main overview */}
                {type !== 'DataCollection' && (
                  <AboutResource
                    about={data?.about}
                    collectionSize={data?.collectionSize}
                    exampleOfWork={data?.exampleOfWork}
                    genre={data?.genre}
                    isLoading={isLoading}
                  />
                )}

                {/* Resource citation(s) */}
                {data?.citation && (
                  <OverviewSectionWrapper
                    isLoading={isLoading}
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

                {/* Resource credit text */}
                {SHOW_CREDIT_TEXT_SECTION && (
                  <OverviewSectionWrapper
                    isLoading={isLoading}
                    label='Credit Text'
                    tooltipLabel={getMetadataDescription(
                      'creditText',
                      data?.['@type'],
                    )}
                    my={4}
                    scrollContainerProps={{ maxHeight: 'unset' }}
                  >
                    <CreditText data={data} px={2} />
                  </OverviewSectionWrapper>
                )}
              </>
            )}
            {/* Show keywords */}
            {section.hash === 'keywords' && (
              <Skeleton isLoaded={!isLoading}>
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
              <Skeleton isLoaded={!isLoading}>
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
              <Skeleton isLoaded={!isLoading}>
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
                      content={data.description}
                      overflow='auto'
                    />
                  )}
                </>
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

            {/* Show Based On information */}
            {section.hash === 'isBasedOn' && isBasedOn && (
              <BasedOnTable
                id='software-information-is-based-on'
                title={schema['isBasedOn']['description']?.[type]}
                caption='Table showing resources that this resource is based on.'
                isLoading={isLoading}
                items={isBasedOn}
              />
            )}

            {/* Show citedBy */}
            {section.hash === 'citedBy' && (
              <CitedByTable
                isLoading={isLoading}
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

            {/* isBasedOn action property used for DataCollection contains an explanation of how the DataCollection was created */}
            {section.hash === 'basedOnAction' &&
              isBasedOnActionProcess &&
              isBasedOnActionProcess.map((action, index) => (
                <BasedOnActionProcess key={index} {...action} />
              ))}

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
