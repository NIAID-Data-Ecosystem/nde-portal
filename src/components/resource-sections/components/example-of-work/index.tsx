import {
  Box,
  Flex,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
} from '@chakra-ui/react';
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
    <Stack mt={4} lineHeight='short' gap={4} fontSize='xs'>
      {schemaVersion && (
        <Box>
          <Text fontWeight='semibold' lineHeight='short' mb={0.5}>
            Schema version
          </Text>
          <Link href={schemaVersion} isExternal>
            {schemaVersion}
          </Link>
        </Box>
      )}

      {encodingFormats.length > 0 && (
        <Box>
          <Text fontWeight='semibold' lineHeight='short' mb={0.5}>
            Encoding format
          </Text>
          <HStack
            spacing={1}
            wrap='wrap'
            divider={
              <Text color='gray.400' mx={1}>
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
          <Text fontWeight='semibold' lineHeight='short' mb={0.5}>
            Schema properties
          </Text>

          <ScrollContainer
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
            <Table
              size='sm'
              fontSize='xs'
              sx={{ tr: { td: { px: 1.5, py: 1 } } }}
            >
              <Tbody>
                {properties.map((property, index) => (
                  <Tr key={index} lineHeight='short' fontSize='xs'>
                    <Td
                      fontSize='inherit'
                      fontWeight='medium'
                      borderRight='1px!important'
                      borderRightColor='primary.100!important'
                    >
                      {property.name ||
                        property.propertyID ||
                        'Unknown property'}
                    </Td>
                    <Td fontSize='inherit' lineHeight='inherit'>
                      {property.value?.startsWith('http') ||
                      property.value?.startsWith('www.') ? (
                        <Link href={property.value} isExternal>
                          {property.value}
                        </Link>
                      ) : (
                        <>{property.value || 'Unknown value'}</>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ScrollContainer>
        </Box>
      )}
    </Stack>
  );
};
