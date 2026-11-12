/**
 * Read-only summary of the signed-in account for the Settings page: its email
 * (or that it has none) and how the user signs in.
 */

import { ReactNode } from 'react';
import { chakra, HStack, Skeleton } from '@chakra-ui/react';
import { ProviderIcon } from 'src/components/auth/provider-icon';
import { useAuth } from 'src/hooks/useAuth';
import { useSignInMethod } from 'src/hooks/useSignInMethod';
import { useUserData } from 'src/hooks/useUserData';
import { SettingsSection } from './settings-section';

export const ACCOUNT_DETAILS_COPY = {
  title: 'Account details',
  email: 'Email',
  noEmail: 'No email on record',
  signInMethod: 'Sign-in method',
};

interface AccountDetailProps {
  label: string;
  isLoading: boolean;
  /** Placeholder width while loading, roughly that of the expected value. */
  skeletonWidth: string;
  showBorder?: boolean;
  children: ReactNode;
}

/** One label/value pair, laid out like a settings toggle row. */
function AccountDetail({
  label,
  isLoading,
  skeletonWidth,
  showBorder,
  children,
}: AccountDetailProps) {
  return (
    <chakra.div
      py={4}
      w='full'
      {...(showBorder && { borderBottom: '1px', borderColor: 'gray.200' })}
    >
      <chakra.dt fontWeight='medium'>{label}</chakra.dt>
      <chakra.dd fontSize='sm' color='gray.800' mt={1} overflowWrap='anywhere'>
        {isLoading ? (
          // Inline, so it sits in a line of text and the row keeps the height
          // it will have once the value loads.
          <Skeleton
            display='inline-block'
            verticalAlign='middle'
            h='1.25em'
            w={skeletonWidth}
            maxW='full'
          />
        ) : (
          children
        )}
      </chakra.dd>
    </chakra.div>
  );
}

export function AccountDetails() {
  const { user } = useAuth();
  const { account, hasLoadedProfile } = useUserData();
  const method = useSignInMethod();

  // The profile's email is the one the email settings check, so prefer it,
  // even when it's empty, to agree with their "no email on record" alert. Fall
  // back to the session's email only if the profile failed to load.
  const email = account ? account.email : user?.email;

  const showMethod = method.isReady || !hasLoadedProfile;

  return (
    <SettingsSection title={ACCOUNT_DETAILS_COPY.title} mb={4}>
      <chakra.dl w='full' aria-busy={!hasLoadedProfile}>
        <AccountDetail
          label={ACCOUNT_DETAILS_COPY.email}
          // Whether there's an email is only known once the profile loads.
          isLoading={!hasLoadedProfile}
          skeletonWidth='14rem'
          showBorder={showMethod}
        >
          {email || ACCOUNT_DETAILS_COPY.noEmail}
        </AccountDetail>
        {showMethod && (
          <AccountDetail
            label={ACCOUNT_DETAILS_COPY.signInMethod}
            isLoading={!method.isReady}
            skeletonWidth='7rem'
          >
            <HStack as='span' gap={2}>
              <ProviderIcon providerId={method.id} boxSize={4} />
              <span>{method.label}</span>
            </HStack>
          </AccountDetail>
        )}
      </chakra.dl>
    </SettingsSection>
  );
}
