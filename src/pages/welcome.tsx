/**
 * Welcome Page, shown to signed-in users until they complete onboarding
 * (`onboarding_complete` on their profile). Protected route requiring
 * authentication.
 */

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Heading,
  Icon,
  IconProps,
  ListItem,
  ListIcon,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { FaCircle, FaRegBookmark } from 'react-icons/fa6';
import { useAuth } from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/useUserData';
import { UserPreferences } from 'src/hooks/useUserData/types';
import { WELCOME_PATH } from 'src/hooks/useUserData/useWelcomeRedirect';
import { withAuth } from 'src/components/auth/withAuth';
import { ProviderIcon } from 'src/components/auth/provider-icon';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import {
  getEmailToggleState,
  SettingToggle,
  TOGGLE_TO_PREF,
  TOGGLES_COPY,
  ToggleKey,
} from 'src/components/settings';
import { getSignInMethod } from 'src/utils/auth/helpers';
import { ENABLE_AUTH, SHOW_WELCOME_PAGE } from 'src/utils/feature-flags';

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
  <ListItem>
    <ListIcon as={FaCircle} aria-hidden='true' m={1.5} mr={2} boxSize={1} />
    {children}
  </ListItem>
);

interface SectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  gap?: number;
  children: ReactNode;
}

/** Heading + optional subtitle + content, with consistent spacing. */
const Section = ({ title, subtitle, gap = 2, children }: SectionProps) => (
  <VStack alignItems='start' gap={gap} w='full' mb={8}>
    <Heading
      as='h2'
      size='md'
      fontWeight='semibold'
      mb={subtitle ? 1 : undefined}
    >
      {title}
    </Heading>
    {subtitle && (
      <Text color='gray.800' fontSize='sm' mb={2}>
        {subtitle}
      </Text>
    )}
    {children}
  </VStack>
);

const WelcomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    account,
    error,
    hasLoadedProfile,
    onboardingComplete,
    preferences,
    savePreferences,
  } = useUserData();

  // Toggles only change local state; nothing is persisted until Save Settings.
  const [selected, setSelected] = useState(DEFAULT_WELCOME_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);

  // Once the profile loads, show the user's saved choices if they've already
  // been through onboarding. First-time users keep the opt-in defaults. Seed
  // only once so later preference updates never overwrite in-progress edits.
  const hasSeededRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedProfile || hasSeededRef.current) return;
    hasSeededRef.current = true;
    if (onboardingComplete === true) {
      setSelected({
        contact_preference: preferences.contact_preference,
        feedback_preference: preferences.feedback_preference,
        beta: preferences.beta,
      });
    }
  }, [hasLoadedProfile, onboardingComplete, preferences]);

  // If the page is disabled via feature flag, redirect to home page
  useEffect(() => {
    if (!IS_WELCOME_ENABLED) router.replace('/');
  }, [router]);

  const providerId = user?.oauth_provider || account?.oauth_provider || '';
  const { id: methodId, label: methodLabel } = getSignInMethod(
    providerId,
    account?.idp,
  );
  // Okta's sign-in method (idp) comes from the profile, so wait for it rather
  // than flashing "Okta" first.
  const showProvider =
    Boolean(providerId) &&
    (providerId.toLowerCase() !== 'okta' || hasLoadedProfile);
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
        <VStack alignItems='start' gap={4} mb={8}>
          <Heading as='h1' size='xl' fontWeight='bold'>
            {WELCOME_COPY.page.title}
          </Heading>
          {showProvider && (
            <Text color='gray.800' fontSize='md'>
              {WELCOME_COPY.provider.loggedInWith}{' '}
              <ProviderIcon providerId={methodId} verticalAlign='-0.25em' />{' '}
              {methodLabel}. {WELCOME_COPY.provider.useEveryTime(methodLabel)}
            </Text>
          )}
        </VStack>

        {/* Saved items guidance */}
        <Section title={manage.title}>
          <UnorderedList spacing={2} color='gray.800'>
            {manage.items.map((item, i) => (
              <BulletItem key={i}>{item}</BulletItem>
            ))}
          </UnorderedList>
        </Section>

        {/* Communication preferences */}
        <Section title={updates.title} subtitle={updates.subtitle} gap={0}>
          <VStack alignItems='start' gap={0} w='full'>
            {TOGGLE_KEYS.map((key, index) => (
              <SettingToggle
                key={key}
                {...TOGGLES_COPY[key]}
                isChecked={isChecked(key)}
                onChange={checked => handleToggle(key, checked)}
                showBorder={index < TOGGLE_KEYS.length - 1}
                {...(key === 'emailUpdates' && {
                  alert: emailToggle.alert,
                  isDisabled: emailToggle.isDisabled,
                })}
              />
            ))}
          </VStack>
        </Section>

        {error && (
          <Text color='red.600' fontSize='sm' mb={4} role='alert'>
            {error}
          </Text>
        )}

        <Button
          colorScheme='primary'
          onClick={handleSave}
          // Don't let a save send defaults before the real values have loaded.
          isDisabled={!hasLoadedProfile}
          isLoading={isSaving}
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
