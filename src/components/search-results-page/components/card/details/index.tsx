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
import { MetadataToolTip, MetadataIcon } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';

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
    applicationCategory,
    programmingLanguage,
  } = data || {};

  const paddingCard = [4, 6, 8, 10];
  const licenseInfo = license ? formatLicense(license) : null;

  const fundingInfo =
    funding?.filter(f => {
      return f.identifier || f?.funder?.name;
    }) || null;

  const Badge = ({
    property,
    glyph,
    fill,
    value,
    ...props
  }: {
    property: string;
    glyph: string;
    fill?: string;
    value: any;
  }) => (
    <MetadataToolTip propertyName={glyph} recordType={data?.['@type']}>
      <MetadataIcon
        id={`indicator-${glyph}-${id}`}
        glyph={glyph}
        mx={1}
        fill={value ? getMetadataColor(glyph) : 'gray.400'}
        {...props}
      />
    </MetadataToolTip>
  );

  const MetadataIndicator = () => {
    return (
      <Flex mx={[0, 2]} my={1}>
        <Badge property='license' glyph='license' value={licenseInfo} />
        <Badge property='usageInfo' glyph='usageInfo' value={usageInfo?.name} />
        <Badge property='funding' glyph='funding' value={fundingInfo} />
        <Badge
          property='measurementTechnique'
          glyph='measurementTechnique'
          value={measurementTechnique}
        />
        <Badge
          property='variableMeasured'
          glyph='variableMeasured'
          value={variableMeasured}
        />
        <Badge
          property='infectiousAgent'
          glyph='infectiousAgent'
          value={infectiousAgent}
        />
        <Badge
          property='healthCondition'
          glyph='healthCondition'
          value={healthCondition}
        />
        <Badge property='species' glyph='species' value={species} />
        <Badge
          property='applicationCategory'
          glyph='applicationCategory'
          value={applicationCategory}
        />{' '}
        <Badge
          property='programmingLanguage'
          glyph='programmingLanguage'
          value={programmingLanguage}
        />
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
                            {usageInfo.name}
                          </Link>
                        ) : (
                          usageInfo?.name
                        )}
                        {usageInfo?.description && ` ${usageInfo.description}`}
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
                      <Text color='inherit'>{variableMeasured.join(', ')}</Text>
                    )}
                  </MetadataProperty>
                  {/* Infectious Agent*/}
                  <MetadataProperty
                    id={`ia-${id}`}
                    label='Infectious Agent'
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
                  <MetadataProperty
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
                  </MetadataProperty>

                  {/* Programming Language */}
                  <MetadataProperty
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
