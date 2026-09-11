import { Box, Flex, HStack, Stack, Table, Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { ScrollContainer } from 'src/components/scroll-container';
import { ExampleOfWork } from 'src/utils/api/types';

export const ExampleOfWorkDisplay = ({
  additionalProperty,
  encodingFormat,
  schemaVersion,
}: ExampleOfWork) => {
  const properties = Array.isArray(additionalProperty)
    ? additionalProperty
    : additionalProperty
    ? [additionalProperty]
    : [];

  const encodingFormats = Array.isArray(encodingFormat)
    ? encodingFormat
    : encodingFormat
    ? [encodingFormat]
    : [];
  return (
    <Stack mt={4} lineHeight='moderate' gap={4} fontSize='xs'>
      {schemaVersion && (
        <Box>
          <Text fontWeight='semibold' lineHeight='moderate' mb={0.5}>
            Schema version
          </Text>
          <Link href={schemaVersion} isExternal>
            {schemaVersion}
          </Link>
        </Box>
      )}

      {encodingFormats.length > 0 && (
        <Box>
          <Text fontWeight='semibold' lineHeight='moderate' mb={0.5}>
            Encoding format
          </Text>
          <HStack
            gap={1}
            wrap='wrap'
            separator={
              <Text color='gray.400' mx={1} borderWidth={0}>
                |
              </Text>
            }
          >
            {encodingFormats.map((format, index) => (
              <Flex key={index}>
                {format.url ? (
                  <Link href={format.url} isExternal>
                    {format.name}
                  </Link>
                ) : (
                  <Text>{format.name}</Text>
                )}
              </Flex>
            ))}
          </HStack>
        </Box>
      )}

      {properties.length > 0 && (
        <Box>
          <Text fontWeight='semibold' lineHeight='moderate' mb={0.5}>
            Schema properties
          </Text>

          <ScrollContainer
            // Keyboard users must be able to scroll the properties table, which
            // routinely overflows 400px and often holds no focusable content
            // (axe `scrollable-region-focusable`). Same treatment as the raw
            // metadata JSON viewer's scroll container.
            tabIndex={0}
            overflow='auto'
            maxHeight='400px'
            border='1px solid'
            borderColor='gray.100'
            borderRadius='semi'
            fontSize='xs'
            mx={0.5}
            py={0}
            px={0.5}
          >
            <Table.Root
              size='sm'
              fontSize='xs'
              css={{ '& tr': { '& td': { px: 1.5, py: 1 } } }}
            >
              <Table.Body>
                {properties.map((property, index) => (
                  <Table.Row key={index} lineHeight='moderate' fontSize='xs'>
                    <Table.Cell
                      fontSize='inherit'
                      fontWeight='medium'
                      borderRight='1px solid'
                      borderRightColor='primary.100'
                    >
                      {property.name ||
                        property.propertyID ||
                        'Unknown property'}
                    </Table.Cell>
                    <Table.Cell fontSize='inherit' lineHeight='inherit'>
                      {property.value?.startsWith('http') ||
                      property.value?.startsWith('www.') ? (
                        <Link href={property.value} isExternal>
                          {property.value}
                        </Link>
                      ) : (
                        <>{property.value || 'Unknown value'}</>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </ScrollContainer>
        </Box>
      )}
    </Stack>
  );
};
