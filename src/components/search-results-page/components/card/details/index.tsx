import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Box,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  ListItem,
  Tag,
  TagLabel,
  Text,
  UnorderedList,
  SimpleGrid,
} from 'nde-design-system';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { MetadataProperty } from './components/Property';
import { MetadataToolTip, MetadataIcon } from 'src/components/icon';
import {
  getMetadataColor,
  getMetadataTheme,
} from 'src/components/icon/helpers';

interface CardDetailsProps {
  data?: FormattedResource | null;
}

const CardDetails: React.FC<CardDetailsProps> = ({ data }) => {
  const {
    id,
    funding,
    license,
    measurementTechnique,
    variableMeasured,
    species,
    infectiousAgent,
    healthCondition,
    usageInfo,
    // applicationCategory,
    // programmingLanguage,
  } = data || {};

  const paddingCard = [4, 6, 8, 10];
  const licenseInfo = license ? formatLicense(license) : null;

  const fundingInfo =
    funding?.filter(f => {
      return f.identifier || Array.isArray(f.funder) || f?.funder?.name;
    }) || null;

  const tags = [
    {
      label: 'Species',
      glyph: 'species',
      isDisabled: !species,
      content: (
        <>
          {species && (
            <Text color='inherit'>
              {species.map((m, i) => {
                const name = Array.isArray(m.name) ? m.name.join(', ') : m.name;

                return (
                  <React.Fragment key={`${name}-${i}`}>
                    {m.url ? (
                      <Link href={m.url} isExternal>
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                  </React.Fragment>
                );
              })}
            </Text>
          )}
        </>
      ),
    },
    {
      label: 'License',
      glyph: 'license',
      isDisabled: !license,
      content: () => {
        const data = license ? formatLicense(license) : null;
        return (
          <>
            {license && (
              <>
                {data?.img && (
                  <Image
                    width='auto'
                    height='2rem'
                    src={`${data.img}`}
                    alt={data.type}
                    mb={1}
                  />
                )}
                {data?.url ? (
                  <Link href={data.url} isExternal>
                    {data.title}
                  </Link>
                ) : (
                  data?.title
                )}
              </>
            )}
          </>
        );
      },
    },
    {
      label: 'Usage Info',
      glyph: 'usageInfo',
      isDisabled: !usageInfo,
      content: () => {
        return (
          <>
            {usageInfo && (
              <>
                {usageInfo?.url ? (
                  <Link href={usageInfo.url} isExternal>
                    {usageInfo.name}
                  </Link>
                ) : (
                  usageInfo?.name
                )}
                {usageInfo?.description && ` ${usageInfo.description}`}
              </>
            )}
          </>
        );
      },
    },
    {
      label: 'Funding',
      glyph: 'funding',
      isDisabled: !fundingInfo || fundingInfo.length === 0,
      content: () => {
        if (!fundingInfo || fundingInfo.length > 0) {
          return <></>;
        }
        return (
          <UnorderedList ml={4}>
            {fundingInfo.map((f, i) => {
              const { funder } = f;
              let name = funder?.name;
              let identifier = f.identifier;
              if (Array.isArray(funder)) {
                name = funder.map(f => f.name).join(', ');
              }

              return (
                <ListItem
                  key={`${f.identifier || funder?.name}-${i}`}
                  listStyleType='inherit'
                  py={1}
                >
                  <Text color='inherit' fontSize='xs'>
                    <strong>{name}</strong>
                    {name && identifier && ' | '}
                    {identifier}
                  </Text>
                </ListItem>
              );
            })}
          </UnorderedList>
        );
      },
    },
    {
      label: 'Variable Measured',
      glyph: 'variableMeasured',
      isDisabled: !variableMeasured,
      content: () => {
        if (!variableMeasured) {
          return <></>;
        }
        return <Text color='inherit'>{variableMeasured.join(', ')}</Text>;
      },
    },
    {
      label: 'Health Condition',
      glyph: 'healthCondition',
      isDisabled: !healthCondition,
      content: () => {
        if (!healthCondition) {
          return <></>;
        }
        return (
          <UnorderedList ml={0}>
            {healthCondition?.map((m, i) => {
              const name = Array.isArray(m.name) ? m.name.join(', ') : m.name;

              return (
                <ListItem key={`${name}-${i}`}>
                  {m.url ? (
                    <Link href={m.url} isExternal>
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </ListItem>
              );
            })}
          </UnorderedList>
        );
      },
    },

    {
      label: 'Pathogen',
      glyph: 'infectiousAgent',
      isDisabled: !infectiousAgent,
      content: () => {
        if (!infectiousAgent) {
          return <></>;
        }
        return (
          <UnorderedList ml={0}>
            {infectiousAgent.map((m, i) => {
              const name = Array.isArray(m.name) ? m.name.join(', ') : m.name;

              return (
                <ListItem key={`${name}-${i}`}>
                  {m.url ? (
                    <Link href={m.url} isExternal>
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </ListItem>
              );
            })}
          </UnorderedList>
        );
      },
    },
    {
      label: 'Measurement Technique',
      glyph: 'measurementTechnique',
      isDisabled: !measurementTechnique,
      content: () => {
        if (!measurementTechnique) {
          return <></>;
        }
        return (
          <UnorderedList ml={0}>
            {measurementTechnique.map((m, i) => {
              const name = Array.isArray(m.name) ? m.name.join(', ') : m.name;

              const MeasurementTechniqueLabel = () => (
                <Text color='inherit'>{name}</Text>
              );

              return (
                <ListItem key={`${name}-${i}`}>
                  {m.url ? (
                    <Link href={m.url} isExternal>
                      <MeasurementTechniqueLabel />
                    </Link>
                  ) : (
                    <MeasurementTechniqueLabel />
                  )}
                </ListItem>
              );
            })}
          </UnorderedList>
        );
      },
    },
  ].sort((a, b) => {
    // sort with non disabled first then sort by label
    if (a.isDisabled === b.isDisabled) {
      return a.label.localeCompare(b.label);
    }
    return a.isDisabled ? 1 : -1;
  });

  return (
    <>
      {/* Details expandable drawer */}
      <Accordion allowToggle p={0} pt={1} my={0}>
        <AccordionItem>
          {({ isExpanded }) => (
            <>
              <h2>
                <AccordionButton
                  px={paddingCard}
                  // bg={isExpanded ? 'page.alt' : 'white'}
                  _hover={{ bg: 'page.alt' }}
                  aria-label={`show more details about dataset id ${id}`}
                >
                  <Flex
                    flex='1'
                    textAlign='left'
                    flexWrap='wrap'
                    alignItems='center'
                  >
                    {tags.map(({ label, glyph, isDisabled }) => {
                      return (
                        <Tag
                          key={label}
                          size='sm'
                          variant='subtle'
                          borderRadius='full'
                          colorScheme={
                            isDisabled ? 'gray' : getMetadataTheme(glyph)
                          }
                          color={`${
                            isDisabled ? 'gray' : getMetadataTheme(glyph)
                          }.800`}
                          m={0.5}
                          opacity={isDisabled ? 0.65 : 1}
                        >
                          <MetadataToolTip
                            key={label}
                            propertyName={glyph}
                            description={
                              isDisabled
                                ? `No ${label.toLocaleLowerCase()} data.`
                                : undefined
                            }
                            recordType={data?.['@type']}
                          >
                            <Flex alignItems='center'>
                              <Flex>
                                <MetadataIcon
                                  id={`indicator-${glyph}-${id}`}
                                  title={glyph}
                                  glyph={glyph}
                                  fill={`${
                                    isDisabled
                                      ? 'gray'
                                      : getMetadataTheme(glyph)
                                  }.800`}
                                  m={0.5}
                                  boxSize={3}
                                  isDisabled={isDisabled}
                                />
                              </Flex>
                              <TagLabel lineHeight='none'>
                                <Text fontSize='xs' m={0.5} color='inherit'>
                                  {label}
                                </Text>
                              </TagLabel>
                            </Flex>
                          </MetadataToolTip>
                        </Tag>
                      );
                    })}
                  </Flex>
                  <Flex alignItems='center'>
                    <Text fontSize='xs' mx={1} mr={2}>
                      Show metadata
                    </Text>
                    <Icon as={isExpanded ? FaMinus : FaPlus} fontSize='xs' />
                  </Flex>
                </AccordionButton>
              </h2>
              <AccordionPanel w='100%' px={paddingCard} my={2}>
                {isExpanded ? (
                  <SimpleGrid minChildWidth='300px' spacing='10px'>
                    {/* License*/}
                    <MetadataProperty
                      id={`license-${id}`}
                      label='License'
                      glyph='license'
                      type={data?.['@type']}
                    >
                      {licenseInfo && (
                        <>
                          {licenseInfo?.img && (
                            <Image
                              width='auto'
                              height='2rem'
                              src={`${licenseInfo.img}`}
                              alt={licenseInfo.type}
                              mb={1}
                            />
                          )}
                          {licenseInfo?.url ? (
                            <Link href={licenseInfo.url} isExternal>
                              {licenseInfo.title}
                            </Link>
                          ) : (
                            licenseInfo?.title
                          )}
                        </>
                      )}
                    </MetadataProperty>

                    {/* Data Usage Information*/}
                    <MetadataProperty
                      id={`dua-${id}`}
                      label='Data Usage Agreement'
                      glyph='usageInfo'
                      type={data?.['@type']}
                    >
                      {usageInfo && (
                        <>
                          {usageInfo?.url ? (
                            <Link href={usageInfo.url} isExternal>
                              {usageInfo.name || 'Data Usage Agreement'}
                            </Link>
                          ) : (
                            usageInfo?.name || ''
                          )}
                          {usageInfo?.description &&
                            ` ${usageInfo.description}`}
                        </>
                      )}
                    </MetadataProperty>

                    {/* Funding */}
                    <MetadataProperty
                      id={`funding-${id}`}
                      label='Funding'
                      glyph='funding'
                      type={data?.['@type']}
                    >
                      {fundingInfo && fundingInfo.length > 0 && (
                        <UnorderedList ml={4}>
                          {fundingInfo.map((f, i) => {
                            const { funder } = f;
                            let name = funder?.name;
                            let identifier = f.identifier;
                            if (Array.isArray(funder)) {
                              name = funder.map(f => f.name).join(', ');
                            }

                            return (
                              <ListItem
                                key={`${f.identifier || funder?.name}-${i}`}
                                listStyleType='inherit'
                                py={1}
                              >
                                <Text color='inherit' fontSize='xs'>
                                  <strong>{name}</strong>
                                  {name && identifier && ' | '}
                                  {identifier}
                                </Text>
                              </ListItem>
                            );
                          })}
                        </UnorderedList>
                      )}
                    </MetadataProperty>
                    {/* Measurement techniques*/}
                    <MetadataProperty
                      id={`mt-${id}`}
                      label='Measurement Technique'
                      glyph='measurementTechnique'
                      type={data?.['@type']}
                    >
                      {measurementTechnique && (
                        <UnorderedList ml={0}>
                          {measurementTechnique.map((m, i) => {
                            const name = Array.isArray(m.name)
                              ? m.name.join(', ')
                              : m.name;

                            const MeasurementTechniqueLabel = () => (
                              <Text color='inherit'>{name}</Text>
                            );

                            return (
                              <ListItem key={`${name}-${i}`}>
                                {m.url ? (
                                  <Link href={m.url} isExternal>
                                    <MeasurementTechniqueLabel />
                                  </Link>
                                ) : (
                                  <MeasurementTechniqueLabel />
                                )}
                              </ListItem>
                            );
                          })}
                        </UnorderedList>
                      )}
                    </MetadataProperty>
                    {/* Variable Measured */}
                    <MetadataProperty
                      id={`vm-${id}`}
                      label='Variable Measured'
                      glyph='variableMeasured'
                      type={data?.['@type']}
                    >
                      {variableMeasured && (
                        <Text color='inherit'>
                          {variableMeasured.join(', ')}
                        </Text>
                      )}
                    </MetadataProperty>
                    {/* Pathogen*/}
                    <MetadataProperty
                      id={`ia-${id}`}
                      label='Pathogen'
                      glyph='infectiousAgent'
                      type={data?.['@type']}
                    >
                      {infectiousAgent && (
                        <UnorderedList ml={0}>
                          {infectiousAgent.map((m, i) => {
                            const name = Array.isArray(m.name)
                              ? m.name.join(', ')
                              : m.name;

                            return (
                              <ListItem key={`${name}-${i}`}>
                                {m.url ? (
                                  <Link href={m.url} isExternal>
                                    {name}
                                  </Link>
                                ) : (
                                  name
                                )}
                              </ListItem>
                            );
                          })}
                        </UnorderedList>
                      )}
                    </MetadataProperty>
                    {/* Health Condition */}
                    <MetadataProperty
                      id={`condition-${id}`}
                      label='Health Condition'
                      glyph='healthCondition'
                      type={data?.['@type']}
                    >
                      {healthCondition && (
                        <>
                          <UnorderedList ml={0}>
                            {healthCondition?.map((m, i) => {
                              const name = Array.isArray(m.name)
                                ? m.name.join(', ')
                                : m.name;

                              return (
                                <ListItem key={`${name}-${i}`}>
                                  {m.url ? (
                                    <Link href={m.url} isExternal>
                                      {name}
                                    </Link>
                                  ) : (
                                    name
                                  )}
                                </ListItem>
                              );
                            })}
                          </UnorderedList>
                        </>
                      )}
                    </MetadataProperty>
                    {/* Species*/}
                    <MetadataProperty
                      id={`species-${id}`}
                      label='Species'
                      glyph='species'
                      type={data?.['@type']}
                    >
                      {species && (
                        <Text color='inherit'>
                          {species.map((m, i) => {
                            const name = Array.isArray(m.name)
                              ? m.name.join(', ')
                              : m.name;

                            return (
                              <React.Fragment key={`${name}-${i}`}>
                                {m.url ? (
                                  <Link href={m.url} isExternal>
                                    {name}
                                  </Link>
                                ) : (
                                  name
                                )}
                              </React.Fragment>
                            );
                          })}
                        </Text>
                      )}
                    </MetadataProperty>

                    {/* Application Category */}
                    {/* <MetadataProperty
                    id={`applicationCategory-${id}`}
                    label='Software Category'
                    glyph='applicationCategory'
                    type={data?.['@type']}
                  >
                    {applicationCategory && (
                      <UnorderedList ml={0}>
                        {applicationCategory.map((category, i) => {
                          return (
                            <ListItem key={`${category}-${i}`}>
                              {category}
                            </ListItem>
                          );
                        })}
                      </UnorderedList>
                    )}
                  </MetadataProperty> */}

                    {/* Programming Language */}
                    {/* <MetadataProperty
                    id={`programmingLanguage-${id}`}
                    label='Programming Language'
                    glyph='programmingLanguage'
                    type={data?.['@type']}
                  >
                    {programmingLanguage && (
                      <UnorderedList ml={0}>
                        {programmingLanguage.map((language, i) => {
                          return (
                            <ListItem key={`${language}-${i}`}>
                              {language}
                            </ListItem>
                          );
                        })}
                      </UnorderedList>
                    )}
                  </MetadataProperty> */}
                  </SimpleGrid>
                ) : (
                  <></>
                )}
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default CardDetails;
