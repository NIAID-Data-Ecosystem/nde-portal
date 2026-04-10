import { Alert, AlertIcon, Text } from '@chakra-ui/react';
import { OverallStatus } from 'src/utils/status-helpers';

const MESSAGES: Record<OverallStatus, string> = {
  operational: 'All Systems Operational',
  partial: 'Partial Outage',
  major: 'Major Outage',
};

interface StatusBannerProps {
  status: OverallStatus;
}

export const StatusBanner = ({ status }: StatusBannerProps) => {
  return (
    <Alert status={status === 'operational' ? 'success' : 'error'} py={2}>
      <AlertIcon />
      <Text fontWeight='medium' fontSize='lg' color='inherit'>
        {MESSAGES[status]}
      </Text>
    </Alert>
  );
};
