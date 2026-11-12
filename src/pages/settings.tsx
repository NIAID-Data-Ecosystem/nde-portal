/**
 * User Settings Page - Protected route requiring authentication
 */

import { useState } from 'react';
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { useUnsavedChangesWarning } from 'src/hooks/useUnsavedChangesWarning';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import {
  AccountDetails,
  PreferencesForm,
  PreferencesFormSection,
} from 'src/components/settings';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

const SETTINGS_COPY = {
  page: {
    title: 'Settings',
    subtitle: 'Manage account settings and preferences',
  },
  sections: {
    communication: { title: 'Communication preferences' },
    search: { title: 'Search preferences' },
  },
};

const TOGGLE_SECTIONS: PreferencesFormSection[] = [
  {
    title: SETTINGS_COPY.sections.communication.title,
    toggleKeys: ['emailUpdates', 'feedbackTesting', 'betaFeatures'],
  },
  {
    title: SETTINGS_COPY.sections.search.title,
    toggleKeys: ['aiSearch'],
  },
];

function UserSettingsPage() {
  const { logout } = useAuth();

  // Toggles only persist on Save, so warn before leaving with unsaved ones.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const confirmLeave = useUnsavedChangesWarning(hasUnsavedChanges);

  // Logging out unmounts this page before any navigation starts, so the
  // navigation guard never sees it; ask here instead.
  const handleLogout = () => {
    if (confirmLeave()) logout();
  };

  if (!ENABLE_AUTH) return null;

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
            {SETTINGS_COPY.page.title}
          </Heading>
          <Text color='gray.800' fontSize='md'>
            {SETTINGS_COPY.page.subtitle}
          </Text>
        </VStack>

        <AccountDetails />

        <PreferencesForm
          sections={TOGGLE_SECTIONS}
          onUnsavedChangesChange={setHasUnsavedChanges}
        />

        {/* Log Out Button */}
        <Button
          colorScheme='red'
          variant='ghost'
          size='sm'
          onClick={handleLogout}
          textDecoration='underline'
          ml={'-2'}
          mt={12}
        >
          Log Out
        </Button>
      </Box>
    </PageContainer>
  );
}

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(UserSettingsPage);
