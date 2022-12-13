import React from 'react';
import {
  Box,
  Flex,
  Image,
  Link,
  ListItem,
  SimpleGrid,
  Stack,
  StackDivider,
  StatHelpText,
  StatNumber,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';
import {
  formatCitationString,
  formatDOI,
  formatLicense,
  formatNumber,
} from 'src/utils/helpers';
import MetadataConfig from 'configs/resource-metadata.json';
import StatField from './components/stat-field';
import { assetPrefix } from 'next.config';
import { IconProps, MetadataIcon } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';
import { DisplayHTMLContent } from 'src/components/html-content';
import { ResourceMetadata } from 'src/utils/schema-definitions/types';

export interface OverviewProps extends Partial<FormattedResource> {
  isLoading: boolean;
}

const Overview: React.FC<OverviewProps> = ({
  aggregateRating,
  citation,
  doi,
  healthCondition,
  identifier,
  includedInDataCatalog,
  infectiousAgent,
  inLanguage,
  interactionStatistics,
  isLoading,
  isPartOf,
  license,
  measurementTechnique,
  nctid,
  programmingLanguage,
  softwareVersion,
  spatialCoverage,
  species,
  temporalCoverage,
  usageInfo,
  variableMeasured,
  ...data
}) => {
  const StatIcon = ({ id, glyph }: IconProps) => (
    <Box mr={2}>
      <MetadataIcon
        id={id}
        boxSize={4}
        glyph={glyph}
        stroke='currentColor'
        fill={getMetadataColor(glyph)}
      />
    </Box>
  );

  // get copy label from config for a given property.
  const getStatInfo = (metadataProperty: string, accessor?: () => {}) => {
    const property = (
      accessor
        ? MetadataConfig.find(accessor)
        : MetadataConfig.find(d => d.property === metadataProperty)
    ) as ResourceMetadata;

    let label = property?.title || metadataProperty;
    let items = property?.items || null;
    let description = '';

    if (property && property?.description) {
      let type = data?.['@type']?.toLowerCase();

      if (type && property.description?.[type]) {
        // if record type exists use it to get a more specific definition if available.
        description = property.description?.[type];
      } else {
        // get more general definition if specific one does not exist.
        let descriptions = Object.values(property.description);
        description = descriptions.length === 0 ? '' : descriptions[0];
      }
    }

    return {
      description,
      label,
      items,
    };
  };

  const licenseInfo = license ? formatLicense(license) : null;
  const languageName = new Intl.DisplayNames(['en'], {
    type: 'language',
  });

  const locationNames = spatialCoverage?.filter(s => s.name).map(s => s.name);

  const StatContent = ({
    url,
    content,
    isExternal,
  }: {
    url?: string | null;
    content?: string | React.ReactNode | null;
    isExternal?: boolean;
  }) => {
    if (url) {
      return (
        <Link href={url} isExternal={isExternal}>
          {content}
        </Link>
      );
    }
    return <>{content || '-'}</>;
  };

  return (
    <Flex p={[0, 4]} w='100%' flexWrap='wrap' flexDirection={['column', 'row']}>
      {(doi || nctid) && (
        <Box w={{ sm: '100%', lg: 'unset' }} my={4}>
          <Stack
            direction={['column', 'column', 'row']}
            spacing={4}
            p={4}
            border='0.5px solid'
            borderRadius='semi'
            borderColor='gray.100'
            divider={<StackDivider borderColor='gray.200' />}
          >
            {/* Altmetric Badge */}
            {(doi || nctid || citation?.[0]['pmid']) && (
              <StatField
                isLoading={false}
                {...getStatInfo('Altmetric Rating')}
                d='flex'
                justifyContent='center'
                mr={2}
                minWidth='200px'
              >
                <Flex alignItems='center' direction='column'>
                  {(doi || nctid || citation?.[0]['pmid']) && (
                    <div
                      role='link'
                      aria-label={`altmetric badge for id ${doi || nctid}`}
                      data-badge-popover='right'
                      data-badge-type='donut'
                      data-doi={doi && formatDOI(doi)}
                      data-nct-id={nctid}
                      data-pmid={citation?.[0]['pmid']}
                      className='altmetric-embed'
                      data-link-target='blank'
                    ></div>
                  )}

                  <Link
                    fontSize='xs'
                    href={
                      'https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated'
                    }
                    target='_blank'
                    isExternal
                  >
                    Learn More
                  </Link>
                </Flex>
              </StatField>
            )}

            {aggregateRating &&
              (aggregateRating.ratingValue || aggregateRating.ratingCount) &&
              includedInDataCatalog?.name && (
                <StatField
                  isLoading={false}
                  d='flex'
                  {...getStatInfo(`${includedInDataCatalog.name} Metrics`)}
                  justifyContent='center'
                  mr={2}
                  flex={1}
                  minWidth='200px'
                >
                  <StatNumber>
                    {aggregateRating?.ratingValue &&
                      formatNumber(aggregateRating?.ratingValue)}
                    {aggregateRating?.ratingCount &&
                      formatNumber(aggregateRating?.ratingCount)}
                  </StatNumber>
                  {aggregateRating.reviewAspect && (
                    <StatHelpText>{aggregateRating.reviewAspect}</StatHelpText>
                  )}
                </StatField>
              )}

            {interactionStatistics &&
              interactionStatistics.userInteractionCount &&
              includedInDataCatalog?.name && (
                <StatField
                  isLoading={false}
                  d='flex'
                  {...getStatInfo(
                    `${includedInDataCatalog.name} User Interaction Metrics`,
                  )}
                  justifyContent='center'
                  mr={2}
                  flex={1}
                  minWidth='200px'
                >
                  <StatNumber>
                    {formatNumber(interactionStatistics.userInteractionCount)}
                  </StatNumber>
                  {interactionStatistics.interactionType && (
                    <StatHelpText>
                      {interactionStatistics.interactionType}
                    </StatHelpText>
                  )}
                </StatField>
              )}
          </Stack>
        </Box>
      )}

      <Flex alignItems='center' w='100%'>
        <SimpleGrid
          columns={[1, 1, 2, 2, 3]}
          border='1px solid'
          borderColor='gray.100'
          borderRadius='semi'
          p={2}
          w='100%'
        >
          {/* Copyright license agreement */}
          {
            <StatField
              isLoading={isLoading}
              icon={() => <StatIcon id='license' glyph='license' />}
              {...getStatInfo('license')}
            >
              <>
                {licenseInfo?.img && (
                  <Image
                    src={`${assetPrefix || ''}${licenseInfo.img}`}
                    alt={licenseInfo.type}
                  />
                )}
                <StatContent
                  url={licenseInfo?.url}
                  content={licenseInfo?.title}
                />
              </>
            </StatField>
          }

          {/* Data Usage Agreement */}
          {usageInfo && (
            <Box>
              <StatField
                isLoading={isLoading}
                icon={() => <StatIcon id='usageInfo' glyph='usageInfo' />}
                {...getStatInfo('usageInfo')}
              >
                <Box>
                  <StatContent
                    url={usageInfo.url}
                    content={usageInfo.name || usageInfo.url}
                  />
                  <br />
                  {usageInfo.description}
                </Box>
              </StatField>
            </Box>
          )}

          {/* species covered in resource */}
          <StatField
            isLoading={isLoading}
            icon={() => <StatIcon id='species' glyph='species' />}
            {...getStatInfo('species')}
          >
            {species ? (
              <UnorderedList ml={0}>
                {species.map((s, i) => {
                  const name = Array.isArray(s.name)
                    ? s.name.join(', ')
                    : s.name;

                  return (
                    <React.Fragment key={`${name}-${i}`}>
                      <ListItem>
                        <StatContent url={s.url} content={name} isExternal />
                      </ListItem>

                      {s.additionalType && (
                        <ListItem>
                          <StatContent
                            url={s.additionalType?.url}
                            content={s.additionalType?.name}
                            isExternal
                          />
                        </ListItem>
                      )}
                    </React.Fragment>
                  );
                })}
              </UnorderedList>
            ) : (
              '-'
            )}
          </StatField>

          {/* infectious agent involved */}
          <StatField
            isLoading={isLoading}
            icon={() => <StatIcon id='pathogen' glyph='infectiousAgent' />}
            {...getStatInfo('infectiousAgent')}
          >
            {infectiousAgent ? (
              <UnorderedList ml={0}>
                {infectiousAgent.map((m, i) => {
                  const name = Array.isArray(m.name)
                    ? m.name.join(', ')
                    : m.name;

                  return (
                    <ListItem key={`${name}-${i}`}>
                      <StatContent url={m.url} content={name} isExternal />
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              '-'
            )}
          </StatField>

          {/* health condition covered */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon id='healthCondition' glyph='healthCondition' />
            )}
            {...getStatInfo('healthCondition')}
          >
            {healthCondition ? (
              <UnorderedList ml={0}>
                {healthCondition.map((m, i) => {
                  const name = Array.isArray(m.name)
                    ? m.name.join(', ')
                    : m.name;

                  return (
                    <ListItem key={`${name}-${i}`}>
                      <StatContent url={m.url} content={name} isExternal />
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              '-'
            )}
          </StatField>

          {/* variable measured, used in conjunction with measurement technique */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon id='variableMeasured' glyph='variableMeasured' />
            )}
            {...getStatInfo('variableMeasured')}
          >
            {variableMeasured?.join(', ')}
          </StatField>

          {/* measurement technique */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon
                id='measurementTechnique'
                glyph='measurementTechnique'
              />
            )}
            {...getStatInfo('measurementTechnique')}
          >
            {measurementTechnique ? (
              <UnorderedList ml={0}>
                {measurementTechnique.map((m, i) => {
                  const name = Array.isArray(m.name)
                    ? m.name.join(', ')
                    : m.name;
                  return (
                    <ListItem key={`${name}-${i}`}>
                      <StatContent url={m.url} content={name} isExternal />
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              '-'
            )}
          </StatField>

          {/* language */}
          {inLanguage && inLanguage.name && (
            <StatField isLoading={isLoading} {...getStatInfo('inLanguage')}>
              {languageName.of(inLanguage.name)}
            </StatField>
          )}

          {/* geographic */}
          {locationNames && locationNames.length > 0 && (
            <StatField
              icon={FaGlobeAmericas}
              isLoading={isLoading}
              {...getStatInfo('spatialCoverage')}
            >
              {locationNames.join(', ')}
            </StatField>
          )}

          {/* period covered */}
          {temporalCoverage?.temporalInterval && (
            <StatField
              icon={FaCalendarAlt}
              isLoading={isLoading}
              {...getStatInfo('temporalCoverage')}
            >
              {temporalCoverage?.temporalInterval?.name && (
                <StatContent content={temporalCoverage.temporalInterval.name} />
              )}

              {temporalCoverage?.temporalInterval?.startDate && (
                <Text fontSize='sm'>
                  <strong>Start Date: </strong>
                  {temporalCoverage?.temporalInterval?.startDate}
                  <br />
                </Text>
              )}
              {temporalCoverage?.temporalInterval?.endDate && (
                <Text fontSize='sm'>
                  {!temporalCoverage?.temporalInterval?.startDate && (
                    <>
                      <strong>Start Date: </strong>
                      Unknown
                      <br />
                    </>
                  )}

                  <strong>End Date: </strong>
                  {temporalCoverage?.temporalInterval?.endDate}
                </Text>
              )}
            </StatField>
          )}

          {/* programming language */}
          {data['@type'] === 'ComputationalTool' && (
            <StatField
              isLoading={isLoading}
              icon={() => (
                <StatIcon
                  id='programmingLanguage'
                  glyph='programmingLanguage'
                />
              )}
              {...getStatInfo('programmingLanguage')}
            >
              {programmingLanguage ? (
                <UnorderedList ml={0}>
                  {programmingLanguage?.map((language, i) => {
                    return (
                      <ListItem key={`${language}-${i}`}>
                        <StatContent content={language} />
                      </ListItem>
                    );
                  })}
                </UnorderedList>
              ) : (
                '-'
              )}
            </StatField>
          )}

          {softwareVersion && (
            <StatField
              isLoading={isLoading}
              {...getStatInfo('softwareVersion')}
            >
              {softwareVersion.join(',')}
            </StatField>
          )}

          {/* Type of Computational Tool */}
          {data['@type'] === 'ComputationalTool' && (
            <Box>
              <StatField
                isLoading={isLoading}
                label='Software Information'
                icon={() => (
                  <StatIcon
                    id='applicationCategory'
                    glyph='applicationCategory'
                  />
                )}
              >
                {!data.applicationCategory &&
                !data.applicationSubCategory &&
                !data.applicationSuite ? (
                  '-'
                ) : (
                  <>
                    <StatField isLoading={isLoading} label='Category' py={1}>
                      <StatContent
                        content={data.applicationCategory?.join(', ')}
                      />
                    </StatField>

                    {data.applicationSubCategory && (
                      <StatField
                        isLoading={isLoading}
                        label='Subcategory'
                        py={1}
                      >
                        {data.applicationSubCategory.map(
                          ({ name, identifier, url }, i) => {
                            return (
                              <StatContent
                                key={`${identifier || i}}`}
                                url={url}
                                content={name || url}
                                isExternal
                              />
                            );
                          },
                        )}
                      </StatField>
                    )}
                    {data.applicationSuite && (
                      <StatField isLoading={isLoading} label='Suite' py={1}>
                        <StatContent
                          content={data.applicationSuite.join(', ')}
                        />
                      </StatField>
                    )}
                  </>
                )}
              </StatField>
            </Box>
          )}

          {/* Related Ids */}
          <StatField
            isLoading={isLoading}
            label='Related Identifiers'
            icon={() => <StatIcon id='identifier' glyph='identifier' />}
            description={
              <p>
                <strong>DOI: </strong>
                {getStatInfo('doi').description}
                <br />
                <strong>PMID: </strong>
                {getStatInfo('citation').items?.pmid.description}
                <br />
                <strong>NCTID: </strong>
                {getStatInfo('nctid').description}
              </p>
            }
          >
            <UnorderedList>
              {/* if no identifiers show a dash */}
              <ListItem> {!doi && !nctid && !citation && '-'}</ListItem>

              {/* DOI */}
              {doi && (
                <ListItem>
                  <strong>DOI: </strong>
                  <StatContent
                    url={doi?.includes('http') ? doi : ''}
                    content={doi}
                    isExternal
                  />
                </ListItem>
              )}

              {/* NCT ID */}
              {nctid && (
                <ListItem>
                  <strong>NCTID: </strong>
                  <StatContent
                    url={nctid?.includes('http') ? nctid : ''}
                    content={nctid}
                    isExternal
                  />
                </ListItem>
              )}

              {/* PUBMED ID*/}
              {citation && (
                <ListItem>
                  {citation?.map((c, i) => {
                    if (!nctid && !doi && !c.pmid) {
                      return <ListItem key={i}>-</ListItem>;
                    }
                    if (!c.pmid) {
                      return null;
                    }

                    if (c.pmid) {
                      return (
                        <ListItem key={i}>
                          <strong>PMID: </strong>
                          <StatContent content={c.pmid} />
                        </ListItem>
                      );
                    }
                  })}
                </ListItem>
              )}
            </UnorderedList>
          </StatField>

          {/* Citation */}
          {citation && (
            <Box>
              <StatField
                isLoading={isLoading}
                icon={() => <StatIcon id='citation' glyph='citation' />}
                {...getStatInfo('citation')}
              >
                {citation.map((c, i) => {
                  return (
                    <Box key={i}>
                      <DisplayHTMLContent
                        key={i}
                        content={`${formatCitationString(c, true)}` || ''}
                        overflow='auto'
                      />
                      {c.url && (
                        <>
                          Available from:{' '}
                          <Link href={c.url} isExternal>
                            {c.url}
                          </Link>
                        </>
                      )}
                    </Box>
                  );
                })}
              </StatField>
            </Box>
          )}

          {/* Studies that this dataset is partOf*/}
          {isPartOf && (
            <StatField isLoading={isLoading} {...getStatInfo('isPartOf')}>
              <UnorderedList ml={0}>
                {isPartOf.map(({ name, identifier, url }, i) => {
                  return (
                    <ListItem key={`${identifier || i}}`}>
                      <StatContent url={url} content={name} isExternal />
                    </ListItem>
                  );
                })}
              </UnorderedList>
            </StatField>
          )}
        </SimpleGrid>
      </Flex>
    </Flex>
  );
};

export default Overview;
