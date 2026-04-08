/**
 * User Settings Page - Protected route requiring authentication
 */

import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Button,
  Switch,
} from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';

function UserSettingsPage() {
  const { logout } = useAuth();
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [feedbackTesting, setFeedbackTesting] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);
  const [aiSearch, setAiSearch] = useState(false);

  return (
    <PageContainer meta={getPageSeoConfig('/settings')} px={0} py={0}>
      <Box
        maxW='2xl'
        mx='auto'
        my={{ base: 6, md: 12 }}
        px={{ base: 4, md: 0 }}
      >
        {/* Header */}
        <VStack alignItems='start' gap={2} mb={8}>
          <Heading as='h1' size='xl' fontWeight='bold'>
            Settings
          </Heading>
          <Text color='gray.600' fontSize='md'>
            Manage account settings and preferences
          </Text>
        </VStack>

        {/* Communication Preferences Section */}
        <VStack alignItems='start' gap={6} mb={8}>
          <VStack alignItems='start' gap={0} w='full'>
            <Heading as='h2' size='md' fontWeight='semibold' mb={4}>
              Communication preferences
            </Heading>
            {/* Email Updates */}
            <HStack
              justifyContent='space-between'
              alignItems='start'
              py={4}
              w='full'
              borderBottom='1px'
              borderColor='gray.200'
            >
              <VStack alignItems='start' gap={1} flex={1}>
                <Text fontWeight='medium'>Email Updates</Text>
                <Text fontSize='sm' color='gray.600'>
                  Receive emails about new features and updates to the Discovery
                  Portal.
                </Text>
              </VStack>
              <Switch
                isChecked={emailUpdates}
                onChange={e => setEmailUpdates(e.target.checked)}
              />
            </HStack>

            {/* Feedback and Testing */}
            <HStack
              justifyContent='space-between'
              alignItems='start'
              py={4}
              w='full'
              borderBottom='1px'
              borderColor='gray.200'
            >
              <VStack alignItems='start' gap={1} flex={1}>
                <Text fontWeight='medium'>Feedback and Testing</Text>
                <Text fontSize='sm' color='gray.600'>
                  Help improve the NIAID Data Ecosystem by participating in
                  feedback and usability testing.
                </Text>
              </VStack>
              <Switch
                isChecked={feedbackTesting}
                onChange={e => setFeedbackTesting(e.target.checked)}
              />
            </HStack>

            {/* Beta Features */}
            <HStack
              justifyContent='space-between'
              alignItems='start'
              py={4}
              w='full'
            >
              <VStack alignItems='start' gap={1} flex={1}>
                <Text fontWeight='medium'>Beta features</Text>
                <Text fontSize='sm' color='gray.600'>
                  Get early access to experimental features.
                </Text>
              </VStack>
              <Switch
                isChecked={betaFeatures}
                onChange={e => setBetaFeatures(e.target.checked)}
              />
            </HStack>
          </VStack>
        </VStack>

        {/* Search Preferences Section */}
        <VStack alignItems='start' gap={6} mb={12}>
          <VStack alignItems='start' gap={0} w='full'>
            <Heading as='h2' size='md' fontWeight='semibold' mb={4}>
              Search preferences
            </Heading>
            {/* AI-assisted Search */}
            <HStack
              justifyContent='space-between'
              alignItems='start'
              py={4}
              w='full'
            >
              <VStack alignItems='start' gap={1} flex={1}>
                <Text fontWeight='medium'>AI-assisted search</Text>
                <Text fontSize='sm' color='gray.600'>
                  Turn on AI-assisted search by default.{' '}
                  <Link color='blue.600' textDecoration='underline'>
                    Learn about AI-assisted search
                  </Link>
                  .
                </Text>
              </VStack>
              <Switch
                isChecked={aiSearch}
                onChange={e => setAiSearch(e.target.checked)}
              />
            </HStack>
          </VStack>
        </VStack>

        {/* Log Out Button */}
        <Button colorScheme='red' variant='outline' onClick={logout}>
          Log Out
        </Button>
      </Box>
    </PageContainer>
  );
}

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(UserSettingsPage);
