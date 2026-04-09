import { Box, Grid, Heading, Text, VStack } from '@chakra-ui/react';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { StatusBanner, EndpointCard } from 'src/components/status';
import { useEndpointHealth } from 'src/hooks/useEndpointHealth';
import {
  EndpointConfig,
  formatUptimeDuration,
  getOverallStatus,
} from 'src/utils/status-helpers';

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'niaid-data-api',
    name: 'NIAID Data API',
    url: `${process.env.NEXT_PUBLIC_API_URL}/metadata`,
    checkHealth: res => {
      if (res?.ok === true && res?.status === 200) return 'operational';
      if (res?.ok === true) return 'degraded';
      return 'down';
    },
  },
  {
    id: 'niaid-strapi',
    name: 'NIAID Strapi Health',
    url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/health`,
    checkHealth: (_res, data) => {
      if (data?.status === 'ok' && data?.env === 'production')
        return 'operational';
      if (data?.status === 'ok') return 'degraded';
      return 'down';
    },
    extractInfo: data => {
      const info: Record<string, string> = {};
      if (typeof data?.uptime === 'number') {
        info['Server uptime'] = formatUptimeDuration(data.uptime);
      }
      if (data?.env) {
        info['Environment'] = data.env;
      }
      return info;
    },
  },
];

function StatusPageContent() {
  const endpoint1 = useEndpointHealth(ENDPOINTS[0]);
  const endpoint2 = useEndpointHealth(ENDPOINTS[1]);
  const endpoints = [endpoint1, endpoint2];
  const overallStatus = getOverallStatus(endpoints.map(e => e.status));

  return (
    <Box bg='#fff' minH='60vh'>
      <Box
        maxW='4xl'
        mx='auto'
        py={{ base: 6, md: 10 }}
        px={{ base: 4, md: 0 }}
      >
        <VStack alignItems='stretch' spacing={6}>
          {/* Page header */}
          <VStack alignItems='start' spacing={1}>
            <Heading as='h1' size='xl' fontWeight='bold'>
              System Status
            </Heading>
            <Text color='gray.800' fontSize='md'>
              Current health of NIAID Data Ecosystem services
            </Text>
          </VStack>

          {/* Overall banner */}
          <StatusBanner status={overallStatus} />

          {/* Endpoint cards */}
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            {endpoints.map(ep => (
              <EndpointCard key={ep.id} {...ep} />
            ))}
          </Grid>
        </VStack>
      </Box>
    </Box>
  );
}

export default function StatusPage() {
  return (
    <PageContainer meta={getPageSeoConfig('/status')} px={0} py={0}>
      <StatusPageContent />
    </PageContainer>
  );
}
