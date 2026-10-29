/**
 * Shared user preference toggles used by the Settings and Welcome pages.
 */

import { ReactNode } from 'react';
import { Box, HStack, Link, Switch, Text, VStack } from '@chakra-ui/react';
import { UserAccount, UserPreferencesKeys } from 'src/hooks/useUserData/types';

export const TOGGLES_COPY = {
  emailUpdates: {
    label: 'Email Updates',
    description:
      'Get monthly emails about new features and updates to the Discovery Portal.',

    alerts: {
      missingEmail: (
        <>
          Email updates are unavailable because your account does not have an
          email address on record. Please add an email to your account to enable
          this setting.
        </>
      ),
      missingOrcidEmail: (
        <>
          We couldn’t access a public email address from your ORCID record. To
          enable email updates, your ORCID record must include a verified email
          address with visibility set to{' '}
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
      'Help improve the NIAID Data Ecosystem by getting occasional invitations to participate in feedback and usability testing sessions.',
  },
  betaFeatures: {
    label: 'Beta features',
    description: 'Receive invitations to try experimental features.',
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

// Email updates require an email on the record. When one is missing the toggle
// is disabled and an explanatory alert is shown — ORCID accounts get a variant
// pointing them to their ORCID email visibility settings.
export const getEmailToggleState = (account: UserAccount | null) => {
  const hasEmail = Boolean(account?.email);
  const isOrcid = account?.oauth_provider?.toUpperCase() === 'ORCID';

  const alert: ReactNode = hasEmail
    ? undefined
    : isOrcid
    ? TOGGLES_COPY.emailUpdates.alerts.missingOrcidEmail
    : TOGGLES_COPY.emailUpdates.alerts.missingEmail;

  return { hasEmail, alert, isDisabled: !hasEmail };
};

export function SettingToggle({
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
