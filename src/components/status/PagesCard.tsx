import { Box, Collapse, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { EndpointStatus, STATUS_COLORS } from 'src/utils/status-helpers';
import {
  PAGE_DEPENDENCIES,
  PageStatus,
  getPageStatus,
  getOverallPagesStatus,
} from 'src/utils/page-dependencies';
import { usePageAvailability } from 'src/hooks/usePageAvailability';
import { StatusBadge } from './StatusBadge';

const PAGE_STATUS_COLORS: Record<PageStatus, string> = {
  operational: STATUS_COLORS.operational.text,
  degraded: STATUS_COLORS.degraded.text,
  impacted: STATUS_COLORS.down.text,
};

const PAGE_STATUS_LABELS: Record<PageStatus | 'loading', string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  impacted: 'Impacted',
  loading: 'Checking...',
};
function StatusDot({ status }: { status: PageStatus | 'loading' }) {
  if (status === 'loading') {
    return (
      <Box w='10px' h='10px' borderRadius='full' bg='gray.300' flexShrink={0} />
    );
  }
  return (
    <Box
      w='10px'
      h='10px'
      borderRadius='full'
      bg={PAGE_STATUS_COLORS[status]}
      flexShrink={0}
    />
  );
}

interface PagesCardProps {
  endpointStatuses: Record<string, EndpointStatus | 'loading'>;
}

export const PagesCard = ({ endpointStatuses }: PagesCardProps) => {
  const { isOpen, onToggle } = useDisclosure();
  const pageRouteStatuses = usePageAvailability();

  const overallStatus = getOverallPagesStatus(
    endpointStatuses,
    pageRouteStatuses,
  );

  const pages = PAGE_DEPENDENCIES.map(page => ({
    ...page,
    status: getPageStatus(
      page.endpoints,
      endpointStatuses,
      pageRouteStatuses[page.path],
    ),
  }));

  // Sort impacted/degraded pages to the top
  const sortedPages = [...pages].sort((a, b) => {
    const order: Record<string, number> = {
      impacted: 0,
      degraded: 1,
      loading: 2,
      operational: 3,
    };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const impactedCount = pages.filter(
    p => p.status === 'impacted' || p.status === 'degraded',
  ).length;

  // Map overall pages status to the StatusBadge's EndpointStatus type
  const badgeStatus =
    overallStatus === 'impacted'
      ? 'down'
      : overallStatus === 'loading'
      ? 'loading'
      : overallStatus;

  return (
    <Box bg='white' border='0.25px solid' borderColor='#d0d7de' p={6}>
      {/* Card header */}
      <Flex
        justifyContent='space-between'
        alignItems='center'
        flexWrap='wrap'
        gap={2}
      >
        <Text fontWeight='semibold' fontSize='lg'>
          Pages
        </Text>
        <StatusBadge status={badgeStatus} />
      </Flex>

      {/* Expandable toggle */}
      <Flex
        mt={3}
        alignItems='center'
        gap={1}
        cursor='pointer'
        onClick={onToggle}
        role='button'
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onToggle();
        }}
        _hover={{ color: 'blue.600' }}
        color='gray.600'
        userSelect='none'
      >
        <Box as={isOpen ? FiChevronDown : FiChevronRight} boxSize='14px' />
        <Text fontSize='sm'>
          {pages.length} pages monitored
          {impactedCount > 0 && (
            <Text as='span' color='red.600' fontWeight='medium'>
              {' '}
              · {impactedCount} impacted
            </Text>
          )}
        </Text>
      </Flex>

      {/* Collapsible page list */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          mt={3}
          border='1px solid'
          borderColor='gray.100'
          borderRadius='4px'
          maxH='360px'
          overflowY='auto'
        >
          {sortedPages.map(page => (
            <Flex
              key={page.path}
              justifyContent='space-between'
              alignItems='center'
              px={4}
              py={2.5}
              _notLast={{ borderBottom: '1px solid', borderColor: 'gray.100' }}
              bg={
                page.status === 'impacted'
                  ? 'red.50'
                  : page.status === 'degraded'
                  ? 'yellow.50'
                  : 'transparent'
              }
            >
              <Box>
                <Text fontSize='sm' fontWeight='medium'>
                  {page.label}
                </Text>
                {/* <Text fontSize='xs' color='gray.400'>
                  {page.endpoints
                    .map(id => ENDPOINT_NAMES[id] ?? id)
                    .join(', ') |}
                </Text> */}
              </Box>
              <Flex alignItems='center' gap={2} flexShrink={0}>
                <Text fontSize='xs' color='gray.500'>
                  {PAGE_STATUS_LABELS[page.status]}
                </Text>
                <StatusDot status={page.status} />
              </Flex>
            </Flex>
          ))}
        </Box>
      </Collapse>

      {/* Footer: dependency summary
      <Text fontSize='xs' color='gray.400' mt={3}>
        Depends on: {allEndpointIds.map(id => ENDPOINT_NAMES[id] ?? id).join(', ')}
      </Text> */}
    </Box>
  );
};
