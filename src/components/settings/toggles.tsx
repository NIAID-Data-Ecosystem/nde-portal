/**
 * A single user preference toggle, its copy, and the mapping from toggle keys
 * to API preference fields.
 */

import { Box, HStack, Link, Switch, Text, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { UserAccount, UserPreferencesKeys } from 'src/hooks/useUserData/types';

export const TOGGLES_COPY = {
  emailUpdates: {
    label: 'Email updates',
    description:
      'Get monthly emails about new features and updates to the Discovery Portal.',
  },
  feedbackTesting: {
    label: 'Feedback and testing',
    description:
      'Help improve the NIAID Data Ecosystem by getting occasional emails to participate in feedback and usability testing sessions.',
  },
  betaFeatures: {
    label: 'Beta features',
    description: 'Receive emails to try experimental features.',
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
};

// Shown above the email toggles when the account has no email on record.
export const EMAIL_REQUIRED_COPY = {
  missingEmail: (
    <>
      These communication settings are unavailable because your account does not
      have an email address on record. Please add an email to your account to
      enable them.
    </>
  ),
  missingOrcidEmail: (
    <>
      We couldn’t access a public email address from your ORCID record. To
      enable these communication settings, your ORCID record must include a
      verified email address with visibility set to{' '}
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
};

export type ToggleKey =
  | 'emailUpdates'
  | 'feedbackTesting'
  | 'betaFeatures'
  | 'aiSearch';

// Map UI toggle keys to API preference fields
export const TOGGLE_TO_PREF: Record<ToggleKey, UserPreferencesKeys> = {
  emailUpdates: 'contact_preference',
  feedbackTesting: 'feedback_preference',
  betaFeatures: 'beta',
  aiSearch: 'ai_toggle_preference',
};

// Toggles that send the user emails, so they need an email on the record.
export const EMAIL_TOGGLE_KEYS: ToggleKey[] = [
  'emailUpdates',
  'feedbackTesting',
  'betaFeatures',
];

// The email toggles require an email on the record. When one is missing they
// are disabled and an explanatory alert is shown — ORCID accounts get a
// variant pointing them to their ORCID email visibility settings.
//
// `account` is null until the profile loads, and stays null if it fails to
// load. The email is unknown rather than missing then, so the toggles stay
// disabled but there's no alert claiming the account has no email.
export const getEmailToggleState = (account: UserAccount | null) => {
  const hasEmail = Boolean(account?.email);
  // NIH Login users who signed in through ORCID have idp 'orcid'.
  const isOrcid =
    account?.oauth_provider?.toUpperCase() === 'ORCID' ||
    account?.idp === 'orcid';

  const alert: ReactNode =
    !account || hasEmail
      ? undefined
      : isOrcid
      ? EMAIL_REQUIRED_COPY.missingOrcidEmail
      : EMAIL_REQUIRED_COPY.missingEmail;

  return { hasEmail, alert, isDisabled: !hasEmail };
};

/** Explains why some settings are unavailable. */
export function SettingAlert({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <Box
      id={id}
      bg='orange.50'
      border='1px'
      borderColor='orange.200'
      borderRadius='md'
      px={3}
      py={2}
      mt={2}
      w='full'
    >
      <Text fontSize='sm' color='orange.800' lineHeight='short'>
        {children}
      </Text>
    </Box>
  );
}

export function SettingToggle({
  label,
  description,
  isChecked,
  onChange,
  showBorder,
  isDisabled,
  describedBy,
}: {
  label: string;
  description: ReactNode;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  showBorder?: boolean;
  isDisabled?: boolean;
  /** Id of an element explaining the toggle, e.g. why it's disabled. */
  describedBy?: string;
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
      <Switch.Root
        colorPalette='primary'
        checked={isChecked}
        onCheckedChange={e => onChange(e.checked)}
        disabled={isDisabled}
        aria-label={label}
        aria-describedby={describedBy}
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </HStack>
  );
}
