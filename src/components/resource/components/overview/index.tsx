import React from 'react';
import {
  Box,
  Flex,
  Link,
  Skeleton,
  SkeletonCircle,
  Text,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {
  FaCalendarAlt,
  FaDownload,
  FaEye,
  FaGlobeAmericas,
  FaLanguage,
} from 'react-icons/fa';
import {useQuery} from 'react-query';
import axios from 'axios';
import {MetadataField} from '../section';
import {formatCitationString} from 'src/utils/helpers';

interface Overview {
  doi?: FormattedResource['doi'];
  isLoading: boolean;
  keywords?: FormattedResource['keywords'];
  language?: FormattedResource['language'];
  license?: FormattedResource['license'];
  numberOfDownloads?: FormattedResource['numberOfDownloads'];
  numberOfViews?: FormattedResource['numberOfViews'];
  spatialCoverage?: FormattedResource['spatialCoverage'];
  temporalCoverage?: FormattedResource['temporalCoverage'];
  citation?: FormattedResource['citation'];
  variableMeasured?: FormattedResource['variableMeasured'];
  measurementTechnique?: FormattedResource['measurementTechnique'];
  species?: FormattedResource['species'];
}

const Overview: React.FC<Overview> = ({
  citation,
  doi,
  isLoading,
  keywords,
  language,
  license,
  measurementTechnique,
  numberOfDownloads,
  numberOfViews,
  spatialCoverage,
  species,
  temporalCoverage,
  variableMeasured,
}) => {
  let doi_number = doi?.split('https://doi.org/')[1];
  return (
    <>
      <Flex flexWrap='wrap' flexDirection={['column', 'column', 'row']}>
        <Box flex={1}>
          <Flex w='100%' px={4} py={2} flexWrap='wrap'>
            <Flex>{doi && <AltmetricBadge doi={doi_number} />}</Flex>
            <Box>
              <Flex flexDirection={['column', 'column', 'row']}>
                {numberOfDownloads && (
                  <MetadataField
                    isLoading={isLoading}
                    label='downloads'
                    icon={FaDownload}
                    value={numberOfDownloads}
                    m={2}
                  />
                )}
                {numberOfViews && (
                  <MetadataField
                    isLoading={isLoading}
                    label='views'
                    icon={FaEye}
                    value={numberOfViews}
                    m={2}
                  />
                )}
              </Flex>
              <Flex flexDirection={['column', 'column']}>
                {doi && (
                  <MetadataField
                    isLoading={isLoading}
                    label='DOI'
                    value={doi_number}
                    m={2}
                  />
                )}

                {species && (
                  <MetadataField
                    isLoading={isLoading}
                    label='Species'
                    value={species}
                    m={2}
                  />
                )}

                <MetadataField
                  isLoading={isLoading}
                  label={'Variable Measured'}
                  value={variableMeasured ? variableMeasured : '-'}
                  m={2}
                />

                <MetadataField
                  isLoading={isLoading}
                  label='Measurement Technique'
                  value={measurementTechnique ? measurementTechnique : '-'}
                  m={2}
                />

                <MetadataField isLoading={isLoading} label='License' m={2}>
                  {license ? (
                    <Link href={license} wordBreak='break-word' isExternal>
                      {license}
                    </Link>
                  ) : (
                    '-'
                  )}
                </MetadataField>

                {citation && (
                  <MetadataField isLoading={isLoading} label='Citation' m={2}>
                    <Text fontSize='xs' fontWeight={'semibold'}>
                      {citation.map(c => formatCitationString(c))}
                    </Text>
                  </MetadataField>
                )}
              </Flex>
            </Box>
          </Flex>
        </Box>

        {(spatialCoverage || temporalCoverage || language) && (
          <Skeleton flex={1} isLoaded={!isLoading}>
            <Flex flex={1} flexDirection={['row', 'row', 'column']} pl={4}>
              <Box>
                {spatialCoverage && (
                  <MetadataField
                    isLoading={isLoading}
                    label='Geographic Location'
                    value={spatialCoverage}
                    icon={FaGlobeAmericas}
                  />
                )}
                {temporalCoverage && (
                  <MetadataField
                    isLoading={isLoading}
                    label='Period'
                    value={temporalCoverage}
                    icon={FaCalendarAlt}
                  ></MetadataField>
                )}
                {language?.name && (
                  <MetadataField
                    isLoading={isLoading}
                    label='Language'
                    value={language.name}
                    icon={FaLanguage}
                  ></MetadataField>
                )}
              </Box>
            </Flex>
          </Skeleton>
        )}
      </Flex>
    </>
  );
};

export default Overview;

// Displays the attention score of the resource.
const AltmetricBadge: React.FC<{doi?: string}> = ({doi}) => {
  const {isLoading, error, data} = useQuery(
    'altmetricScore',
    async () => {
      const {data} = await axios.get(
        `https://api.altmetric.com/v1/doi/10.1038/480426a`,
      );
      return data;
    },
    {retry: 0},
  );

  if (isLoading) {
    return (
      <Box m={4} minW={200}>
        <SkeletonCircle size='20' />
      </Box>
    );
  }
  if (error) {
    return <></>;
  }
  return (
    data?.images?.medium && (
      <Flex m={4} flexDirection='column' alignItems='center' minW={200}>
        <div
          data-badge-popover='right'
          data-badge-type='donut'
          data-doi={doi}
          className='altmetric-embed'
        ></div>
        <Box pt={2}>
          <Text fontSize='xs' color='gray.800'>
            <Link
              href={
                'https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated'
              }
              target='_blank'
              isExternal
            >
              Altmetric rating
            </Link>
          </Text>
        </Box>
      </Flex>
    )
  );
};
