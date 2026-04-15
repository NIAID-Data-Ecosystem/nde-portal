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
          <Link color='blue.600' textDecoration='underline'>
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
}: {
  label: string;
  description: ReactNode;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  showBorder?: boolean;
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
      </VStack>
      <Switch
        colorScheme='primary'
        isChecked={isChecked}
        onChange={e => onChange(e.target.checked)}
      />
    </HStack>
  );
}

function UserSettingsPage() {
  const { logout } = useAuth();
  const { preferences, updatePreferenceField } = useUserData();

  // Map UI toggle keys to API preference fields
  const TOGGLE_TO_PREF: Record<
    ToggleKey,
    'contact_preference' | 'beta' | 'ai_toggle_preference'
  > = {
    emailUpdates: 'contact_preference',
    feedbackTesting: 'contact_preference',
    betaFeatures: 'beta',
    aiSearch: 'ai_toggle_preference',
  };

  const getChecked = (key: ToggleKey) => preferences[TOGGLE_TO_PREF[key]];

  const updateSetting = (key: ToggleKey) => {
    updatePreferenceField(TOGGLE_TO_PREF[key]);
  };

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
