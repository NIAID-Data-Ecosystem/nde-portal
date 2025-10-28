import { Box, Collapsible, Flex, Icon, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

export const SourceSchema = ({
  name,
  schema,
}: {
  name: string;
  schema: Object;
}) => {
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

  return (
    <Collapsible.Root w='100%' py={2}>
      <Collapsible.Trigger
        display='flex'
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems='center'
        justifyContent='space-between'
        onClick={() => schemaIdFunc(name)}
        borderY='1px solid'
        borderColor='gray.100'
        px={0}
        py={2}
        width='100%'
      >
        <Text
          fontWeight='semibold'
          color='gray.800'
          textAlign='left'
          lineHeight='short'
        >
          Visualization of {name} properties transformed to the NIAID Data
          Ecosystem
        </Text>
        <Flex alignItems='center'>
          <Text mx={2} fontSize='xs' color='gray.800'>
            {schemaText.includes(name) ? 'Hide' : 'Show'}
          </Text>
          <Icon
            as={schemaText.includes(name) ? FaMinus : FaPlus}
            color='gray.800'
            boxSize={3}
          />
        </Flex>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {schemaId.includes(name) && (
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
                  <Box as='th' px={6} py={3}>
                    {name} Property
                  </Box>
                  <Box as='th' px={6} py={3}>
                    NIAID Data Ecosystem Property
                  </Box>
                </tr>
              </Box>

              <Box as='tbody' bg='#1F2937' border='gray.100'>
                {Object.entries(schema).map((item, i) => {
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
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
