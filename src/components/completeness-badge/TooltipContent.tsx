import React from 'react';
import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { getMetadataNameByDotfield } from 'src/components/advanced-search/utils/query-helpers';
import { FaAsterisk, FaCircleCheck } from 'react-icons/fa6';

type statkey = 'required' | 'recommended' | 'total';
interface Stat {
  label: string;
  max_score: number;
  score: number;
  fill?: string;
  augmented?: string[];
}
interface TooltipContentProps {
  stats: {
    [key in statkey]: Stat;
  };
}

export const TooltipContent = ({ stats, data }: TooltipContentProps) => {
  const { recommended, required, total } = stats;

  const Score = ({ fill, label, score, max_score, augmented }: Stat) => {
    return (
      <Box mt={1.5}>
        <Flex
          bg={fill}
          px={2}
          py={1}
          color='white'
          justifyContent={'space-between'}
        >
          <Flex alignItems='center' flex={1} mr={1}>
            {/* {fill && <Box w={0.75} h={4} bg={fill} mr={1.5}></Box>} */}
            {label && <Text color='inherit'>{label}</Text>}
          </Flex>

          <Text color='inherit' fontWeight='medium'>
            {score}
            <Text as='span' ml={1} color='inherit'>
              / {max_score}
            </Text>
          </Text>
        </Flex>
      </Box>
    );
  };
  return (
    <Flex flexDirection='column' p={1} minW={200}>
      <Text fontWeight='semibold' fontSize='sm'>
        Metadata Completeness
      </Text>
      {/* Total score */}
      <Flex my={1}>
        <Text fontWeight='semibold' flex={1}>
          {total.label}
        </Text>
        <Text mx={1} color='gray.800' fontWeight='bold'>
          {total.score} / {total.max_score}
        </Text>
      </Flex>
      <Divider></Divider>
      <Stack direction='row'>
        <Box my={1} minWidth='200px'>
          <Score {...required} />
          <Stack spacing={0}>
            {data?.required.map((item, idx) => {
              const key = Object.keys(item)[0];
              const value = Object.values(item)[0];
              return (
                <Grid
                  key={key}
                  templateColumns='repeat(4, 1fr)'
                  gap={1}
                  border='1px solid'
                  borderColor='gray.100'
                  bg={idx % 2 ? 'page.alt' : 'white'}
                >
                  <GridItem
                    px={2}
                    py={1}
                    colSpan={3}
                    fontWeight='medium'
                    color='gray.800'
                  >
                    {key}
                  </GridItem>
                  <GridItem
                    display='flex'
                    colSpan={1}
                    alignItems='center'
                    justifyContent='center'
                    borderLeft='1px solid'
                    borderLeftColor='gray.100'
                  >
                    {value ? (
                      <>
                        <Icon
                          as={FaCircleCheck}
                          color='status.success'
                          boxSize={4}
                        />
                        {required?.augmented &&
                          required?.augmented?.length > 0 && (
                            <Icon
                              as={
                                required?.augmented?.includes(key)
                                  ? FaAsterisk
                                  : undefined
                              }
                              color='status.success'
                              boxSize={2}
                              ml={1}
                              visibility={
                                required?.augmented?.includes(key)
                                  ? 'visible'
                                  : 'hidden'
                              }
                            />
                          )}
                      </>
                    ) : (
                      <></>
                    )}
                  </GridItem>
                </Grid>
              );
            })}
          </Stack>
        </Box>
        <Box my={1} minWidth='200px'>
          <Score {...recommended} />
          <Stack spacing={0}>
            {data?.recommended.map((item, idx) => {
              const key = Object.keys(item)[0];
              const value = Object.values(item)[0];
              return (
                <Grid
                  key={key}
                  templateColumns='repeat(4, 1fr)'
                  gap={1}
                  border='1px solid'
                  borderColor='gray.100'
                  bg={idx % 2 ? 'page.alt' : 'white'}
                >
                  <GridItem px={2} py={1} colSpan={3} fontWeight='medium'>
                    {key}
                  </GridItem>
                  <GridItem
                    display='flex'
                    colSpan={1}
                    alignItems='center'
                    justifyContent='center'
                    borderLeft='1px solid'
                    borderLeftColor='gray.100'
                  >
                    {value ? (
                      <>
                        <Icon
                          as={FaCircleCheck}
                          color='status.success'
                          boxSize={4}
                        />
                        {recommended?.augmented &&
                          recommended?.augmented?.length > 0 && (
                            <Icon
                              as={
                                recommended?.augmented?.includes(key)
                                  ? FaAsterisk
                                  : undefined
                              }
                              color='status.success'
                              boxSize={2}
                              ml={1}
                              visibility={
                                recommended?.augmented?.includes(key)
                                  ? 'visible'
                                  : 'hidden'
                              }
                            />
                          )}
                      </>
                    ) : (
                      <></>
                    )}
                  </GridItem>
                </Grid>
              );
            })}
          </Stack>
        </Box>
      </Stack>
      <Text fontStyle='italic' textAlign='end' mt={1}>
        <Icon as={FaAsterisk} color='status.success' boxSize={2} mr={1} />
        Indicates a field has been augmented.
      </Text>
    </Flex>
  );
};
