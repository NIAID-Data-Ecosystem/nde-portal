import React from 'react';
import { Box, Flex, Link } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { formatDOI } from 'src/utils/helpers';
import StatField from '../overview/components/stat-field';

export interface ResourceStatsProps extends Partial<FormattedResource> {}

const ResourceStats: React.FC<ResourceStatsProps> = props => {
  const { citation, doi, nctid } = props;
  if (!citation && !doi && !nctid) {
    return <></>;
  }
  return (
    <Flex
      w={{ base: 'unset', lg: '100%' }}
      p={[4, 0]}
      flexWrap='wrap'
      flexDirection={['column', 'row']}
    >
      {(doi || nctid) && (
        <Box w={{ base: 'unset', lg: '100%' }} my={[0, 0, 0, 4]}>
          {/* Altmetric Badge */}
          {(doi || nctid || citation?.[0]['pmid']) && (
            <StatField
              isLoading={false}
              label='Altmetric Rating'
              display='flex'
              justifyContent={{ base: 'flex-start', lg: 'center' }}
              minWidth='200px'
            >
              <Flex alignItems='center' direction='column'>
                {(doi || nctid || citation?.[0]['pmid']) && (
                  <div
                    role='link'
                    aria-label={`altmetric badge for id ${doi || nctid}`}
                    data-badge-popover='bottom'
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
          {/* {aggregateRating &&
              (aggregateRating.ratingValue || aggregateRating.ratingCount) &&
              includedInDataCatalog?.name && (
                <StatField
                  isLoading={false}
                  display='flex'
                  label={`${includedInDataCatalog.name} Metrics`}
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
              )} */}
          {/* {interactionStatistics &&
              interactionStatistics.userInteractionCount &&
              includedInDataCatalog?.name && (
                <StatField
                  isLoading={false}
                  display='flex'
                  label={`${includedInDataCatalog.name} User Interaction Metrics`}
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
              )} */}
        </Box>
      )}
    </Flex>
  );
};

export default ResourceStats;
