import React from 'react';
import {
  Box,
  Divider,
  Flex,
  Image,
  Link,
  Skeleton,
  SkeletonCircle,
  Tag,
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
import {
  StyledSectionHead,
  StyledSectionHeading,
} from 'src/components/resource/styles';
import Stat from '../stat';

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
}

const Overview: React.FC<Overview> = ({
  doi,
  isLoading,
  keywords,
  // language,
  license,
  // numberOfDownloads,
  // numberOfViews,
  // spatialCoverage,
  // temporalCoverage,
}) => {
  let temporalCoverage = '1900s';
  let spatialCoverage = 'Americas';
  let numberOfDownloads = 734;
  let numberOfViews = 34;
  let language = 'English';
  let doi_number = doi?.split('https://doi.org/')[1];
  return (
    <Flex p={4} flexWrap='wrap' flexDirection={['column', 'column', 'row']}>
      <Box flex={1}>
        <Flex px={4} py={2}>
          <AltmetricBadge doi={doi_number} />
          <Box>
            <Flex>
              <Stat
                isLoading={isLoading}
                label='downloads'
                icon={FaDownload}
                value={numberOfDownloads}
                m={2}
              />
              <Stat
                isLoading={isLoading}
                label='DOI'
                value={doi_number}
                m={2}
              />
            </Flex>
            <Flex>
              <Stat
                isLoading={isLoading}
                label='views'
                icon={FaEye}
                value={numberOfViews}
                m={2}
              />
              <Stat isLoading={isLoading} label='License' m={2}>
                <Link wordBreak='break-word'>{license}</Link>
              </Stat>
            </Flex>
          </Box>
        </Flex>
        <Divider />
        <StyledSectionHead>
          <StyledSectionHeading>Keywords</StyledSectionHeading>
        </StyledSectionHead>
        <Box p={4}>
          <Skeleton isLoaded={!isLoading}>
            <Flex flexWrap='wrap'>
              {(!keywords || keywords.length === 0) && (
                <Text>No keywords available.</Text>
              )}
              {keywords &&
                keywords.map(keyword => {
                  return (
                    <Tag key={keyword} m={2} colorScheme='primary'>
                      {keyword}
                    </Tag>
                  );
                })}
            </Flex>
          </Skeleton>
        </Box>
      </Box>

      <Skeleton flex={1} isLoaded={!isLoading}>
        {(spatialCoverage || temporalCoverage || language) && (
          <Flex flex={1} flexDirection={['row', 'row', 'column']} pl={4}>
            {/* [TO DO]: Incorporate vis if appropriate */}
            {/* {spatialCoverage && (
              <Image
                src='/assets/map-placeholder.png'
                alt='geo location covered by resource'
                minWidth='200px'
              />
            )} */}
            <Box>
              {spatialCoverage && (
                <Stat
                  isLoading={isLoading}
                  label='Geographic Location'
                  value={spatialCoverage}
                  icon={FaGlobeAmericas}
                />
              )}
              {temporalCoverage && (
                <Stat
                  isLoading={isLoading}
                  label='Period'
                  value={temporalCoverage}
                  icon={FaCalendarAlt}
                ></Stat>
              )}
              {language && (
                <Stat
                  isLoading={isLoading}
                  label='Language'
                  value={language}
                  icon={FaLanguage}
                ></Stat>
              )}
            </Box>
          </Flex>
        )}
      </Skeleton>
    </Flex>
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
      <Box m={4} flexDirection='column' alignItems='start' minW={200}>
        <Image src={data.images.medium} alt='Altmetric rating.' />
        <Box pt={2}>
          <Text fontSize='xs' color='gray.800'>
            <Link
              href={
                'https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated'
              }
              target='_blank'
            >
              Altmetric
            </Link>{' '}
            rating
          </Text>
        </Box>
      </Box>
    )
  );
};
