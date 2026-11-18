import { useAuth } from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/useUserData';
import { getSignInMethod } from 'src/utils/auth/helpers';

/**
 * How the signed-in user logged in: an `id` for `ProviderIcon` and a display
 * `label` (see `getSignInMethod`).
 *
 * `isReady` is false until the method is known. NIH Login (Okta) users are
 * described by the method they picked there (`idp`), which only arrives with
 * the profile, so wait for it rather than flashing "Okta" first.
 */
export function useSignInMethod() {
  const { user } = useAuth();
  const { account, hasLoadedProfile } = useUserData();

  const providerId = user?.oauth_provider || account?.oauth_provider || '';
  const { id, label } = getSignInMethod(providerId, account?.idp);
  const isReady =
    Boolean(providerId) &&
    (providerId.toLowerCase() !== 'okta' || hasLoadedProfile);

  return { id, label, isReady };
}
