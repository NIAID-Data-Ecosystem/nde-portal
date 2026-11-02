/**
 * User Settings Page - Protected route requiring authentication
 */

import {
  Box,
  Button,
  Heading,
  StackProps,
  StackSeparator,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import {
  getEmailToggleState,
  SettingToggle,
  TOGGLE_TO_PREF,
  ToggleKey,
  TOGGLES_COPY,
} from 'src/components/settings';
import { useAuth } from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/useUserData';
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

/** Heading + optional subtitle + content, with consistent spacing. */
export const SettingsSection = ({
  title,
  subtitle,
  children,
  ...stackProps
}: StackProps & {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <VStack alignItems='start' w='full' py={4} gap={4} {...stackProps}>
      <Heading as='h2' size='md' fontWeight='semibold'>
        {title}
      </Heading>
      {subtitle && <Text fontSize='sm'>{subtitle}</Text>}
      {children && (
        <VStack
          alignItems='start'
          w='full'
          gap={4}
          separator={<StackSeparator />}
        >
          {children}
        </VStack>
      )}
    </VStack>
  );
};

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
        <VStack alignItems='start' gap={2} mb={4}>
          <Heading as='h1' size='xl' fontWeight='bold'>
            {SETTINGS_COPY.page.title}
          </Heading>
          <Text color='gray.800' fontSize='md'>
            {SETTINGS_COPY.page.subtitle}
          </Text>
        </VStack>

        <VStack alignItems='start' gap={0} py={2}>
          {TOGGLE_SECTIONS.map(section => (
            <SettingsSection key={section.title} title={section.title}>
              {section.toggleKeys.map((key, index) => (
                <SettingToggle
                  key={key}
                  {...SETTINGS_COPY.toggles[key]}
                  checked={getChecked(key)}
                  onCheckedChange={() => updateSetting(key)}
                  showBorder={index < section.toggleKeys.length - 1}
                  alert={toggleAlerts[key]}
                  disabled={toggleDisabled[key]}
                />
              ))}
            </SettingsSection>
          ))}
        </VStack>

        {/* Log Out Button */}
        <Button
          colorPalette='red'
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
