import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { getMetadataNameByProperty } from 'src/components/advanced-search/utils/query-helpers';

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

export const TooltipContent = ({ stats }: TooltipContentProps) => {
  const { recommended, required, total } = stats;

  const Score = ({ fill, label, score, max_score, augmented }: Stat) => {
    const augmented_fields = augmented?.map(property =>
      getMetadataNameByProperty(property),
    );
    return (
      <Box my={1.5}>
        <Flex color='black'>
          <Flex alignItems='center' flex={1} mr={1}>
            {fill && <Box w={1} h={3} bg={fill} mr={1.5}></Box>}
            {label && <Text color='inherit'>{label}</Text>}
          </Flex>

          <Text mx={1} color='inherit' fontWeight='medium'>
            {score}
            <Text as='span' mx={1} color='gray.800'>
              / {max_score}
            </Text>
          </Text>
        </Flex>
        {augmented_fields && augmented_fields.length > 0 && (
          <Text mx={2.5} color='text.body' fontWeight='normal'>
            {augmented_fields.length} augmented:{' '}
            {augmented_fields.join(', ').toLowerCase()}
          </Text>
        )}
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
      <Box my={1}>
        {/* Required score */}
        <Score {...required} />

        {/* Recommended score */}
        <Score {...recommended} />
      </Box>
    </Flex>
  );
};
