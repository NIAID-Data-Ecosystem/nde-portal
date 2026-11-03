/**
 * Welcome Page, shown to signed-in users until they complete onboarding
 * (`onboarding_complete` on their profile). Protected route requiring
 * authentication.
 */

import {
  Box,
  Button,
  Heading,
  Icon,
  IconProps,
  List,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { FaCircle, FaRegBookmark } from 'react-icons/fa6';
import { ProviderIcon } from 'src/components/auth/provider-icon';
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
import { UserPreferences } from 'src/hooks/useUserData/types';
import { WELCOME_PATH } from 'src/hooks/useUserData/useWelcomeRedirect';
import { getProviderLabel } from 'src/utils/auth/helpers';
import { ENABLE_AUTH, SHOW_WELCOME_PAGE } from 'src/utils/feature-flags';

import { SettingsSection } from './settings';

const IS_WELCOME_ENABLED = SHOW_WELCOME_PAGE && ENABLE_AUTH;
const AUTH_RETURN_TO_KEY = 'auth_return_to';

const SemiBold = ({ children }: { children: ReactNode }) => (
  <Text as='span' fontWeight='semibold'>
    {children}
  </Text>
);

const BookmarkIcon = (props: IconProps) => (
  <Icon
    as={FaRegBookmark}
    aria-hidden='true'
    verticalAlign='-0.15em'
    strokeWidth='20'
    {...props}
  />
);

const WELCOME_COPY = {
  page: {
    title: 'Welcome',
  },
  provider: {
    loggedInWith: 'You logged in with',
    useEveryTime: (label: string) =>
      `Use your ${label} account every time to see saved items.`,
  },
  sections: {
    manage: {
      title: 'Manage your searches',
      items: [
        <>
          To save a search, use the bookmark icon <BookmarkIcon /> on any search
          results page.
        </>,
        <>
          To save a resource, use the{' '}
          <Text as='span' fontWeight='semibold' whiteSpace='nowrap'>
            <BookmarkIcon stroke='currentColor' /> Save
          </Text>{' '}
          button.
        </>,
        <>
          Find saved items in <SemiBold>Saved Searches</SemiBold>.
        </>,
      ] as ReactNode[],
    },
    updates: {
      title: 'Set your preferences',
      subtitle: (
        <>
          You can change your preferences at any time in{' '}
          <SemiBold>Account Settings</SemiBold>.
        </>
      ),
    },
  },
  saveButton: 'Save Settings',
};

const TOGGLE_KEYS: ToggleKey[] = [
  'emailUpdates',
  'feedbackTesting',
  'betaFeatures',
];

// Email Updates and Feedback and Testing are opted in by default.
const DEFAULT_WELCOME_PREFERENCES: Partial<UserPreferences> = {
  contact_preference: true,
  feedback_preference: true,
  beta: false,
};

const BulletItem = ({ children }: { children: ReactNode }) => (
  <List.Item>
    <List.Indicator as={FaCircle} boxSize={1} aria-hidden='true' />
    {children}
  </List.Item>
);

interface SectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  gap?: number;
  children: ReactNode;
}

const WelcomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { account, error, savePreferences } = useUserData();

  // Toggles only change local state; nothing is persisted until Save Settings.
  const [selected, setSelected] = useState(DEFAULT_WELCOME_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  // If the page is disabled via feature flag, redirect to home page
  useEffect(() => {
    if (!IS_WELCOME_ENABLED) router.replace('/');
  }, [router]);

  const providerId = user?.oauth_provider || account?.oauth_provider || '';
  const providerLabel = getProviderLabel(providerId.toLowerCase());
  const emailToggle = getEmailToggleState(account);

  const handleToggle = useCallback((key: ToggleKey, checked: boolean) => {
    setSelected(prev => ({ ...prev, [TOGGLE_TO_PREF[key]]: checked }));
  }, []);

  const isChecked = (key: ToggleKey) =>
    // Email updates can't be on without an email on the record.
    key === 'emailUpdates' && emailToggle.isDisabled
      ? false
      : Boolean(selected[TOGGLE_TO_PREF[key]]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await savePreferences(
      {
        ...selected,
        contact_preference:
          !emailToggle.isDisabled && Boolean(selected.contact_preference),
      },
      { completeOnboarding: true },
    );
    setIsSaving(false);

    if (!result?.ok) return;

    // Return the user to where they started the sign-up flow.
    const returnTo = sessionStorage.getItem(AUTH_RETURN_TO_KEY);
    sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
    router.replace(returnTo && returnTo !== WELCOME_PATH ? returnTo : '/');
  };

  if (!IS_WELCOME_ENABLED) return null;

  const { manage, updates } = WELCOME_COPY.sections;

  return (
    <PageContainer meta={getPageSeoConfig('/welcome')} px={0} py={0}>
      <Box
        maxW='2xl'
        mx='auto'
        my={{ base: 6, md: 12 }}
        px={{ base: 4, md: 0 }}
      >
        {/* Header */}
        <VStack alignItems='start' mb={6}>
          <Heading as='h1' size='xl' fontWeight='bold'>
            {WELCOME_COPY.page.title}
          </Heading>
          {providerId && (
            <Text fontSize='md'>
              {WELCOME_COPY.provider.loggedInWith}{' '}
              <ProviderIcon providerId={providerId} verticalAlign='-0.25em' />{' '}
              {providerLabel}.{' '}
              {WELCOME_COPY.provider.useEveryTime(providerLabel)}
            </Text>
          )}

          {/* Saved items guidance */}
          <SettingsSection title={manage.title}>
            <List.Root as='ul' gap={2}>
              {manage.items.map((item, i) => (
                <BulletItem key={i}>{item}</BulletItem>
              ))}
            </List.Root>
          </SettingsSection>

          {/* Communication preferences */}
          <SettingsSection title={updates.title} subtitle={updates.subtitle}>
            {TOGGLE_KEYS.map((key, index) => (
              <SettingToggle
                key={key}
                {...TOGGLES_COPY[key]}
                checked={isChecked(key)}
                onCheckedChange={e => handleToggle(key, e.checked)}
                showBorder={index < TOGGLE_KEYS.length - 1}
                {...(key === 'emailUpdates' && {
                  alert: emailToggle.alert,
                  disabled: emailToggle.isDisabled,
                })}
              />
            ))}
          </SettingsSection>
        </VStack>

        {error && (
          <Text color='red.600' fontSize='sm' mb={4} role='alert'>
            {error}
          </Text>
        )}

        <Button
          colorScheme='primary'
          onClick={handleSave}
          loading={isSaving}
          loadingText='Saving'
        >
          {WELCOME_COPY.saveButton}
        </Button>
      </Box>
    </PageContainer>
  );
};

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(WelcomePage);
