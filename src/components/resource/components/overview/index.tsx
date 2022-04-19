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
  UnorderedList,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaGlobeAmericas,
  FaLanguage,
} from 'react-icons/fa';
import {
  formatCitationString,
  formatDOI,
  formatLicense,
} from 'src/utils/helpers';
import MetadataConfig from 'configs/resource-metadata.json';
import StatField from './components/stat-field';

interface Overview extends Partial<FormattedResource> {
  isLoading: boolean;
}

const Overview: React.FC<Overview> = ({
  citation,
  doi,
  healthCondition,
  infectiousAgent,
  infectiousDisease,
  language,
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
}) => {
  // get copy label from config for a given property.
  const getStatInfo = (metadataProperty: string) => {
    const metadataField = MetadataConfig.fields.find(
      d => d.property === metadataProperty,
    );

    return metadataField
      ? {...metadataField, label: metadataField.title}
      : {label: metadataProperty, info: ''};
  };
  const licenseInfo = license ? formatLicense(license) : null;
  return (
    <Flex p={4} w='100%' flexWrap='wrap'>
      {(doi || nctid || numberOfDownloads || numberOfViews) && (
        <Box w={{sm: '100%', lg: 'unset'}} mx={[0, 0, 4]} my={4}>
          <SimpleGrid
            minChildWidth='150px'
            maxWidth={500}
            spacingX={4}
            spacingY={2}
            p={4}
            border='0.5px solid'
            borderColor='gray.100'
          >
            {/* Altmetric Badge */}
            {(doi || nctid) && (
              <StatField
                isLoading={false}
                {...getStatInfo('Altmetric Rating')}
                d='flex'
                justifyContent='center'
              >
                <Flex alignItems='center' direction='column'>
                  {doi && (
                    <div
                      data-badge-popover='right'
                      data-badge-type='donut'
                      data-doi={formatDOI(doi)}
                      className='altmetric-embed'
                      data-link-target='blank'
                    ></div>
                  )}
                  {!doi && nctid && (
                    <div
                      data-badge-popover='right'
                      data-badge-type='donut'
                      data-nct-id={nctid}
                      className='altmetric-embed'
                      data-link-target='blank'
                    ></div>
                  )}
                  <Link
                    fontSize={'xs'}
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

      <Stack
        flex={1}
        p={[0, 0, 4]}
        divider={<StackDivider borderColor='gray.100' />}
        direction='column'
        spacing={4}
      >
        {/* Copyright license agreement */}
        {
          <StatField isLoading={isLoading} {...getStatInfo('license')}>
            {licenseInfo ? (
              <>
                {licenseInfo?.img && (
                  <Image src={licenseInfo.img} alt={licenseInfo.type} />
                )}
                {licenseInfo?.url ? (
                  <Link href={licenseInfo.url} isExternal>
                    {licenseInfo.title}
                  </Link>
                ) : (
                  licenseInfo?.title
                )}
              </>
            ) : (
              '-'
            )}
          </StatField>
        }

        {/* DOI */}
        {doi && (
          <StatField isLoading={isLoading} {...getStatInfo('doi')}>
            {doi.includes('http') ? (
              <Link href={doi} isExternal>
                {doi}
              </Link>
            ) : (
              doi
            )}
          </StatField>
        )}

        {/* species covered in resource */}
        {species && (
          <StatField isLoading={isLoading} {...getStatInfo('species')}>
            <UnorderedList ml={0}>
              {species.map((m, i) => {
                return (
                  <ListItem key={`${m.name}-${i}`}>
                    {m.url ? (
                      <Link href={m.url} isExternal>
                        {m.name}
                      </Link>
                    ) : (
                      m.name
                    )}
                  </ListItem>
                );
              })}
            </UnorderedList>
          </StatField>
        )}

        {/* health condition covered */}
        {healthCondition && (
          <StatField isLoading={isLoading} {...getStatInfo('healthCondition')}>
            {healthCondition}
          </StatField>
        )}

        {/* infectious agent involved */}
        {infectiousAgent && (
          <StatField isLoading={isLoading} {...getStatInfo('infectiousAgent')}>
            <UnorderedList ml={0}>
              {infectiousAgent.map((m, i) => {
                return (
                  <ListItem key={`${m.name}-${i}`}>
                    {m.url ? (
                      <Link href={m.url} isExternal>
                        {m.name}
                      </Link>
                    ) : (
                      m.name
                    )}
                  </ListItem>
                );
              })}
            </UnorderedList>
          </StatField>
        )}

        {/* infectious disease covered */}
        {infectiousDisease && (
          <StatField
            isLoading={isLoading}
            {...getStatInfo('infectiousDisease')}
          >
            <UnorderedList ml={0}>
              {infectiousDisease.map((m, i) => {
                return (
                  <ListItem key={`${m.name}-${i}`}>
                    {m.url ? (
                      <Link href={m.url} isExternal>
                        {m.name}
                      </Link>
                    ) : (
                      m.name
                    )}
                  </ListItem>
                );
              })}
            </UnorderedList>
          </StatField>
        )}

        {/* topics covered in resource*/}
        {topic && (
          <StatField isLoading={isLoading} {...getStatInfo('topic')}>
            {Array.isArray(topic) ? topic.join(', ') : topic}
          </StatField>
        )}

        {/* variable measured, used in conjunction with measurement technique */}
        {variableMeasured && (
          <StatField isLoading={isLoading} {...getStatInfo('variableMeasured')}>
            {variableMeasured}
          </StatField>
        )}

        {/* measurement technique */}
        {measurementTechnique && (
          <StatField
            isLoading={isLoading}
            {...getStatInfo('measurementTechnique')}
          >
            <UnorderedList ml={0}>
              {measurementTechnique.map((m, i) => {
                return (
                  <ListItem key={`${m.name}-${i}`}>
                    {m.url ? (
                      <Link href={m.url} isExternal>
                        {m.name}
                      </Link>
                    ) : (
                      m.name
                    )}
                  </ListItem>
                );
              })}
            </UnorderedList>
          </StatField>
        )}

        {/* language */}
        {language && (
          <StatField
            icon={FaLanguage}
            isLoading={isLoading}
            {...getStatInfo('language')}
          >
            {language.name}
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

        {/* citation */}
        {citation && (
          <StatField isLoading={isLoading} {...getStatInfo('citation')}>
            {citation.map(c => formatCitationString(c))}
          </StatField>
        )}
      </Stack>
    </Flex>
  );
};

export default Overview;
