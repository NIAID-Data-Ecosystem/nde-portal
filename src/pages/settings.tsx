/**
 * User Settings Page - Protected route requiring authentication
 */

import { ReactNode } from 'react';
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
import { UserPreferencesKeys } from 'src/hooks/useUserData/types';
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
  toggles: {
    emailUpdates: {
      label: 'Email Updates',
      description:
        'Receive emails about new features and updates to the Discovery Portal.',

      alerts: {
        missingEmail: (
          <>
            Email updates are unavailable because your account does not have an
            email address on record. Please add an email to your account to
            enable this setting.
          </>
        ),
        missingOrcidEmail: (
          <>
            We couldn’t access a public email address from your ORCID record. To
            enable email updates, your ORCID record must include a verified
            email address with visibility set to{' '}
            <Text as='span' fontWeight='bold' color='inherit'>
              Everyone
            </Text>
            . You can update this in{' '}
            <Link href={'https://orcid.org/account'} textDecoration='underline'>
              the email notification settings of your ORCID account
            </Link>
            .
          </>
        ),
      },
    },
    feedbackTesting: {
      label: 'Feedback and Testing',
      description:
        'Help improve the NIAID Data Ecosystem by participating in feedback and usability testing.',
    },
    betaFeatures: {
      label: 'Beta features',
      description: 'Get early access to experimental features.',
    },
    aiSearch: {
      label: 'AI-assisted search',
      description: (
        <>
          Turn on AI-assisted search by default.{' '}
          <Link
            color='blue.600'
            textDecoration='underline'
            href='/knowledge-center/ai-assisted-search'
          >
            Learn about AI-assisted search
          </Link>
          .
        </>
      ),
    },
  },
};

type ToggleKey =
  | 'emailUpdates'
  | 'feedbackTesting'
  | 'betaFeatures'
  | 'aiSearch';

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

function SettingToggle({
  label,
  description,
  isChecked,
  onChange,
  showBorder,
  alert,
  isDisabled,
}: {
  label: string;
  description: ReactNode;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  showBorder?: boolean;
  alert?: ReactNode;
  isDisabled?: boolean;
}) {
  return (
    <HStack
      justifyContent='space-between'
      alignItems='start'
      py={4}
      w='full'
      {...(showBorder && { borderBottom: '1px', borderColor: 'gray.200' })}
    >
      <VStack alignItems='start' gap={1} flex={1}>
        <Text fontWeight='medium'>{label}</Text>

        <Text fontSize='sm' color='gray.800'>
          {description}
        </Text>

        {/* If alert is provided, render it */}

        {alert && (
          <Box
            bg='orange.50'
            border='1px'
            borderColor='orange.200'
            borderRadius='md'
            px={3}
            py={2}
          >
            <Text fontSize='sm' color='orange.800' lineHeight='short'>
              {alert}
            </Text>
          </Box>
        )}
      </VStack>
      <Switch
        colorScheme='primary'
        aria-label={label}
        isChecked={isChecked}
        isDisabled={isDisabled}
        onChange={e => onChange(e.target.checked)}
      />
    </HStack>
  );
}

function UserSettingsPage() {
  const { logout } = useAuth();
  const { preferences, updatePreferenceField, account } = useUserData();

  // Email updates require an email on the record. When one is missing the toggle
  // is disabled and an explanatory alert is shown — ORCID accounts get a variant
  // pointing them to their ORCID email visibility settings.
  const hasEmail = Boolean(account?.email);
  const isOrcid = account?.oauth_provider?.toUpperCase() === 'ORCID';

  const emailUpdatesAlert = hasEmail
    ? undefined
    : isOrcid
    ? SETTINGS_COPY.toggles.emailUpdates.alerts.missingOrcidEmail
    : SETTINGS_COPY.toggles.emailUpdates.alerts.missingEmail;

  // Per-toggle alerts to render, keyed by toggle. Keeps the render loop generic
  // rather than special-casing individual toggles inline.
  const toggleAlerts: Partial<Record<ToggleKey, ReactNode>> = {
    emailUpdates: emailUpdatesAlert,
  };

  // Toggles that can't be enabled given the account state. Email updates require
  // an email on the record.
  const toggleDisabled: Partial<Record<ToggleKey, boolean>> = {
    emailUpdates: !hasEmail,
  };

  // Map UI toggle keys to API preference fields
  const TOGGLE_TO_PREF: Record<ToggleKey, UserPreferencesKeys> = {
    emailUpdates: 'contact_preference',
    feedbackTesting: 'feedback_preference',
    betaFeatures: 'beta',
    aiSearch: 'ai_toggle_preference',
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
