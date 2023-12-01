import React from 'react';
import {
  Box,
  Flex,
  Image,
  Link,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource, Species } from 'src/utils/api/types';
import { FaCalendarAlt, FaGlobeAmericas } from 'react-icons/fa';
import { formatCitationString, formatLicense } from 'src/utils/helpers';
import MetadataConfig from 'configs/resource-metadata.json';
import StatField from './components/stat-field';
import { IconProps, MetadataIcon } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';
import { DisplayHTMLContent } from 'src/components/html-content';
import { ResourceMetadata } from 'src/utils/schema-definitions/types';
import Tooltip from 'src/components/tooltip';

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
  variableMeasured,
  ...data
}) => {
  const StatIcon = ({ id, glyph, title }: IconProps) => (
    <MetadataIcon
      id={id}
      boxSize={4}
      glyph={glyph}
      stroke='currentColor'
      fill={getMetadataColor(glyph)}
      title={title}
    />
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
    if (!url && !content) {
      return <Text color='niaid.placeholder'>None Specified</Text>;
    }
    return (
      <Text>
        {url ? (
          <Link href={url} target={isExternal ? '_blank' : '_self'}>
            {content}
          </Link>
        ) : (
          <>{content}</>
        )}
      </Text>
    );
  };

  const getBorderStyles = (property: string) => {
    return {
      py: 0.5,
      ml: 1.5,
      pl: 4,
      borderLeft: '2px solid',
      borderLeftColor: getMetadataColor(property),
    };
  };

  const MetadataContent = ({
    children,
    curatedBy,
    isCurated,
    label,
    metadataProperty,
  }: {
    children?: React.ReactNode;
    curatedBy?: Species['curatedBy'];
    isCurated?: FormattedResource['isCurated'];
    label?: string;
    metadataProperty: string;
  }) => {
    if (!children) {
      return (
        <Box {...getBorderStyles(metadataProperty)}>
          <Text color='niaid.placeholder'>None Specified</Text>
        </Box>
      );
    }
    return (
      <Box {...getBorderStyles(metadataProperty)}>
        {children && (
          <Flex>
            {label ? (
              <Tooltip label={label} hasArrow placement='top'>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {children}
                </span>
              </Tooltip>
            ) : (
              <>{children}</>
            )}
            {/* <IconButton
          as={Link}
          href={`search?filters=(species.displayName:("${displayName}"))`}
          icon={<Icon as={FaSearch} />}
          aria-label={`Search for other datasets with ${displayName}`}
          colorScheme='gray'
          variant='ghost'
          size='xs'
          mx={1}
        /> */}
          </Flex>
        )}
        {isCurated && curatedBy ? (
          <Text color='gray.600' fontStyle='italic' mt={1}>
            Curated by:{' '}
            {curatedBy.url ? (
              <Link
                fontStyle='inherit'
                fontSize='inherit'
                color='inherit'
                href={curatedBy.url}
                _hover={{ color: 'inherit' }}
                _active={{ color: 'inherit' }}
                isExternal
              >
                {curatedBy?.name || 'Curation information'}
              </Link>
            ) : (
              curatedBy?.name
            )}
          </Text>
        ) : (
          <></>
        )}
      </Box>
    );
  };

  return (
    <Flex p={[0, 4]} w='100%' flexWrap='wrap' flexDirection={['column', 'row']}>
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
              icon={() => (
                <StatIcon id='license' title='license' glyph='license' />
              )}
              {...getStatInfo('license')}
            >
              <MetadataContent metadataProperty='license'>
                <Box>
                  {licenseInfo?.img && (
                    <Image
                      src={`${licenseInfo.img}`}
                      alt={licenseInfo.type}
                      width='auto'
                      height='2rem'
                    />
                  )}
                  <StatContent
                    url={licenseInfo?.url}
                    content={licenseInfo?.title}
                  />
                </Box>
              </MetadataContent>
            </StatField>
          }

          {/* species covered in resource */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon id='species' title='species' glyph='species' />
            )}
            {...getStatInfo('species')}
          >
            {species ? (
              <UnorderedList ml={0}>
                {species.map((s, i) => {
                  const { displayName, isCurated, curatedBy } = s;
                  const name = Array.isArray(s.name)
                    ? s.name.join(', ')
                    : s.name;

                  const url = displayName
                    ? `/search?filters=(species.displayName:("${displayName.toLowerCase()}"))`
                    : name
                    ? `/search?filters=(species.name:("${name.toLowerCase()}"))`
                    : '';

                  return (
                    <ListItem key={`${name}-${i}`}>
                      <MetadataContent
                        label={`Search for other datasets with "${
                          displayName || name
                        }"`}
                        metadataProperty='species'
                        isCurated={isCurated}
                        curatedBy={curatedBy}
                      >
                        <StatContent
                          url={url}
                          content={displayName || name}
                          isExternal
                        />
                      </MetadataContent>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              <MetadataContent metadataProperty='species' />
            )}
          </StatField>
          {/* infectious agent involved */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon
                id='pathogen'
                title='pathogen'
                glyph='infectiousAgent'
              />
            )}
            {...getStatInfo('infectiousAgent')}
          >
            {infectiousAgent ? (
              <UnorderedList ml={0}>
                {infectiousAgent.map((pathogen, i) => {
                  const { displayName, isCurated, curatedBy } = pathogen;

                  const name = Array.isArray(pathogen.name)
                    ? pathogen.name.join(', ')
                    : pathogen.name;

                  const url = displayName
                    ? `/search?filters=(infectiousAgent.displayName:("${displayName.toLowerCase()}"))`
                    : name
                    ? `/search?filters=(infectiousAgent.name:("${name.toLowerCase()}"))`
                    : '';

                  return (
                    <ListItem
                      key={`${displayName || name}-${i}`}
                      mt={i === 0 ? 0 : 1}
                    >
                      <MetadataContent
                        label={`Search for other datasets with "${
                          displayName || name
                        }"`}
                        metadataProperty='infectiousAgent'
                        isCurated={isCurated}
                        curatedBy={curatedBy}
                      >
                        <StatContent
                          url={url}
                          content={displayName || name}
                          isExternal
                        />
                      </MetadataContent>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              <MetadataContent metadataProperty='infectiousAgent' />
            )}
          </StatField>

          {/* health condition covered */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon
                id='healthCondition'
                title='health condition'
                glyph='healthCondition'
              />
            )}
            {...getStatInfo('healthCondition')}
          >
            {healthCondition ? (
              <UnorderedList ml={0}>
                {healthCondition.map((condition, i) => {
                  const { isCurated, curatedBy } = condition;
                  const name = Array.isArray(condition.name)
                    ? condition.name.join(', ')
                    : condition.name;

                  const url = `/search?filters=(healthCondition.name:("${name?.toLowerCase()}"))`;

                  return (
                    <ListItem key={`${name}-${i}`} mt={i === 0 ? 0 : 1}>
                      <MetadataContent
                        label={`Search for other datasets with "${name}"`}
                        metadataProperty='healthCondition'
                        isCurated={isCurated}
                        curatedBy={curatedBy}
                      >
                        <StatContent url={url} content={name} isExternal />
                      </MetadataContent>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              <MetadataContent metadataProperty='healthCondition' />
            )}
          </StatField>
          {/* variable measured, used in conjunction with measurement technique */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon
                id='variableMeasured'
                title='variable measured'
                glyph='variableMeasured'
              />
            )}
            {...getStatInfo('variableMeasured')}
          >
            {variableMeasured ? (
              <UnorderedList ml={0}>
                {variableMeasured.map((name, i) => {
                  const url = `/search?filters=(variableMeasured:("${name.toLowerCase()}"))`;

                  return (
                    <ListItem key={`${name}-${i}`} mt={i === 0 ? 0 : 1}>
                      <MetadataContent
                        label={`Search for other datasets with "${name}"`}
                        metadataProperty='variableMeasured'
                      >
                        <StatContent url={url} content={name} isExternal />
                      </MetadataContent>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              <MetadataContent metadataProperty='variableMeasured' />
            )}
          </StatField>

          {/* measurement technique */}
          <StatField
            isLoading={isLoading}
            icon={() => (
              <StatIcon
                id='measurementTechnique'
                title='measurement technique'
                glyph='measurementTechnique'
              />
            )}
            {...getStatInfo('measurementTechnique')}
          >
            {measurementTechnique ? (
              <UnorderedList ml={0}>
                {measurementTechnique.map((technique, i) => {
                  const name = Array.isArray(technique.name)
                    ? technique.name.join(', ')
                    : technique.name;

                  return (
                    <ListItem key={`${name}-${i}`} mt={i === 0 ? 0 : 1}>
                      <MetadataContent
                        label={`Search for other datasets with "${name}"`}
                        metadataProperty='measurementTechnique'
                      >
                        <StatContent
                          url={`/search?filters=(measurementTechnique.name:("${name?.toLowerCase()}"))`}
                          content={name}
                          isExternal
                        />
                      </MetadataContent>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            ) : (
              <MetadataContent metadataProperty='measurementTechnique' />
            )}
          </StatField>

          {/* Related Ids */}
          <StatField
            isLoading={isLoading}
            label='Related Identifiers'
            icon={() => (
              <StatIcon id='identifier' title='identifier' glyph='identifier' />
            )}
            description={
              <p>
                <strong>DOI: </strong>
                {getStatInfo('doi').description}
                <br />
                <strong>PMID: </strong>
                {
                  getStatInfo('citation').items?.pmid?.description[
                    data?.['@type']?.toLowerCase()
                  ]
                }
                <br />
                <strong>NCTID: </strong>
                {getStatInfo('nctid').description}
              </p>
            }
          >
            <UnorderedList ml={0}>
              {/* if no identifiers show a dash */}
              <ListItem>
                {!doi && !nctid && !citation && (
                  <MetadataContent metadataProperty='' />
                )}
              </ListItem>

              {/* DOI */}
              {doi && (
                <ListItem>
                  <MetadataContent metadataProperty=''>
                    <strong>DOI: </strong>
                    <StatContent
                      url={
                        doi?.includes('http') || doi?.includes('doi.org')
                          ? doi
                          : ''
                      }
                      content={doi}
                      isExternal
                    />
                  </MetadataContent>
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
                <>
                  {citation?.map((c, i) => {
                    if (!c.doi && !c.pmid) {
                      return (
                        <ListItem key={i}>
                          <MetadataContent metadataProperty='' />
                        </ListItem>
                      );
                    } else if (c.pmid) {
                      return (
                        <ListItem key={i}>
                          <MetadataContent metadataProperty=''>
                            <strong>PMID: </strong>
                            <StatContent content={c.pmid} />
                          </MetadataContent>
                        </ListItem>
                      );
                    } else if (c.doi) {
                      return (
                        <ListItem key={i}>
                          <MetadataContent metadataProperty=''>
                            <strong>DOI: </strong>
                            <StatContent content={c.doi} />
                          </MetadataContent>
                        </ListItem>
                      );
                    }
                  })}
                </>
              )}
            </UnorderedList>
          </StatField>

          {/* language */}
          {inLanguage && inLanguage.name && (
            <StatField isLoading={isLoading} {...getStatInfo('inLanguage')}>
              <MetadataContent metadataProperty=''>
                {languageName.of(inLanguage.name)}
              </MetadataContent>
            </StatField>
          )}
          {/* geographic */}
          {locationNames && locationNames.length > 0 && (
            <StatField
              icon={FaGlobeAmericas}
              isLoading={isLoading}
              {...getStatInfo('spatialCoverage')}
            >
              <MetadataContent metadataProperty='spatialCoverage'>
                {locationNames.join(', ')}
              </MetadataContent>
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
                  title='programming language'
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
                <MetadataContent metadataProperty='' />
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
                    title='application category'
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
          {/* Citation */}
          {citation && (
            <Box>
              <StatField
                isLoading={isLoading}
                icon={() => (
                  <StatIcon id='citation' title='citation' glyph='citation' />
                )}
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
