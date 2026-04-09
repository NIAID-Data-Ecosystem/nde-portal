import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import {
  calculateUptimePercent,
  EndpointState,
} from 'src/utils/status-helpers';
import { StatusBadge } from './StatusBadge';
import { UptimeBar } from './UptimeBar';

interface EndpointCardProps extends EndpointState {
  secondsAgo: number;
}

export const EndpointCard = ({
  name,
  status,
  responseTime,
  history,
  error,
  extraInfo,
}: EndpointCardProps) => {
  const uptimePercent = calculateUptimePercent(history);

  return (
    <Box
      bg='white'
      border='1px solid'
      borderColor='#d0d7de'
      borderRadius='6px'
      p={6}
    >
      {/* Header */}
      <Flex
        justifyContent='space-between'
        alignItems='center'
        mb={4}
        flexWrap='wrap'
        gap={2}
      >
        <Text fontWeight='semibold' fontSize='lg'>
          {name}
        </Text>
        <StatusBadge status={status} />
      </Flex>

      {/* Uptime bar */}
      <UptimeBar history={history} />

      {/* Stats row */}
      <Flex
        mt={4}
        justifyContent='space-between'
        alignItems='center'
        flexWrap='wrap'
        gap={2}
      >
        <HStack spacing={4} flexWrap='wrap'>
          <Text fontSize='sm' color='gray.600'>
            Uptime: <strong>{uptimePercent}%</strong>
          </Text>
          {responseTime !== null && (
            <Text fontSize='sm' color='gray.600'>
              Response time: <strong>{responseTime}ms</strong>
            </Text>
          )}
        </HStack>
      </Flex>

      {/* Error message */}
      {error && (
        <Text fontSize='sm' color='red.500' mt={2}>
          {error}
        </Text>
      )}

      {/* Extra info (e.g. Strapi uptime, env) */}
      {extraInfo && (
        <VStack
          alignItems='start'
          spacing={0}
          mt={3}
          pt={3}
          borderTop='1px solid'
          borderColor='gray.100'
        >
          {Object.entries(extraInfo).map(([key, value]) => (
            <Text key={key} fontSize='sm' color='gray.600'>
              {key}: <strong>{value}</strong>
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  );
};
