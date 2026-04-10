import { Box, Flex, Text, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import {
  BAR_COLORS,
  DayStatus,
  formatDisplayDate,
} from 'src/utils/status-helpers';

const STATUS_LABELS: Record<string, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  'no-data': 'No data',
};

function tooltipLabel(day: DayStatus): string {
  const date = formatDisplayDate(day.date);
  const label = STATUS_LABELS[day.status];
  if (day.status !== 'no-data' && day.incidents > 0) {
    return `${date} — ${label} (${day.incidents} incident${
      day.incidents !== 1 ? 's' : ''
    })`;
  }
  return `${date} — ${label}`;
}

interface UptimeBarProps {
  history: DayStatus[];
}

export const UptimeBar = ({ history }: UptimeBarProps) => {
  // Show last 30 days on mobile, 60 on tablet, 90 on desktop
  const visibleDays = useBreakpointValue({ base: 30, sm: 60, lg: 90 }) ?? 90;
  const visibleHistory = history.slice(-visibleDays);
  const daysLabel = `${visibleDays} days ago`;

  return (
    <Box>
      <Flex gap='2px'>
        {visibleHistory.map(day => (
          <Tooltip
            key={day.date}
            label={tooltipLabel(day)}
            placement='top'
            hasArrow
            fontSize='xs'
            bg='gray.800'
            color='white'
          >
            <Box
              flex='1'
              h='28px'
              borderRadius='4px'
              bg={BAR_COLORS[day.status]}
              cursor='pointer'
              transition='opacity 0.15s'
              _hover={{ opacity: 0.8 }}
            />
          </Tooltip>
        ))}
      </Flex>
      <Flex justifyContent='space-between' mt={1}>
        <Text fontSize='xs' color='gray.700'>
          {daysLabel}
        </Text>
        <Text fontSize='xs' color='gray.700'>
          Today
        </Text>
      </Flex>
    </Box>
  );
};
