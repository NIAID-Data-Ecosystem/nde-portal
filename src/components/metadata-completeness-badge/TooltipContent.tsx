import React from 'react';
import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { getMetadataNameByDotfield } from 'src/components/advanced-search/utils/query-helpers';
import { FaRegCircleUp, FaCircleCheck } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';

interface Stat {
  label: string;
  fields: string[];
  included: string[];
  augmented: string[];
  fill: string;
}
interface TooltipContentProps {
  type: FormattedResource['@type'];
  data: Stat[];
}

const Score = ({ fill, label, included, fields }: Stat) => {
  return (
    <Flex
      mt={1.5}
      bg={fill}
      px={2}
      py={1}
      color='white'
      justifyContent='space-between'
    >
      <Flex alignItems='center' flex={1} mr={1}>
        {label && <Text color='inherit'>{label}</Text>}
      </Flex>

      <Text color='inherit' fontWeight='medium'>
        {included.length}
        <Text as='span' ml={1} color='inherit'>
          / {fields.length}
        </Text>
      </Text>
    </Flex>
  );
};
export const TooltipContent = ({ data }: TooltipContentProps) => {
  const max_total_score = data.reduce((acc, curr) => {
    acc += curr.fields.length;
    return acc;
  }, 0);

  const current_total_score = data.reduce((acc, curr) => {
    acc += curr.included.length;
    return acc;
  }, 0);

  return (
    <Flex flexDirection='column' p={1} minW={200}>
      <Text fontWeight='semibold' fontSize='sm'>
        Metadata Completeness
      </Text>
      {/* Total score */}
      <Flex my={1}>
        <Text fontWeight='semibold' flex={1}>
          Total Score
        </Text>
        <Text mx={1} color='gray.800' fontWeight='bold'>
          {current_total_score} / {max_total_score}
        </Text>
      </Flex>
      <Divider></Divider>

      {/* Rows of included and augmented fields */}
      <Stack direction='row' flexWrap='wrap'>
        {data.map(item => (
          <Box key={item.label} my={1} minWidth='200px' flex={1}>
            <Score {...item} />
            <Stack spacing={0}>
              {item.fields
                .sort((a, b) => a.localeCompare(b))
                .map((field, idx) => {
                  return (
                    <Grid
                      key={field}
                      templateColumns='repeat(4, 1fr)'
                      gap={1}
                      border='1px solid'
                      borderColor='gray.100'
                      bg={idx % 2 ? 'page.alt' : 'white'}
                    >
                      <GridItem
                        px={1}
                        py={0.5}
                        colSpan={3}
                        fontWeight='medium'
                        color='gray.800'
                      >
                        {getMetadataNameByDotfield(field)}
                      </GridItem>
                      <GridItem
                        display='flex'
                        colSpan={1}
                        alignItems='center'
                        justifyContent='center'
                        borderLeft='1px solid'
                        borderLeftColor='gray.100'
                      >
                        {item.included.includes(field) && (
                          <Icon
                            as={FaCircleCheck}
                            color='green.500'
                            boxSize={4}
                          />
                        )}
                        {item.augmented.includes(field) && (
                          <Icon
                            as={FaRegCircleUp}
                            color='green.500'
                            boxSize={4}
                          />
                        )}
                      </GridItem>
                    </Grid>
                  );
                })}
            </Stack>
          </Box>
        ))}
      </Stack>
      <Text fontStyle='italic' textAlign='end' mt={1}>
        <Icon as={FaRegCircleUp} color='green.500' boxSize={4} mr={1} />
        Indicates a field has been augmented and does not count towards the
        score.
      </Text>
    </Flex>
  );
};
