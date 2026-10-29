/**
 * User Settings Page - Protected route requiring authentication
 */

import { ReactNode } from 'react';
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import {
  getEmailToggleState,
  SettingToggle,
  TOGGLE_TO_PREF,
  TOGGLES_COPY,
  ToggleKey,
} from 'src/components/settings';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import { useUserData } from 'src/hooks/useUserData';

const SETTINGS_COPY = {
  page: {
    title: 'Settings',
    subtitle: 'Manage account settings and preferences',
  },
  sections: {
    communication: { title: 'Communication preferences' },
    search: { title: 'Search preferences' },
  },
  toggles: TOGGLES_COPY,
};

const TOGGLE_SECTIONS: Array<{
  title: string;
  mb?: number;
  toggleKeys: ToggleKey[];
}> = [
  {
    title: SETTINGS_COPY.sections.communication.title,
    toggleKeys: ['emailUpdates', 'feedbackTesting', 'betaFeatures'],
  },
  {
    title: SETTINGS_COPY.sections.search.title,
    mb: 12,
    toggleKeys: ['aiSearch'],
  },
];

function SettingsSection({
  title,
  children,
  mb = 8,
}: {
  title: string;
  children: ReactNode;
  mb?: number;
}) {
  return (
    <VStack alignItems='start' gap={0} w='full' mb={mb}>
      <Heading as='h2' size='md' fontWeight='semibold' mb={2}>
        {title}
      </Heading>
      <VStack alignItems='start' gap={0} w='full'>
        {children}
      </VStack>
    </VStack>
  );
}

function UserSettingsPage() {
  const { logout } = useAuth();
  const { preferences, updatePreferenceField, account } = useUserData();

  const emailToggle = getEmailToggleState(account);

  // Per-toggle alerts to render, keyed by toggle. Keeps the render loop generic
  // rather than special-casing individual toggles inline.
  const toggleAlerts: Partial<Record<ToggleKey, ReactNode>> = {
    emailUpdates: emailToggle.alert,
  };

  // Toggles that can't be enabled given the account state. Email updates require
  // an email on the record.
  const toggleDisabled: Partial<Record<ToggleKey, boolean>> = {
    emailUpdates: emailToggle.isDisabled,
  };

  const getChecked = (key: ToggleKey) => preferences[TOGGLE_TO_PREF[key]];

  const updateSetting = (key: ToggleKey) => {
    updatePreferenceField(TOGGLE_TO_PREF[key]);
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

        {TOGGLE_SECTIONS.map(section => (
          <SettingsSection
            key={section.title}
            title={section.title}
            mb={section.mb ?? 8}
          >
            {section.toggleKeys.map((key, index) => (
              <SettingToggle
                key={key}
                {...SETTINGS_COPY.toggles[key]}
                isChecked={getChecked(key)}
                onChange={() => updateSetting(key)}
                showBorder={index < section.toggleKeys.length - 1}
                alert={toggleAlerts[key]}
                isDisabled={toggleDisabled[key]}
              />
            ))}
          </SettingsSection>
        ))}

        {/* Log Out Button */}
        <Button
          colorScheme='red'
          variant='ghost'
          size='sm'
          onClick={logout}
          textDecoration='underline'
          ml={'-2'}
        >
          Log Out
        </Button>
      </Box>
    </PageContainer>
  );
}

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(UserSettingsPage);
