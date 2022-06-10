import { Box, Button, Collapse, Flex, Heading, Text } from 'nde-design-system';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Metadata } from 'src/utils/api/types';
import { fetchSources, SourceResponse } from '../utils';
import { Error } from 'src/components/error';
import LoadingSpinner from 'src/components/loading';
import { useRouter } from 'next/router';
import Empty from 'src/components/empty';

interface Main {
  sourceData: Metadata;
}

interface Source {
  name: string;
  description: string;
  dateCreated: string;
  dateModified: Date;
  numberOfRecords: any;
  schema: Object;
}

const Main: React.FC<Main> = ({ sourceData }) => {
  const router = useRouter();
  const repos = sourceData.src;
  const [schemaId, setSchemaId] = useState<string[]>([]);
  const [schemaText, setSchemaText] = useState<string[]>([]);

  function schemaIdFunc(sourceName: string) {
    if (schemaId.includes(sourceName) || schemaText.includes(sourceName)) {
      setSchemaText(schemaText.filter(schemaText => schemaText !== sourceName));
      return setSchemaId(schemaId.filter(schemaId => schemaId !== sourceName));
    }
    setSchemaText([...schemaText, sourceName]);
    return setSchemaId([...schemaId, sourceName]);
  }

  // Fetch source information from github
  const { data, error, isLoading } = useQuery<any | undefined, Error>(
    ['sources', {}],
    async () => {
      const data = await Promise.all(
        Object.entries(repos).map(([k, source]) => {
          return fetchSources({
            sourcePath: source.code.file,
            name: source.sourceInfo.name,
            description: source.sourceInfo.description,
            dateModified: source.version,
            numberOfRecords: source.stats[k] || 0,
            schema: source.sourceInfo.schema,
          });
        }),
      );
      return data;
    },
    { refetchOnWindowFocus: false },
  );

  if (error) {
    return (
      <Error
        message="It's that the data is unavailable at this time."
        bg='transparent'
        color='text.body'
        minH='unset'
      >
        <Button flex={1} onClick={() => router.reload()} variant='solid'>
          Retry
        </Button>
      </Error>
    );
  }
  const sources =
    data?.sort((a: { name: string }, b: { name: any }) =>
      a.name.localeCompare(b.name),
    ) || [];

  return (
    <Box id='sources-main' mb={10}>
      <Box borderBottom='2px solid' borderColor='gray.100'>
        <Heading as='h1' size='h5' p={2} my={4} ml={[0, 0, 4]}>
          Version 1.0.0 Data Sources
        </Heading>
      </Box>
      {isLoading ? (
        <LoadingSpinner isLoading={isLoading} />
      ) : sources.length === 0 ? (
        <Empty message='No data available.' alignSelf='center' h='50vh'>
          <Text>No sources.</Text>
        </Empty>
      ) : (
        sources.map((sourceObj: SourceResponse, i: number) => {
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
                <Box
                  mt={4}
                  dangerouslySetInnerHTML={{
                    __html: sourceObj.description,
                  }}
                  style={{ whiteSpace: 'pre-wrap' }}
                />

                <Box mt={4} fontWeight='bold' display={['none', 'block']}>
                  <Heading as='h3' size='xs'>
                    Visualization of {sourceObj.name} properties transformed to
                    the NIAID Data Ecosystem
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
                            {Object.entries(sourceObj.schema).map((item, i) => {
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
                            })}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Collapse>
                </Box>
                <Box mt={4}>
                  <Heading as='h3' size='xs'>
                    Latest Release{' '}
                    {new Date(sourceObj.dateModified).toDateString()}
                  </Heading>
                  <Heading as='h3' size='xs'>
                    First Released{' '}
                    {new Date(sourceObj.dateCreated).toDateString()}
                  </Heading>
                </Box>
              </Box>
              <Flex justifyContent='center' mt={4} mb={1}>
                {/* [TO DO]: add repo source url */}
                <Button
                  isExternal
                  href='/?'
                  wordBreak={'break-word'}
                  whiteSpace='normal'
                >
                  Search {sourceObj.name} records
                </Button>
              </Flex>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default Main;
