import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Box,
  Flex,
  Icon,
  Image,
  Tag,
  TagLabel,
  Text,
  SimpleGrid,
} from 'nde-design-system';
import Tooltip from 'src/components/tooltip';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { MetadataToolTip, MetadataIcon } from 'src/components/icon';
import { getMetadataTheme } from 'src/components/icon/helpers';
import { getFundingDetails, sortMetadataArray } from './helpers';
import { MetadataBlock } from './components/MetadataBlock';
import { MetadataList } from './components/MetadataList';
import {
  MetadataWithTag,
  MetadataWithTaxonomy,
} from './components/MetadataItems';

interface MetadataAccordionProps {
  data?: FormattedResource | null;
}

// Sort [SORT_ORDER] based on: https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/214
const SORT_ORDER = [
  'infectiousAgent',
  'species',
  'healthCondition',
  'measurementTechnique',
  'variableMeasured',
  'funding',
  'license',
  'usageInfo',
];

const MetadataAccordion: React.FC<MetadataAccordionProps> = ({ data }) => {
  const {
    id,
    measurementTechnique,
    variableMeasured,
    species,
    infectiousAgent,
    healthCondition,
    usageInfo,
  } = data || {};

  const paddingCard = [4, 6, 8, 10];
  const license = data?.license ? formatLicense(data.license) : null;

  const fundingDetails = getFundingDetails(data?.funding);

  const METADATA_CONTENT = [
    {
      label: 'Funding',
      property: 'funding',
      isDisabled: !fundingDetails || fundingDetails.length === 0,
      content: ({ property }) => (
        <MetadataList
          property={property}
          showMoreURL={`/resources?id=${id}#funding`}
        >
          {fundingDetails?.map((funding, idx) => {
            return (
              <Box key={property + idx} display='inline-block'>
                {funding?.funder &&
                  (Array.isArray(funding.funder) ? (
                    funding.funder.map(funder => {
                      if (!funder.name) return null;
                      return <Text key={funder.name}>{funder.name}</Text>;
                    })
                  ) : (
                    <Text>{funding.funder.name}</Text>
                  ))}

                {funding?.identifier && (
                  <Flex alignItems='center'>
                    <Tooltip label='Funding identifier'>
                      <MetadataWithTag
                        url={funding.url}
                        value={funding.identifier}
                      />
                    </Tooltip>
                  </Flex>
                )}
              </Box>
            );
          })}
        </MetadataList>
      ),
    },
    {
      label: 'Health Condition',
      property: 'healthCondition',
      isDisabled: !healthCondition,
      content: ({ property }) => {
        if (!healthCondition) {
          return <></>;
        }
        return (
          <MetadataList
            property={property}
            showMoreURL={`/resources?id=${id}#overview`}
          >
            {healthCondition ? (
              healthCondition.map((healthCondition, idx) => {
                const name = Array.isArray(healthCondition.name)
                  ? healthCondition.name.join(', ')
                  : healthCondition.name;

                return (
                  <Box key={property + idx} w='100%'>
                    {name && (
                      <MetadataWithTaxonomy
                        url={healthCondition.url}
                        value={name}
                      />
                    )}
                  </Box>
                );
              })
            ) : (
              <></>
            )}
          </MetadataList>
        );
      },
    },
    {
      label: 'License',
      property: 'license',
      isDisabled: !license,
      content: () => {
        if (!license) {
          return <></>;
        }
        const { title, url } = license;
        return (
          <Flex my={2} display='flex' flexWrap='wrap'>
            {license?.img && (
              <Image
                width='auto'
                height={6}
                src={license.img}
                alt={license.type}
                m={1}
              />
            )}
            {title && <MetadataWithTag url={url} value={title} />}
          </Flex>
        );
      },
    },
    {
      label: 'Measurement Technique',
      property: 'measurementTechnique',
      isDisabled: !measurementTechnique,
      content: ({ property }) => {
        if (!measurementTechnique) {
          return <></>;
        }
        return (
          <MetadataList
            property={property}
            showMoreURL={`/resources?id=${id}#overview`}
          >
            {measurementTechnique ? (
              measurementTechnique.map((measurementTechnique, idx) => {
                const name = Array.isArray(measurementTechnique.name)
                  ? measurementTechnique.name.join(', ')
                  : measurementTechnique.name;

                return (
                  <Box key={property + idx} w='100%'>
                    {name && (
                      <MetadataWithTaxonomy
                        url={measurementTechnique.url}
                        value={name}
                      />
                    )}
                  </Box>
                );
              })
            ) : (
              <></>
            )}
          </MetadataList>
        );
      },
    },
    {
      label: 'Pathogen',
      property: 'infectiousAgent',
      isDisabled: !infectiousAgent,
      content: ({ property }) => {
        if (!infectiousAgent) {
          return <></>;
        }
        return (
          <MetadataList
            property={property}
            showMoreURL={`/resources?id=${id}#overview`}
          >
            {infectiousAgent ? (
              infectiousAgent.map((pathogen, idx) => {
                const name = Array.isArray(pathogen.name)
                  ? pathogen.name.join(', ')
                  : pathogen.name;
                const commonName = Array.isArray(pathogen.commonName)
                  ? pathogen.commonName.join(', ')
                  : pathogen.commonName;
                return (
                  <Box key={property + idx} w='100%'>
                    {name && (
                      <MetadataWithTaxonomy
                        url={pathogen.url}
                        value={name}
                        fontWeight='semibold'
                      />
                    )}
                    {commonName && (
                      <Text fontSize='inherit' lineHeight='inherit'>
                        {commonName}
                      </Text>
                    )}
                  </Box>
                );
              })
            ) : (
              <></>
            )}
          </MetadataList>
        );
      },
    },
    {
      label: 'Species',
      property: 'species',
      isDisabled: !species,
      content: ({ property }) => (
        <MetadataList
          property={property}
          showMoreURL={`/resources?id=${id}#overview`}
        >
          {species ? (
            species.map((species, idx) => {
              const name = Array.isArray(species.name)
                ? species.name.join(', ')
                : species.name;
              const commonName = Array.isArray(species.commonName)
                ? species.commonName.join(', ')
                : species.commonName;
              return (
                <Box key={property + idx} w='100%'>
                  {name && (
                    <MetadataWithTaxonomy
                      url={species.url}
                      value={name}
                      fontWeight='semibold'
                    />
                  )}
                  {commonName && (
                    <Text fontSize='inherit' lineHeight='inherit'>
                      {commonName}
                    </Text>
                  )}
                </Box>
              );
            })
          ) : (
            <></>
          )}
        </MetadataList>
      ),
    },
    {
      label: 'Usage Info',
      property: 'usageInfo',
      isDisabled: !usageInfo,
      content: ({ property }) => {
        if (!usageInfo) {
          return <></>;
        }

        const name = usageInfo?.name || 'Usage Agreement';
        return (
          <MetadataList
            property={property}
            showMoreURL={`/resources?id=${id}#overview`}
          >
            {name && <MetadataWithTaxonomy url={usageInfo.url} value={name} />}
          </MetadataList>
        );
      },
    },
    {
      label: 'Variable Measured',
      property: 'variableMeasured',
      isDisabled: !variableMeasured,
      content: ({ property }) => {
        if (!variableMeasured) {
          return <></>;
        }

        return (
          <MetadataList
            property={property}
            showMoreURL={`/resources?id=${id}#overview`}
          >
            {variableMeasured.map((variableMeasured, idx) => {
              return <Text key={property + idx}>{variableMeasured}</Text>;
            })}
          </MetadataList>
        );
      },
    },
  ] as {
    label: string;
    property: string;
    isDisabled: boolean;
    content: (args: { property: string }) => React.JSX.Element;
  }[];

  const sortedMetadataContent = sortMetadataArray(METADATA_CONTENT, SORT_ORDER);

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
                    {sortedMetadataContent.map(
                      ({ label, property, isDisabled }) => {
                        const color = isDisabled
                          ? 'gray'
                          : getMetadataTheme(property);

                        return (
                          <Tag
                            key={label}
                            size='sm'
                            variant='subtle'
                            borderRadius='full'
                            colorScheme={color}
                            // darker for variableMeasured
                            color={`${color}.${
                              property === 'variableMeasured' ? '900' : '700'
                            }`}
                            m={0.5}
                            opacity={isDisabled ? 0.65 : 1}
                          >
                            <MetadataToolTip
                              key={label}
                              propertyName={property}
                              description={
                                isDisabled
                                  ? `No ${label.toLocaleLowerCase()} data.`
                                  : undefined
                              }
                              recordType={data?.['@type']}
                            >
                              <Flex alignItems='center'>
                                <MetadataIcon
                                  id={`indicator-${property}-${id}`}
                                  title={property}
                                  glyph={property}
                                  fill={`${color}.600`}
                                  m={0.5}
                                  boxSize={4}
                                  isDisabled={isDisabled}
                                />
                                <TagLabel lineHeight='none'>
                                  <Text fontSize='xs' m={0.5} color='inherit'>
                                    {label}
                                  </Text>
                                </TagLabel>
                              </Flex>
                            </MetadataToolTip>
                          </Tag>
                        );
                      },
                    )}
                  </Flex>
                  <Flex alignItems='center'>
                    <Text mx={2} fontSize='xs'>
                      Show metadata
                    </Text>
                    <Icon
                      as={isExpanded ? FaMinus : FaPlus}
                      color='gray.600'
                      boxSize={3}
                    />
                  </Flex>
                </AccordionButton>
              </h2>
              <AccordionPanel w='100%' px={paddingCard} my={2} py={4}>
                {isExpanded ? (
                  <SimpleGrid
                    minChildWidth='250px'
                    spacingX={20}
                    spacingY={10}
                    px={4}
                  >
                    {sortedMetadataContent.map(({ content, ...props }) => {
                      return (
                        <MetadataBlock
                          key={`${id}-${props.label}`}
                          id={`${id}-${props.label}`}
                          {...props}
                        >
                          {content({ property: props.property })}
                        </MetadataBlock>
                      );
                    })}
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

export default MetadataAccordion;
