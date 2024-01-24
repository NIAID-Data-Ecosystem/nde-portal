import React from 'react';
import {
  Box,
  Divider,
  Flex,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import {
  MetadataBlock,
  MetadataContent,
  MetadataList,
  MetadataListItem,
  SORT_ORDER,
  generateMetadataContent,
  getMetadataDescription,
  sortMetadataArray,
} from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';

export interface OverviewProps extends Partial<FormattedResource> {
  isLoading: boolean;
}

const Overview: React.FC<OverviewProps> = ({
  healthCondition,
  id,
  infectiousAgent,
  inLanguage,
  isLoading,
  locationNames,
  measurementTechnique,
  spatialCoverage,
  species,
  temporalCoverage,
  variableMeasured,
  ...data
}) => {
  const content = generateMetadataContent({
    id,
    species,
    infectiousAgent,
    healthCondition,
    variableMeasured,
    measurementTechnique,
  });
  const sortedMetadataContent = sortMetadataArray(
    [
      ...content,
      {
        id: `${id}-spatialCoverage`,
        label: 'Spatiotemporal Coverage',
        property: 'spatialCoverage',
        isDisabled: !(
          spatialCoverage ||
          temporalCoverage?.temporalInterval ||
          inLanguage
        ),
      },
    ],
    [...SORT_ORDER, 'spatialCoverage'],
  );

  return (
    <Flex py={2} w='100%' flexWrap='wrap' flexDirection={['column', 'row']}>
      <Flex alignItems='center' w='100%'>
        <SimpleGrid
          minChildWidth={['unset', '280px']}
          spacingX={14}
          spacingY={10}
          p={4}
          border='1px solid'
          borderColor='gray.100'
          borderRadius='semi'
          w='100%'
        >
          {sortedMetadataContent.map(({ img, items, name, url, ...props }) => {
            if (props.property === 'spatialCoverage') {
              return (
                <SpatiotemporalCoverage
                  key={`block-${props.id}`}
                  id={props.id}
                  isDisabled={props.isDisabled}
                  isLoading={isLoading}
                  inLanguage={inLanguage}
                  spatialCoverage={spatialCoverage}
                  temporalCoverage={temporalCoverage}
                  type={data['@type']}
                />
              );
            }

            return (
              <Skeleton
                key={`block-${props.id}-${props.property}`}
                isLoaded={!isLoading}
              >
                <MetadataBlock
                  tooltipLabel={getMetadataDescription(
                    props.property,
                    data['@type'],
                  )}
                  {...props}
                >
                  {name && (
                    <MetadataContent
                      name={name}
                      img={img}
                      url={url}
                      {...content}
                    />
                  )}
                  {items && items.length > 0 && (
                    <ScrollContainer maxHeight='150px' overflow='auto'>
                      <MetadataList>
                        {items.map(({ key, ...item }) => {
                          return (
                            <MetadataListItem
                              key={key}
                              property={props.property}
                            >
                              <MetadataContent
                                includeOntology
                                includeSearch
                                {...item}
                              />
                            </MetadataListItem>
                          );
                        })}
                      </MetadataList>
                    </ScrollContainer>
                  )}
                </MetadataBlock>
              </Skeleton>
            );
          })}
        </SimpleGrid>
      </Flex>
    </Flex>
  );
};

export default Overview;

interface SpatiotemporalCoverageProps
  extends Pick<
    OverviewProps,
    'isLoading' | 'id' | 'inLanguage' | 'spatialCoverage' | 'temporalCoverage'
  > {
  type: FormattedResource['@type'];
  isDisabled: boolean;
}
const SpatiotemporalCoverage: React.FC<SpatiotemporalCoverageProps> = ({
  id,
  isDisabled,
  isLoading,
  inLanguage,
  spatialCoverage,
  temporalCoverage,
  type,
}) => {
  const getLanguageDisplayName = (languageCode: string) => {
    return new Intl.DisplayNames(['en'], {
      type: 'language',
    }).of(languageCode);
  };

  const spatialInformation = spatialCoverage
    ?.filter(s => s.name)
    .map(s => s.name);

  return (
    <Skeleton key={`block-${id}-spatioTemporal`} isLoaded={!isLoading}>
      <MetadataBlock
        id={`${id}-spatialCoverage`}
        label='Spatiotemporal Coverage'
        property='spatialCoverage'
        isDisabled={isDisabled}
        bg='gray.900'
        tooltipLabel={
          <Box>
            <Box>
              Spatial Coverage:{' '}
              {getMetadataDescription('spatialCoverage', type)}.
            </Box>
            <Box>
              Temporal Coverage:{' '}
              {getMetadataDescription('temporalCoverage', type)}.
            </Box>
            <Box>Language: {getMetadataDescription('inLanguage', type)}.</Box>
          </Box>
        }
      >
        <VStack alignItems='flex-start' divider={<Divider />}>
          {/* Geographic information of dataset */}

          {spatialInformation && (
            <Box>
              <Text fontWeight='medium' color='gray.800'>
                Spatial Coverage
              </Text>
              <MetadataContent name={spatialInformation.join(', ')} />
            </Box>
          )}

          {/* Period information of dataset */}
          {temporalCoverage && (
            <Box>
              <Text fontWeight='medium' color='gray.800'>
                Temporal Coverage
              </Text>
              {/* Start */}
              {temporalCoverage?.name && <Text>{temporalCoverage.name}</Text>}
              {temporalCoverage?.temporalInterval?.startDate && (
                <Text>
                  <Text as='span' fontWeight='medium'>
                    Start Date:
                  </Text>{' '}
                  {temporalCoverage.temporalInterval.startDate}
                </Text>
              )}
              {/* End */}
              {temporalCoverage?.temporalInterval?.endDate && (
                <Text>
                  <Text as='span' fontWeight='medium'>
                    End Date:
                  </Text>{' '}
                  {temporalCoverage.temporalInterval.endDate}
                </Text>
              )}
              {/* Duration */}
              {temporalCoverage?.temporalInterval?.duration && (
                <Text>
                  <Text as='span' fontWeight='medium'>
                    Duration:
                  </Text>{' '}
                  {temporalCoverage.temporalInterval.duration}
                </Text>
              )}
            </Box>
          )}

          {/* Language of dataset */}
          {inLanguage?.name && (
            <Box>
              <Text fontWeight='medium' color='gray.800'>
                Language
              </Text>
              <MetadataContent name={getLanguageDisplayName(inLanguage.name)} />
            </Box>
          )}
        </VStack>
      </MetadataBlock>
    </Skeleton>
  );
};
