import React, { useState } from 'react';
import { FaMinus, FaPlus, FaUpRightFromSquare } from 'react-icons/fa6';
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  Icon,
  SkeletonText,
  StackDivider,
  Text,
  VStack,
} from '@chakra-ui/react';
import { BadgeWithTooltip } from 'src/components/badges';
import { Link } from 'src/components/link';
import { MetadataCompatibilitySourceBadge } from 'src/components/metadata-compatibility-source-badge';
import {
  StyledCard,
  StyledCardButton,
  StyledCardDescription,
  StyledCardStack,
} from 'src/components/table-of-contents/components/card';
import { SectionHeader } from 'src/components/table-of-contents/layouts/section-header';
import { SectionSearch } from 'src/components/table-of-contents/layouts/section-search';
import { TagWithUrl } from 'src/components/tag-with-url';
import type { SourceResponse } from 'src/pages/sources';
import { formatDate } from 'src/utils/api/helpers';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-builders';

interface Main {
  data?: SourceResponse[];
  isLoading: boolean;
  metadata?: {
    version: string;
    date: string;
  } | null;
}

const Main: React.FC<Main> = ({ data, isLoading, metadata }) => {
  const [schemaId, setSchemaId] = useState<string[]>([]);
  const [schemaText, setSchemaText] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  function schemaIdFunc(sourceName: string) {
    if (schemaId.includes(sourceName) || schemaText.includes(sourceName)) {
      setSchemaText(schemaText.filter(schemaText => schemaText !== sourceName));
      return setSchemaId(schemaId.filter(schemaId => schemaId !== sourceName));
    }
    setSchemaText([...schemaText, sourceName]);
    return setSchemaId([...schemaId, sourceName]);
  }

  const sources =
    data?.filter((source: { name: string }) =>
      source.name.toLowerCase().includes(searchValue.toLowerCase()),
    ) || [];

  return (
    <Box id='sources-main' mb={10} width='100%' height='100%'>
      <SectionHeader title='Data Sources'>
        <Button
          as='a'
          href='https://github.com/NIAID-Data-Ecosystem/nde-crawlers/issues/new?assignees=&labels=&template=suggest-a-new-resource.md&title=%5BSOURCE%5D'
          target='_blank'
          colorScheme='secondary'
          size='sm'
          variant='outline'
          rightIcon={<Icon as={FaUpRightFromSquare} boxSize={3} />}
        >
          Suggest a new source
        </Button>
      </SectionHeader>
      <Flex justifyContent='space-between' flexWrap='wrap-reverse'>
        <VStack minW='250px' alignItems='flex-start' m={0.5} flex={1}>
          <SkeletonText isLoaded={!isLoading} noOfLines={1} skeletonHeight={5}>
            <Flex alignItems='center'>
              <Text
                fontSize='xs'
                lineHeight='short'
                fontWeight='semibold'
                color='text.body'
              >
                API Version:
              </Text>
              {metadata?.version && (
                <TagWithUrl
                  bg='status.info_lt'
                  href={`${process.env.NEXT_PUBLIC_API_URL}/metadata`}
                  isExternal
                  mx={1}
                >
                  V.{metadata.version}
                </TagWithUrl>
              )}
            </Flex>
          </SkeletonText>
          <SkeletonText isLoaded={!isLoading} noOfLines={1} skeletonHeight={5}>
            {metadata?.date && (
              <Text fontSize='xs' lineHeight='short' fontWeight='semibold'>
                Data last harvested:
                <Text as='span' fontWeight='normal'>
                  {' '}
                  {formatDate(metadata?.date)}
                </Text>
              </Text>
            )}
          </SkeletonText>
        </VStack>
        <SectionSearch
          data={sources}
          size='sm'
          ariaLabel='Search for a source'
          placeholder='Search for a source'
          value={searchValue}
          handleChange={e => setSearchValue(e.currentTarget.value)}
        />
      </Flex>
      <StyledCardStack>
        {sources.map((sourceObj: SourceResponse, index: number) => {
          // used for metadata compatibility badge
          const parentCollectionInfo = sourceObj?.sourceInfo?.parentCollection
            ?.id
            ? sources.find(
                source =>
                  source.key === sourceObj?.sourceInfo?.parentCollection?.id,
              )
            : null;

          const metadataCompatibilityData =
            sourceObj?.sourceInfo?.metadata_completeness ||
            parentCollectionInfo?.sourceInfo.metadata_completeness ||
            null;

          return (
            <StyledCard
              key={index}
              id={sourceObj.slug}
              isLoading={isLoading}
              title={sourceObj.name}
              subtitle={
                sourceObj.numberOfRecords > 0
                  ? `${sourceObj.numberOfRecords.toLocaleString()} resources
                        available`
                  : ''
              }
              tags={
                <>
                  {sourceObj.isNiaidFunded && (
                    <BadgeWithTooltip colorScheme='blue' variant='subtle'>
                      NIAID
                    </BadgeWithTooltip>
                  )}
                </>
              }
              renderCTA={() =>
                sourceObj.id ? (
                  <StyledCardButton
                    maxWidth='500px'
                    href={{
                      pathname: `/search`,
                      query: {
                        q: '',
                        filters: queryFilterObject2String({
                          'includedInDataCatalog.name': [sourceObj.id],
                        }),
                      },
                    }}
                  >
                    Search for {sourceObj.name} resources
                  </StyledCardButton>
                ) : (
                  <></>
                )
              }
            >
              <>
                {/* Release dates */}
                <HStack divider={<StackDivider borderColor='gray.100' />}>
                  <Text fontSize='xs' fontWeight='semibold' color='text.body'>
                    Latest Release:{' '}
                    <Text as='span' fontWeight='normal'>
                      {sourceObj.dateModified
                        ? new Date(sourceObj.dateModified).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )
                        : 'N/A'}
                    </Text>
                  </Text>
                  <Text fontSize='xs' fontWeight='semibold' color='text.body'>
                    First Released:{' '}
                    <Text as='span' fontWeight='normal'>
                      {sourceObj.dateCreated
                        ? new Date(sourceObj.dateCreated).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )
                        : 'N/A'}
                    </Text>
                  </Text>
                </HStack>

                {/* Description */}
                {sourceObj?.description && (
                  <StyledCardDescription>
                    {sourceObj?.description}
                  </StyledCardDescription>
                )}

                {/* Link to source's website */}
                {sourceObj.url && (
                  <Link href={sourceObj.url} isExternal>
                    {`${sourceObj.name} website`}
                  </Link>
                )}
                {/* Source Compatibility */}
                {metadataCompatibilityData && (
                  <Box my={2}>
                    <MetadataCompatibilitySourceBadge
                      data={metadataCompatibilityData}
                    />
                  </Box>
                )}

                {/* Property transformations table */}
                {sourceObj?.schema && (
                  <Box w='100%' py={2}>
                    <Flex
                      w='100%'
                      as='button'
                      flexDirection={{ base: 'column', sm: 'row' }}
                      alignItems='center'
                      justifyContent='space-between'
                      onClick={() => schemaIdFunc(sourceObj.name)}
                      borderY='1px solid'
                      borderColor='gray.100'
                      px={0}
                      py={2}
                    >
                      <Text
                        fontWeight='semibold'
                        color='gray.800'
                        textAlign='left'
                        lineHeight='short'
                      >
                        Visualization of {sourceObj.name} properties transformed
                        to the NIAID Data Ecosystem
                      </Text>
                      <Flex alignItems='center'>
                        <Text mx={2} fontSize='xs' color='gray.800'>
                          {schemaText.includes(sourceObj.name)
                            ? 'Hide'
                            : 'Show'}
                        </Text>
                        <Icon
                          as={
                            schemaText.includes(sourceObj.name)
                              ? FaMinus
                              : FaPlus
                          }
                          color='gray.800'
                          boxSize={3}
                        />
                      </Flex>
                    </Flex>
                    <Collapse in={schemaId.includes(sourceObj.name)}>
                      {schemaId.includes(sourceObj.name) && (
                        <Box
                          mt={4}
                          position='relative'
                          overflowX='auto'
                          boxShadow='low'
                          borderRadius='semi'
                        >
                          <Box
                            as='table'
                            w='100%'
                            bg='#374151'
                            color='whiteAlpha.800'
                            textAlign='left'
                            fontSize='sm'
                          >
                            <Box as='thead' textTransform='uppercase'>
                              <tr>
                                <Box as='th' scope='col' px={6} py={3}>
                                  {sourceObj.name} Property
                                </Box>
                                <Box as='th' scope='col' px={6} py={3}>
                                  NIAID Data Ecosystem Property
                                </Box>
                              </tr>
                            </Box>

                            <Box as='tbody' bg='#1F2937' border='gray.100'>
                              {Object.entries(sourceObj.schema).map(
                                (item, i) => {
                                  return (
                                    <Box
                                      as='tr'
                                      key={item[0]}
                                      borderBottom='1px solid'
                                      borderColor='gray.700'
                                    >
                                      {Object.entries(item).map(field => {
                                        return (
                                          <Box
                                            as='td'
                                            key={`${field[0]}-${field[1]}`}
                                            px={6}
                                            py={2}
                                            fontWeight='medium'
                                            color='#fff'
                                            whiteSpace='nowrap'
                                          >
                                            {field[1]}
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  );
                                },
                              )}
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Collapse>
                  </Box>
                )}
              </>
            </StyledCard>
          );
        })}
      </StyledCardStack>
    </Box>
  );
};

export default Main;
