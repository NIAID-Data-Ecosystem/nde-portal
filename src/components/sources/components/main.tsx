import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  Heading,
  SearchInput,
  Skeleton,
  Text,
} from 'nde-design-system';
import { DisplayHTMLContent } from 'src/components/html-content';
import NextLink from 'next/link';
import { SourceResponse } from 'src/pages/sources';

interface Main {
  data?: SourceResponse[];
  isLoading: boolean;
}

const Main: React.FC<Main> = ({ data, isLoading }) => {
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
    <Box id='sources-main' mb={10} height='100%'>
      <Box>
        <Flex
          justifyContent='space-between'
          alignItems='center'
          flexWrap='wrap'
        >
          <Heading as='h1' size='h5' p={2} my={4} ml={0}>
            Version 1.0.0 Data Sources
          </Heading>
          <Button
            href='https://github.com/NIAID-Data-Ecosystem/nde-crawlers/issues/new?assignees=&labels=&template=suggest-a-new-resource.md&title=%5BSOURCE%5D'
            isExternal
            colorScheme='secondary'
            size='sm'
            variant='outline'
          >
            Suggest a new Source
          </Button>
        </Flex>
        <Divider />
      </Box>

      {!isLoading ? (
        <>
          <Flex justifyContent='flex-end' my={8}>
            <Box>
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
          {sources.map((sourceObj: SourceResponse, i: number) => {
            return (
              <Box
                id={`${sourceObj.name}`}
                as='section'
                key={i}
                pb={5}
                boxShadow='low'
                borderRadius='semi'
                borderColor='gray.200'
                m={2}
                p={[4, 4, 2]}
              >
                <Box
                  bg='tertiary.700'
                  boxShadow='low'
                  my={3}
                  mt={[4, 6]}
                  mx={[0, 0, 5]}
                  borderRadius='semi'
                  display='inline-flex'
                >
                  <Heading
                    as='h2'
                    size='h6'
                    color='white'
                    mx={4}
                    display='inline'
                    wordBreak='break-word'
                  >
                    {sourceObj.name}
                  </Heading>
                </Box>
                <Text ml={{ base: 2, md: 14 }} fontWeight='bold'>
                  {sourceObj.numberOfRecords.toLocaleString()} Records Available
                </Text>
                <Box mx={[2, 2, 20]}>
                  <DisplayHTMLContent content={sourceObj.description} mt={4} />

                  {sourceObj?.schema && (
                    <Box mt={4} fontWeight='bold' display={['none', 'block']}>
                      <Heading as='h3' size='xs'>
                        Visualization of {sourceObj.name} properties transformed
                        to the NIAID Data Ecosystem
                      </Heading>
                      {(schemaText.includes(sourceObj.name) && (
                        <Button
                          id={`${sourceObj.name}-hide-button`}
                          my={2}
                          onClick={() => schemaIdFunc(sourceObj.name)}
                        >
                          Hide Schema
                        </Button>
                      )) || (
                        <Button
                          id={`${sourceObj.name}-show-button`}
                          onClick={() => schemaIdFunc(sourceObj.name)}
                          my={2}
                          variant={'outline'}
                        >
                          Show Schema
                        </Button>
                      )}
                      <Collapse in={schemaId.includes(sourceObj.name)}>
                        {schemaId.includes(sourceObj.name) && (
                          <Box
                            mt={4}
                            position='relative'
                            overflowX='auto'
                            boxShadow='low'
                            borderRadius={'semi'}
                          >
                            <Box
                              as='table'
                              w='100%'
                              bg='#374151'
                              color='whiteAlpha.800'
                              textAlign='left'
                              fontSize='sm'
                            >
                              <Box as='thead' textTransform={'uppercase'}>
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
                  <Box mt={4}>
                    <Heading as='h3' size='xs'>
                      Latest Release{' '}
                      {sourceObj.dateModified
                        ? new Date(sourceObj.dateModified).toDateString()
                        : 'N/A'}
                    </Heading>
                    <Heading as='h3' size='xs'>
                      First Released{' '}
                      {sourceObj.dateCreated
                        ? new Date(sourceObj.dateCreated).toDateString()
                        : 'N/A'}
                    </Heading>
                  </Box>
                  <Flex
                    justifyContent='center'
                    margin='0 auto'
                    my={4}
                    flexDirection={{ base: 'column', sm: 'row', lg: 'row' }}
                    alignItems='center'
                    flexWrap='wrap'
                    maxW={600}
                  >
                    {sourceObj.url && (
                      <NextLink
                        href={{
                          pathname: `${sourceObj.url}`,
                        }}
                        passHref
                      >
                        <Button
                          wordBreak='break-word'
                          whiteSpace='normal'
                          m={[0, 2]}
                          mt={4}
                          textAlign='center'
                          isExternal
                          flex={1}
                          minW={['unset', 400]}
                          variant='outline'
                        >
                          View {sourceObj.name} Site
                        </Button>
                      </NextLink>
                    )}
                    <NextLink
                      href={{
                        pathname: `/search`,
                        query: {
                          q: '',
                          filters: `includedInDataCatalog.name:${sourceObj.id}`,
                        },
                      }}
                      passHref
                    >
                      <Button
                        wordBreak='break-word'
                        whiteSpace='normal'
                        textAlign='center'
                        m={[0, 2]}
                        mt={4}
                        flex={1}
                        minW={['unset', 400]}
                      >
                        Search {sourceObj.name} records
                      </Button>
                    </NextLink>
                  </Flex>
                </Box>
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
