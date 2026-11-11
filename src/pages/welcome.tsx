/**
 * Welcome Page, shown to signed-in users until they complete onboarding
 * (`onboarding_complete` on their profile). Protected route requiring
 * authentication.
 */

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
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
  PreferencesForm,
  PreferencesFormSection,
  SettingsSection,
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

const TOGGLE_SECTIONS: PreferencesFormSection[] = [
  {
    title: WELCOME_COPY.sections.updates.title,
    subtitle: WELCOME_COPY.sections.updates.subtitle,
    toggleKeys: ['emailUpdates', 'feedbackTesting', 'betaFeatures'],
  },
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

const WelcomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { account, hasLoadedProfile, onboardingComplete } = useUserData();

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

  // Return the user to where they started the sign-up flow.
  const handleSaved = () => {
    const returnTo = sessionStorage.getItem(AUTH_RETURN_TO_KEY);
    sessionStorage.removeItem(AUTH_RETURN_TO_KEY);
    router.replace(returnTo && returnTo !== WELCOME_PATH ? returnTo : '/');
  };

  if (!IS_WELCOME_ENABLED) return null;

  const { manage } = WELCOME_COPY.sections;

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
        <SettingsSection title={manage.title}>
          <UnorderedList spacing={2} color='gray.800'>
            {manage.items.map((item, i) => (
              <BulletItem key={i}>{item}</BulletItem>
            ))}
          </UnorderedList>
        </SettingsSection>

        {/* Communication preferences */}
        <PreferencesForm
          sections={TOGGLE_SECTIONS}
          // Users who've already onboarded see their saved choices; first-time
          // users start from the opt-in defaults.
          initialValues={
            onboardingComplete === true
              ? undefined
              : DEFAULT_WELCOME_PREFERENCES
          }
          saveLabel={WELCOME_COPY.saveButton}
          saveOptions={{ completeOnboarding: true }}
          // Saving also completes onboarding, so it's meaningful unchanged.
          allowUnchangedSave
          onSaved={handleSaved}
        />
      </Box>
    </PageContainer>
  );
};

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(WelcomePage);
