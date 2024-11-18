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
  generateMetadataContentforCompToolCard,
  SORT_ORDER,
  SORT_ORDER_COMPTOOL,
} from 'src/components/metadata';
import {
  MetadataBlock,
  MetadataContent,
  MetadataList,
  MetadataListItem,
  generateMetadataContent,
  getMetadataDescription,
  sortMetadataArray,
} from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';

export interface OverviewProps extends Partial<FormattedResource> {
  isLoading: boolean;
}

const DATASET_SORT_ORDER = [...SORT_ORDER, 'spatialCoverage'];

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
  topicCategory,
  temporalCoverage,
  variableMeasured,
  ...data
}) => {
  const type = data?.['@type'] || 'Dataset';
  const content =
    type == 'ComputationalTool'
      ? generateMetadataContentforCompToolCard({
          id,
          availableOnDevice: data?.availableOnDevice,
          featureList: data?.featureList,
          funding: data?.funding,
          input: data?.input,
          license: data?.license,
          output: data?.output,
          softwareHelp: data?.softwareHelp,
          softwareRequirements: data?.softwareRequirements,
          softwareVersion: data?.softwareVersion,
        })
      : generateMetadataContent({
          id,
          healthCondition,
          infectiousAgent,
          measurementTechnique,
          species,
          topicCategory,
          variableMeasured,
        });

  const sortedMetadataContent =
    type == 'ComputationalTool'
      ? sortMetadataArray(content, SORT_ORDER_COMPTOOL)
      : sortMetadataArray(
          [
            ...content,
            {
              id: `${id}-spatialCoverage`,
              label: 'Spatiotemporal Coverage',
              property: 'spatialCoverage',
              isDisabled: !(
                spatialCoverage ||
                temporalCoverage?.some(
                  coverage => coverage.temporalInterval,
                ) === true ||
                inLanguage?.name ||
                inLanguage?.alternateName
              ),
            },
          ],
          DATASET_SORT_ORDER,
        );

  return (
    <Flex py={2} w='100%' flexWrap='wrap' flexDirection={['column', 'row']}>
      <Flex alignItems='center' w='100%'>
        <SimpleGrid
          minChildWidth={{ base: 'unset', sm: '280px', xl: '300px' }}
          spacingX={14}
          spacingY={10}
          p={4}
          border='1px solid'
          borderColor='gray.100'
          borderRadius='semi'
          w='100%'
        >
          {sortedMetadataContent.map(
            ({ img, items, name, glyph, url, ...props }) => {
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
            },
          )}
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
  type?: FormattedResource['@type'];
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
    const language = new Intl.DisplayNames(['en'], {
      type: 'language',
    }).of(languageCode);
    if (!language) return languageCode;
    return language.charAt(0).toUpperCase() + language.slice(1);
  };

  const spatialInformation = spatialCoverage
    ?.filter(s => s.name)
    .map(s => s.name);

  return (
    <Skeleton key={`block-${id}-spatioTemporal`} isLoaded={!isLoading}>
      <MetadataBlock
        label='Spatiotemporal Coverage'
        property='spatialCoverage'
        isDisabled={isDisabled}
        bg='gray.900'
        tooltipLabel={
          <>
            <Box>
              Spatial Coverage:{' '}
              {getMetadataDescription('spatialCoverage', type)}
            </Box>
            <Box>
              Temporal Coverage:{' '}
              {getMetadataDescription('temporalCoverage', type)}
            </Box>
            <Box>Language: {getMetadataDescription('inLanguage', type)}</Box>
          </>
        }
      >
        <VStack alignItems='flex-start' divider={<Divider />}>
          {/* Geographic information of dataset */}
          {spatialInformation && (
            <>
              <Text fontWeight='medium' color='gray.800'>
                Spatial Coverage
              </Text>
              <MetadataContent name={spatialInformation.join(', ')} />
            </>
          )}

          {/* Period information of dataset */}
          {temporalCoverage &&
            temporalCoverage.map((coverage, idx) => {
              if (!coverage.temporalInterval) {
                return (
                  <React.Fragment key={'temporal' + idx}> </React.Fragment>
                );
              }
              return (
                <React.Fragment key={'temporal' + idx}>
                  <Text fontWeight='medium' color='gray.800'>
                    Temporal Coverage
                  </Text>
                  {/* Start */}
                  {coverage?.temporalInterval?.name && (
                    <Text>{coverage?.temporalInterval?.name}</Text>
                  )}
                  {coverage?.temporalInterval?.startDate && (
                    <Text>
                      <Text as='span' fontWeight='medium'>
                        Start Date:
                      </Text>{' '}
                      {coverage.temporalInterval.startDate}
                    </Text>
                  )}
                  {/* End */}
                  {coverage?.temporalInterval?.endDate && (
                    <Text>
                      <Text as='span' fontWeight='medium'>
                        End Date:
                      </Text>{' '}
                      {coverage.temporalInterval.endDate}
                    </Text>
                  )}
                  {/* Duration */}
                  {coverage?.temporalInterval?.duration && (
                    <Text>
                      <Text as='span' fontWeight='medium'>
                        Duration:
                      </Text>{' '}
                      {coverage.temporalInterval.duration}
                    </Text>
                  )}
                </React.Fragment>
              );
            })}

          {/* Language of dataset */}
          {inLanguage?.name && (
            <>
              <Text fontWeight='medium' color='gray.800'>
                Language
              </Text>
              <MetadataContent name={getLanguageDisplayName(inLanguage.name)} />
            </>
          )}
        </VStack>
      </MetadataBlock>
    </Skeleton>
  );
};
