import { Text, Flex } from '@chakra-ui/react';

interface EmptyStateProps {
  height?: string;
}

export const EmptyState = ({
  height = 'clamp(180px, 30vh, 250px)',
}: EmptyStateProps) => {
  return (
    <Flex h={height} align='center' justify='center' w='100%'>
      <Text color='page.placeholder' fontStyle='italic' textAlign='center'>
        No data available for the selected aggregation.
      </Text>
    </Flex>
  );
};
