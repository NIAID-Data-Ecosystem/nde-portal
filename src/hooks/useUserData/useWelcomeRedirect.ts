import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AUTH_LOGIN_PENDING_KEY, useAuth } from 'src/hooks/useAuth';
import { ENABLE_AUTH, SHOW_WELCOME_PAGE } from 'src/utils/feature-flags';
import { isNewAccount } from './helpers';
import { useUserData } from './index';

export const WELCOME_PATH = '/welcome';

/**
 * Final step of the sign-up flow: once a login completes, send brand-new
 * accounts to the welcome page. `auth_return_to` is left untouched so the
 * welcome page can return the user to where they started.
 */
export function useWelcomeRedirect() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { account } = useUserData();

  useEffect(() => {
    if (!SHOW_WELCOME_PAGE || !ENABLE_AUTH || isLoading) return;
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(AUTH_LOGIN_PENDING_KEY) !== 'true') return;

    // Login didn't complete (e.g. cancelled at the provider).
    if (!isAuthenticated) {
      sessionStorage.removeItem(AUTH_LOGIN_PENDING_KEY);
      return;
    }

    // Wait for the /user/data profile, which carries the created/updated dates.
    if (!account) return;

    sessionStorage.removeItem(AUTH_LOGIN_PENDING_KEY);
    if (isNewAccount(account) && router.pathname !== WELCOME_PATH) {
      router.replace(WELCOME_PATH);
    }
  }, [account, isAuthenticated, isLoading, router]);
}

// Renderless wrapper so the hook can be mounted inside the providers in `_app`.
export function WelcomeRedirect() {
  useWelcomeRedirect();
  return null;
}
