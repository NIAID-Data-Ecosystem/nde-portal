import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Flex,
  Heading,
  Icon,
  Image,
  Link,
  ListItem,
  Text,
  UnorderedList,
  SimpleGrid,
} from 'nde-design-system';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { assetPrefix } from 'next.config';
import { MetadataProperty } from './components/Property';
import { MetadataBadge, MetadataIcon } from 'src/components/icon';

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
    infectiousDisease,
    healthCondition,
  } = data || {};

  const paddingCard = [4, 6, 8, 10];
  const licenseInfo = license ? formatLicense(license) : null;

  const fundingInfo =
    funding?.filter(f => {
      return f.identifier || f?.funder?.name;
    }) || null;

  const Badge = ({ property, glyph }: { property: string; glyph: string }) => (
    <MetadataBadge property={property} ml={1}>
      <MetadataIcon label={property} glyph={glyph} fill='white'></MetadataIcon>
    </MetadataBadge>
  );

  const MetadataIndicator = () => {
    return (
      <Flex mx={[0, 2]} my={1}>
        {licenseInfo && <Badge property='license' glyph='license' />}
        {fundingInfo && <Badge property='funding' glyph='funding' />}
        {measurementTechnique && (
          <Badge property='measurementTechnique' glyph='measurementTechnique' />
        )}
        {variableMeasured && (
          <Badge property='variableMeasured' glyph='variableMeasured' />
        )}
        {infectiousAgent && (
          <Badge property='infectiousAgent' glyph='infectiousAgent' />
        )}
        {infectiousDisease && (
          <Badge property='infectiousDisease' glyph='infectiousDisease' />
        )}
        {species && <Badge property='species' glyph='species' />}
      </Flex>
    );
  };

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
                    <Heading fontSize='h6' fontWeight='semibold' ml={1}>
                      Details
                    </Heading>
                    <MetadataIndicator />
                  </Flex>
                  <Icon as={isExpanded ? FaMinus : FaPlus} fontSize='xs' />
                </AccordionButton>
              </h2>
              <AccordionPanel w='100%' px={paddingCard} my={2}>
                <SimpleGrid minChildWidth={'300px'} spacing='10px'>
                  {/* License*/}
                  <MetadataProperty label='License' glyph={'license'}>
                    {licenseInfo && (
                      <>
                        {licenseInfo?.img && (
                          <Image
                            src={`${assetPrefix}${licenseInfo.img}`}
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

                  {/* Funding */}
                  <MetadataProperty label='Funding' glyph={'funding'}>
                    {fundingInfo && fundingInfo.length > 0 && (
                      <UnorderedList ml={4}>
                        {fundingInfo.map((f, i) => {
                          const { funder } = f;
                          let name = funder?.name;
                          let identifier = f.identifier;

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
                    label='Measurement Technique'
                    glyph='measurementTechnique'
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
                    label='Variable Measured'
                    glyph={'variableMeasured'}
                  >
                    {variableMeasured && (
                      <Text color='inherit'>variableMeasured</Text>
                    )}
                  </MetadataProperty>

                  {/* Infectious Agent*/}
                  <MetadataProperty
                    label='Infectious Agent'
                    glyph='infectiousAgent'
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

                  {/* Infectious Disease*/}
                  <MetadataProperty
                    label='Infectious Disease'
                    glyph='infectiousDisease'
                  >
                    {(infectiousDisease || healthCondition) && (
                      <>
                        <UnorderedList ml={0}>
                          {healthCondition && (
                            <ListItem>{healthCondition}</ListItem>
                          )}
                          {infectiousDisease?.map((m, i) => {
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
                  <MetadataProperty label='Species' glyph='species'>
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
                </SimpleGrid>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default CardDetails;
