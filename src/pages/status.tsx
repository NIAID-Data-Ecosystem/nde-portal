import { Box, Grid, Heading, Text, VStack } from '@chakra-ui/react';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { StatusBanner, EndpointCard, PagesCard } from 'src/components/status';
import { useEndpointHealth } from 'src/hooks/useEndpointHealth';
import { getOverallStatus } from 'src/utils/status-helpers';
import { ENDPOINTS } from 'src/utils/endpoint-configs';

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
        px={{ base: 4, md: 4 }}
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
          <Grid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap={0}
            flexWrap='wrap'
          >
            {endpoints.map(ep => (
              <EndpointCard key={ep.id} {...ep} />
            ))}
          </Grid>

          {/* Pages card — derived from endpoint statuses */}
          <PagesCard
            endpointStatuses={Object.fromEntries(
              endpoints.map(ep => [ep.id, ep.status]),
            )}
          />
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
