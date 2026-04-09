import { Badge } from '@chakra-ui/react';
import { EndpointStatus, STATUS_COLORS } from 'src/utils/status-helpers';

const LABELS: Record<EndpointStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
};

interface StatusBadgeProps {
  status: EndpointStatus | 'loading';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  if (status === 'loading') {
    return (
      <Badge bg='gray.100' color='gray.500' px={2} py={0.5} borderRadius='full'>
        Checking...
      </Badge>
    );
  }

  const colors = STATUS_COLORS[status];

  return (
    <Badge
      bg={colors.bg}
      color={colors.text}
      px={2}
      py={0.5}
      borderRadius='full'
      fontWeight='semibold'
      fontSize='xs'
      textTransform='capitalize'
    >
      {LABELS[status]}
    </Badge>
  );
};
