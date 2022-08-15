import React from 'react';
import {
  Box,
  Flex,
  Image,
  Link,
  ListItem,
  SimpleGrid,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import {
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaGlobeAmericas,
} from 'react-icons/fa';
import {
  formatCitationString,
  formatDOI,
  formatLicense,
} from 'src/utils/helpers';
import MetadataConfig from 'configs/resource-metadata.json';
import StatField from './components/stat-field';
import { assetPrefix } from 'next.config';
import { IconProps, MetadataIcon } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';
import { DisplayHTMLContent } from 'src/components/html-content';

export interface OverviewProps extends Partial<FormattedResource> {
  isLoading: boolean;
}

const Overview: React.FC<OverviewProps> = ({
  citation,
  doi,
  healthCondition,
  identifier,
  infectiousAgent,
  inLanguage,
  license,
  measurementTechnique,
  nctid,
  numberOfDownloads,
  numberOfViews,
  spatialCoverage,
  species,
  temporalCoverage,
  topic,
  variableMeasured,
  isLoading,
  ...data
}) => {
  const StatIcon = ({ glyph, ...props }: IconProps) => (
    <MetadataIcon
      boxSize={4}
      mr={2}
      glyph={glyph}
      stroke='currentColor'
      fill={getMetadataColor(glyph)}
      {...props}
    />
  );

  // get copy label from config for a given property.
  const getStatInfo = (metadataProperty: string) => {
    const metadataField = MetadataConfig.find(
      d => d.property === metadataProperty,
    );

    return metadataField
      ? { ...metadataField, label: metadataField.title || '' }
      : { label: metadataProperty, description: '' };
  };

  const licenseInfo = license ? formatLicense(license) : null;
  const languageName = new Intl.DisplayNames(['en'], {
    type: 'language',
  });

  const StatContent = ({
    url,
    content,
  }: {
    url?: string | null;
    content?: string | React.ReactNode | null;
  }) => {
    if (url) {
      return (
        <Link href={url} isExternal>
          {content}
        </Link>
      );
    }
    return <>{content || '-'}</>;
  };

  return (
    <Flex p={[0, 4]} w='100%' flexWrap='wrap' flexDirection={['column', 'row']}>
      {(doi || nctid || numberOfDownloads || numberOfViews) && (
        <Box w={{ sm: '100%', lg: 'unset' }} my={4}>
          <SimpleGrid
            minChildWidth='150px'
            maxWidth={500}
            spacingX={4}
            spacingY={2}
            p={4}
            border='0.5px solid'
            borderRadius='semi'
            borderColor='gray.100'
          >
            {/* Altmetric Badge */}
            {(doi || nctid || citation?.[0]['pmid']) && (
              <StatField
                isLoading={false}
                {...getStatInfo('Altmetric Rating')}
                d='flex'
                justifyContent='center'
                mr={2}
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

            {(numberOfDownloads || numberOfViews) && (
              <Box>
                {/* Number Of Downloads. Note: Info not available in current API */}
                {numberOfDownloads && (
                  <StatField
                    isLoading={isLoading}
                    icon={FaDownload}
                    {...getStatInfo('numberOfDownloads')}
                  >
                    {numberOfDownloads}
                  </StatField>
                )}

                {/* Number Of Views. Note: Info not available in current API */}
                {numberOfViews && (
                  <StatField
                    isLoading={isLoading}
                    icon={FaEye}
                    {...getStatInfo('numberOfViews')}
                  >
                    {numberOfViews}
                  </StatField>
                )}
              </Box>
            )}
          </SimpleGrid>
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
              icon={() => <StatIcon id='license' glyph={'license'} />}
              {...getStatInfo('license')}
            >
              <>
                {licenseInfo?.img && (
                  <Image
                    src={`${assetPrefix}${licenseInfo.img}`}
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

          {/* species covered in resource */}
          <StatField
            isLoading={isLoading}
            icon={() => <StatIcon id='species' glyph='species' />}
            {...getStatInfo('species')}
          >
            {species ? (
              <UnorderedList ml={0}>
                {species.map((m, i) => {
                  const name = Array.isArray(m.name)
                    ? m.name.join(', ')
                    : m.name;

                  return (
                    <ListItem key={`${name}-${i}`}>
                      <StatContent url={m.url} content={name} />
                    </ListItem>
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
                      <StatContent url={m.url} content={name} />
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
                      <StatContent url={m.url} content={name} />
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              '-'
            )}
          </StatField>

          {/* topics covered in resource*/}
          {topic && (
            <StatField isLoading={isLoading} {...getStatInfo('topic')}>
              {Array.isArray(topic) ? topic.join(', ') : topic}
            </StatField>
          )}

          {/* variable measured, used in conjunction with measurement technique */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon id='variableMeasured' glyph='variableMeasured' />
            )}
            {...getStatInfo('variableMeasured')}
          >
            {variableMeasured}
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
                      <StatContent url={m.url} content={name} />
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
          {spatialCoverage && (
            <StatField
              icon={FaGlobeAmericas}
              isLoading={isLoading}
              {...getStatInfo('spatialCoverage')}
            >
              {spatialCoverage}
            </StatField>
          )}
          {/* period covered */}
          {temporalCoverage && (
            <StatField
              icon={FaCalendarAlt}
              isLoading={isLoading}
              {...getStatInfo('temporalCoverage')}
            >
              {temporalCoverage}
            </StatField>
          )}

          {/* Type of Computational Tool */}
          {data['@type'] === 'ComputationalTool' &&
            (data['applicationCategory'] || data['applicationSubCategory']) && (
              <Box>
                <StatField isLoading={isLoading} label='Tool'>
                  <StatField isLoading={isLoading} label='Category' py={1}>
                    <StatContent
                      content={data.applicationCategory?.join(', ')}
                    />
                  </StatField>

                  {data.applicationSubCategory && (
                    <StatField isLoading={isLoading} label='Subcategory' py={1}>
                      <StatContent
                        content={data.applicationSubCategory.join(', ')}
                      />
                    </StatField>
                  )}
                  {data.applicationSuite && (
                    <StatField isLoading={isLoading} label='Suite' py={1}>
                      <StatContent content={data.applicationSuite.join(', ')} />
                    </StatField>
                  )}
                </StatField>
              </Box>
            )}

          {/* Related Ids */}
          <StatField
            isLoading={isLoading}
            label='Related Identifiers'
            description={
              <p>
                <strong>DOI: </strong>
                {getStatInfo('doi').description}
                <br />
                <strong>PMID: </strong>
                {getStatInfo('pmid').description}
                <br />
                <strong>NCTID: </strong>
                {getStatInfo('nctid').description}
              </p>
            }
          >
            {/* if no identifiers show a dash */}
            {!doi && !nctid && !citation && '-'}

            {/* DOI */}
            {doi && (
              <>
                <strong>DOI: </strong>
                <StatContent
                  url={doi?.includes('http') ? doi : ''}
                  content={doi}
                />
              </>
            )}

            {/* NCT ID */}
            {nctid && (
              <>
                <strong>NCTID: </strong>
                <StatContent
                  url={nctid?.includes('http') ? nctid : ''}
                  content={nctid}
                />
              </>
            )}

            {/* PUBMED ID*/}
            {citation?.map((c, i) => {
              if (!nctid && !doi && !c.pmid) {
                return <>-</>;
              }
              if (!c.pmid) {
                return <></>;
              }
              if (c.pmid) {
                return (
                  <>
                    <strong>PMID: </strong>

                    <StatContent key={i} content={c.pmid} />
                  </>
                );
              }
            })}
          </StatField>

          {/* Citation */}
          {citation && (
            <Box>
              <StatField isLoading={isLoading} {...getStatInfo('citation')}>
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
        </SimpleGrid>
      </Flex>
    </Flex>
  );
};

export default Overview;
