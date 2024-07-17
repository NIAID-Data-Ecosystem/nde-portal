import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { DisplayHTMLContent } from 'src/components/html-content';
import NextLink from 'next/link';
import type { SourceResponse } from 'src/pages/sources';
import { queryFilterObject2String } from 'src/components/filters/helpers';
import { formatDate } from 'src/utils/api/helpers';
import {
  FaMagnifyingGlass,
  FaMinus,
  FaPlus,
  FaUpRightFromSquare,
} from 'react-icons/fa6';
import { SearchInput } from 'src/components/search-input';
import { TagWithUrl } from 'src/components/tag-with-url';

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
    data
      ?.filter((source: { name: string }) =>
        source.name.toLowerCase().includes(searchValue.toLowerCase()),
      )
      .sort((a: { name: string }, b: { name: any }) =>
        a.name.localeCompare(b.name),
      ) || [];

  return (
    <Box id='sources-main' mb={10} width='100%' height='100%'>
      <Box>
        <Flex
          justifyContent='space-between'
          alignItems='center'
          flexWrap='wrap'
        >
          <Heading as='h1' size='h5' my={1} ml={0}>
            Data Sources
          </Heading>

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
        </Flex>
        <Divider />
      </Box>

      {!isLoading ? (
        <>
          <Flex justifyContent='space-between' flexWrap='wrap'>
            <Box minW='250px' m={2}>
              <Text fontSize='xs' color='gray.800'>
                API Version:
                {metadata?.version && (
                  <TagWithUrl
                    bg='status.info_lt'
                    href={`${process.env.NEXT_PUBLIC_API_URL}/metadata`}
                    isExternal
                    fontWeight='semibold'
                    mx={1}
                  >
                    V.{metadata.version}
                  </TagWithUrl>
                )}
              </Text>
              {metadata?.date && (
                <Text fontSize='xs' color='gray.800' fontWeight='medium'>
                  Data last harvested: {formatDate(metadata?.date)}
                </Text>
              )}
            </Box>
            <Flex justifyContent='flex-end' flex={1}>
              <Box w='300px' m={2}>
                <SearchInput
                  size='sm'
                  ariaLabel='Search for a source'
                  placeholder='Search for a source'
                  value={searchValue}
                  handleChange={e => setSearchValue(e.currentTarget.value)}
                  type='text'
                />
                {data?.length && (
                  <Text
                    fontSize='xs'
                    fontWeight='light'
                    mt={2}
                    color='gray.800'
                    textAlign='right'
                  >
                    <Text as='span' fontWeight='medium'>
                      {sources.length}
                    </Text>{' '}
                    result{sources.length === 1 ? '' : 's'}.
                  </Text>
                )}
              </Box>
            </Flex>
          </Flex>
          {sources.map((sourceObj: SourceResponse, i: number) => {
            const id = `${sourceObj.name.replace(/\s+/g, '-')}`;
            return (
              <Box
                key={id}
                id={id}
                as='section'
                boxShadow='low'
                borderRadius='semi'
                borderColor='gray.200'
                my={4}
                py={6}
                sx={{ '>*': { px: 4, mt: 4, mx: [0, 4, 8] } }}
              >
                <HStack spacing={2}>
                  <Text fontWeight='bold' color='text.heading' fontSize='xl'>
                    {sourceObj.name}
                  </Text>
                  {sourceObj.isNiaidFunded && (
                    <Badge colorScheme='blue' variant='subtle'>
                      NIAID
                    </Badge>
                  )}
                </HStack>
                <Box mt={2}>
                  {sourceObj?.numberOfRecords > 0 && (
                    <Text fontWeight='semibold' fontSize='sm'>
                      {sourceObj.numberOfRecords.toLocaleString()} Records
                      Available
                    </Text>
                  )}

                  <DisplayHTMLContent content={sourceObj.description} />

                  {sourceObj?.schema && (
                    <Box mt={4} w='100%'>
                      <Flex
                        w='100%'
                        as='button'
                        flexDirection={{ base: 'column', sm: 'row' }}
                        alignItems='center'
                        justifyContent='space-between'
                        onClick={() => schemaIdFunc(sourceObj.name)}
                        borderY='1px solid'
                        borderColor='gray.200'
                        p={2}
                      >
                        <Text
                          fontWeight='semibold'
                          color='gray.800'
                          textAlign={['center', 'left']}
                          lineHeight='short'
                        >
                          Visualization of {sourceObj.name} properties
                          transformed to the NIAID Data Ecosystem
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
                </Box>
                <Box>
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
                </Box>
                <Flex justifyContent={'space-between'} flexWrap='wrap'>
                  <NextLink
                    href={{
                      pathname: `/search`,
                      query: {
                        q: '',
                        filters: queryFilterObject2String({
                          'includedInDataCatalog.name': [sourceObj.id],
                        }),
                      },
                    }}
                    passHref
                  >
                    <Button
                      as='span'
                      wordBreak='break-word'
                      whiteSpace='normal'
                      textAlign='center'
                      flex={1}
                      size='sm'
                      colorScheme='primary'
                      leftIcon={<Icon as={FaMagnifyingGlass} boxSize={3} />}
                      variant='solid'
                      height='unset'
                      m={1}
                    >
                      Search for {sourceObj.name} resources
                    </Button>
                  </NextLink>
                  {sourceObj.url && (
                    <NextLink
                      href={{
                        pathname: `${sourceObj.url}`,
                      }}
                      passHref
                      target='_blank'
                    >
                      <Button
                        as='span'
                        wordBreak='break-word'
                        whiteSpace='normal'
                        textAlign='center'
                        flex={1}
                        size='sm'
                        colorScheme='primary'
                        rightIcon={
                          <Icon as={FaUpRightFromSquare} boxSize={3} />
                        }
                        variant='outline'
                        height='unset'
                        m={1}
                      >
                        View {sourceObj.name} website
                      </Button>
                    </NextLink>
                  )}
                </Flex>
              </Box>
            );
          })}
        </>
      ) : (
        <Flex flexDirection='column'>
          {[...Array(10).keys()].map((_, i) => (
            <Skeleton
              width='100%'
              h={isLoading ? 4 : 'unset'}
              my={2}
              isLoaded={!isLoading}
              flex={1}
              key={i}
            >
              <Box minH={200}></Box>
            </Skeleton>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default Main;
